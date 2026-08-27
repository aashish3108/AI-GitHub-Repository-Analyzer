import type { FileNode, ReadmeAnalysis } from "../types";
import { fetchFileContent } from "../github";

export async function analyzeReadme(
  owner: string,
  repo: string,
  files: FileNode[]
): Promise<ReadmeAnalysis> {
  const readmeFile = files.find(
    (f) => f.name.toLowerCase() === "readme.md" || f.name.toLowerCase() === "readme.txt"
  );

  if (!readmeFile) {
    return {
      score: 0,
      hasDescription: false,
      hasInstallation: false,
      hasUsage: false,
      hasFeatures: false,
      hasScreenshots: false,
      hasConfiguration: false,
      hasContributing: false,
      hasLicense: false,
      recommendations: [
        "Add a README.md file to document your project",
        "Include installation instructions",
        "Add usage examples",
        "Document the project features",
      ],
    };
  }

  const content = await fetchFileContent(owner, repo, readmeFile.path);

  if (!content) {
    return {
      score: 10,
      hasDescription: false,
      hasInstallation: false,
      hasUsage: false,
      hasFeatures: false,
      hasScreenshots: false,
      hasConfiguration: false,
      hasContributing: false,
      hasLicense: false,
      recommendations: ["README file exists but could not be read"],
    };
  }

  const contentLower = content.toLowerCase();
  const recommendations: string[] = [];

  // Check for various sections
  const hasDescription = content.length > 100;
  const hasInstallation =
    contentLower.includes("installation") ||
    contentLower.includes("install") ||
    contentLower.includes("getting started") ||
    contentLower.includes("setup");

  const hasUsage =
    contentLower.includes("usage") ||
    contentLower.includes("how to use") ||
    contentLower.includes("example") ||
    content.includes("```");

  const hasFeatures =
    contentLower.includes("feature") ||
    contentLower.includes("## features") ||
    contentLower.includes("- [ ]") ||
    contentLower.includes("* ");

  const hasScreenshots =
    content.includes("![") ||
    content.includes("<img") ||
    contentLower.includes("screenshot") ||
    contentLower.includes("demo");

  const hasConfiguration =
    contentLower.includes("configuration") ||
    contentLower.includes("config") ||
    contentLower.includes("environment") ||
    contentLower.includes(".env");

  const hasContributing =
    contentLower.includes("contributing") ||
    contentLower.includes("contribution") ||
    contentLower.includes("pull request") ||
    files.some((f) => f.name.toLowerCase() === "contributing.md");

  const hasLicense =
    contentLower.includes("license") ||
    contentLower.includes("licensing") ||
    files.some((f) => f.name.toLowerCase() === "license" || f.name.toLowerCase() === "license.md");

  // Calculate score
  let score = 0;
  if (hasDescription) score += 15;
  if (hasInstallation) score += 20;
  if (hasUsage) score += 20;
  if (hasFeatures) score += 15;
  if (hasScreenshots) score += 10;
  if (hasConfiguration) score += 10;
  if (hasContributing) score += 5;
  if (hasLicense) score += 5;

  // Generate recommendations
  if (!hasInstallation) {
    recommendations.push("Add installation instructions");
  }
  if (!hasUsage) {
    recommendations.push("Add usage examples");
  }
  if (!hasFeatures) {
    recommendations.push("List project features");
  }
  if (!hasScreenshots) {
    recommendations.push("Add screenshots or demo links");
  }
  if (!hasConfiguration) {
    recommendations.push("Document configuration options");
  }
  if (!hasContributing) {
    recommendations.push("Add contributing guidelines");
  }
  if (!hasLicense) {
    recommendations.push("Add license information");
  }

  if (content.length < 500) {
    recommendations.push("Expand README with more detailed information");
  }

  return {
    score: Math.min(100, score),
    hasDescription,
    hasInstallation,
    hasUsage,
    hasFeatures,
    hasScreenshots,
    hasConfiguration,
    hasContributing,
    hasLicense,
    recommendations,
  };
}
