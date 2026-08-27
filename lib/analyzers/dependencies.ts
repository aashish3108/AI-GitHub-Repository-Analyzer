import type { FileNode, DependencyAnalysis, DependencyInfo } from "../types";
import { fetchFileContent } from "../github";

export async function analyzeDependencies(
  owner: string,
  repo: string,
  files: FileNode[]
): Promise<DependencyAnalysis> {
  const dependencies: DependencyInfo[] = [];
  const suspiciousPatterns: string[] = [];
  const recommendations: string[] = [];
  let packageManager: string | null = null;
  let hasLockfile = false;

  // Detect package manager and lockfile
  const fileNames = files.map((f) => f.name.toLowerCase());

  if (fileNames.includes("package-lock.json")) {
    packageManager = "npm";
    hasLockfile = true;
  } else if (fileNames.includes("yarn.lock")) {
    packageManager = "yarn";
    hasLockfile = true;
  } else if (fileNames.includes("pnpm-lock.yaml")) {
    packageManager = "pnpm";
    hasLockfile = true;
  } else if (fileNames.includes("poetry.lock") || fileNames.includes("pipfile.lock")) {
    packageManager = "python";
    hasLockfile = true;
  } else if (fileNames.includes("cargo.lock")) {
    packageManager = "cargo";
    hasLockfile = true;
  } else if (fileNames.includes("gemfile.lock")) {
    packageManager = "bundler";
    hasLockfile = true;
  } else if (fileNames.includes("composer.lock")) {
    packageManager = "composer";
    hasLockfile = true;
  } else if (fileNames.includes("go.sum")) {
    packageManager = "go";
    hasLockfile = true;
  }

  // Parse package.json
  const packageJsonFile = files.find((f) => f.name.toLowerCase() === "package.json");
  if (packageJsonFile) {
    const content = await fetchFileContent(owner, repo, packageJsonFile.path);
    if (content) {
      try {
        const packageJson = JSON.parse(content);

        if (packageJson.dependencies) {
          for (const [name, version] of Object.entries(packageJson.dependencies)) {
            dependencies.push({
              name,
              version: String(version),
              type: "dependencies",
            });
          }
        }

        if (packageJson.devDependencies) {
          for (const [name, version] of Object.entries(packageJson.devDependencies)) {
            dependencies.push({
              name,
              version: String(version),
              type: "devDependencies",
            });
          }
        }

        // Check for outdated version patterns
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        for (const [name, version] of Object.entries(allDeps)) {
          const versionStr = String(version);
          if (versionStr.startsWith("^0.") || versionStr.startsWith("~0.")) {
            // Could be outdated, but not necessarily suspicious
          }
          if (versionStr.includes("*") || versionStr === "latest") {
            suspiciousPatterns.push(`Dependency "${name}" uses unstable version: ${versionStr}`);
          }
        }
      } catch {
        recommendations.push("Could not parse package.json");
      }
    }
  }

  // Parse requirements.txt
  const requirementsFile = files.find((f) => f.name.toLowerCase() === "requirements.txt");
  if (requirementsFile) {
    const content = await fetchFileContent(owner, repo, requirementsFile.path);
    if (content) {
      const lines = content.split("\n").filter((line) => line.trim() && !line.startsWith("#"));
      for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9_-]+)(?:[=<>!~]+(.+))?/);
        if (match) {
          dependencies.push({
            name: match[1],
            version: match[2] || "latest",
            type: "dependencies",
          });
        }
      }
    }
  }

  // Parse go.mod
  const goModFile = files.find((f) => f.name.toLowerCase() === "go.mod");
  if (goModFile) {
    const content = await fetchFileContent(owner, repo, goModFile.path);
    if (content) {
      const requireBlock = content.match(/require \(([\s\S]*?)\)/);
      if (requireBlock) {
        const lines = requireBlock[1].split("\n").filter((line) => line.trim());
        for (const line of lines) {
          const match = line.match(/^\s*([^\s]+)\s+([^\s]+)/);
          if (match) {
            dependencies.push({
              name: match[1],
              version: match[2],
              type: "dependencies",
            });
          }
        }
      }
    }
  }

  // Generate recommendations
  if (!hasLockfile && dependencies.length > 0) {
    recommendations.push("Add a lockfile to ensure reproducible builds");
  }

  if (dependencies.length === 0) {
    recommendations.push("No dependencies detected. This might be a minimal project or dependencies are not properly declared.");
  }

  if (dependencies.length > 50) {
    recommendations.push("Large number of dependencies detected. Consider reviewing for unused dependencies.");
  }

  if (suspiciousPatterns.length > 0) {
    recommendations.push("Some dependencies use unstable version patterns. Consider pinning versions.");
  }

  return {
    packageManager,
    dependencies,
    totalDependencies: dependencies.length,
    hasLockfile,
    suspiciousPatterns,
    recommendations,
  };
}
