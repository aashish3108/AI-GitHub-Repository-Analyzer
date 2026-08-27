import type { FileNode, CodeQualityAnalysis } from "../types";
import { fetchFileContent } from "../github";

export async function analyzeCodeQuality(
  owner: string,
  repo: string,
  files: FileNode[]
): Promise<CodeQualityAnalysis> {
  const sourceFiles = files.filter((f) => {
    if (f.type !== "file") return false;
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ["js", "jsx", "ts", "tsx", "py", "java", "go", "rs", "rb", "php"].includes(ext || "");
  });

  // Sample up to 10 source files for analysis
  const sampleFiles = sourceFiles.slice(0, 10);

  let organization = 60;
  let readability = 60;
  let maintainability = 60;
  let naming = 60;
  let errorHandling = 50;
  let modularity = 60;
  let documentation = 50;

  const explanations: string[] = [];

  // Analyze file structure
  const hasSrcDir = files.some((f) => f.path.startsWith("src/"));
  const hasLibDir = files.some((f) => f.path.startsWith("lib/"));
  const hasComponentsDir = files.some((f) => f.path.includes("components/"));

  if (hasSrcDir || hasLibDir) {
    organization += 15;
    explanations.push("✓ Well-organized source directory structure");
  } else {
    explanations.push("⚠ Consider organizing code into src/ or lib/ directories");
  }

  if (hasComponentsDir) {
    modularity += 15;
    explanations.push("✓ Modular component structure detected");
  }

  // Analyze sample files
  let totalComments = 0;
  let totalLines = 0;
  let hasErrorHandling = false;
  let hasTypes = false;

  for (const file of sampleFiles) {
    const content = await fetchFileContent(owner, repo, file.path);
    if (!content) continue;

    const lines = content.split("\n");
    totalLines += lines.length;

    // Count comments
    const commentLines = lines.filter(
      (line) => line.trim().startsWith("//") || line.trim().startsWith("#") || line.trim().startsWith("/*")
    ).length;
    totalComments += commentLines;

    // Check for error handling
    if (content.includes("try") || content.includes("catch") || content.includes("throw") || content.includes("except")) {
      hasErrorHandling = true;
    }

    // Check for TypeScript or type annotations
    if (file.name.endsWith(".ts") || file.name.endsWith(".tsx") || content.includes("interface ") || content.includes("type ")) {
      hasTypes = true;
    }
  }

  // Calculate scores based on analysis
  if (totalLines > 0) {
    const commentRatio = totalComments / totalLines;
    if (commentRatio > 0.1) {
      documentation += 20;
      explanations.push("✓ Good code documentation ratio");
    } else if (commentRatio < 0.05) {
      documentation -= 10;
      explanations.push("⚠ Limited code documentation");
    }
  }

  if (hasErrorHandling) {
    errorHandling += 25;
    explanations.push("✓ Error handling patterns detected");
  } else {
    explanations.push("⚠ Limited error handling detected");
  }

  if (hasTypes) {
    maintainability += 20;
    readability += 10;
    explanations.push("✓ Type safety implemented");
  } else {
    explanations.push("⚠ Consider adding type annotations");
  }

  // File size analysis
  const largeFiles = sampleFiles.filter((f) => (f.size || 0) > 10000);
  if (largeFiles.length > 0) {
    readability -= 10;
    maintainability -= 10;
    explanations.push("⚠ Some files may be too large (>10KB)");
  }

  // Calculate final score (weighted average)
  const score = Math.round(
    organization * 0.15 +
    readability * 0.15 +
    maintainability * 0.2 +
    naming * 0.1 +
    errorHandling * 0.15 +
    modularity * 0.15 +
    documentation * 0.1
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    organization: Math.min(100, organization),
    readability: Math.min(100, readability),
    maintainability: Math.min(100, maintainability),
    naming,
    errorHandling: Math.min(100, errorHandling),
    modularity: Math.min(100, modularity),
    documentation: Math.min(100, documentation),
    explanations,
  };
}
