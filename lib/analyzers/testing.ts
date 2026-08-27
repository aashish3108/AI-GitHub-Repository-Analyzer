import type { FileNode, TestingAnalysis } from "../types";
import { fetchFileContent } from "../github";

export async function analyzeTesting(
  owner: string,
  repo: string,
  files: FileNode[]
): Promise<TestingAnalysis> {
  const testDirectories: string[] = [];
  const testingFrameworks: string[] = [];
  let hasUnitTests = false;
  let hasIntegrationTests = false;
  let hasE2ETests = false;
  let hasCI = false;
  const recommendations: string[] = [];

  const fileNames = files.map((f) => f.name.toLowerCase());
  const filePaths = files.map((f) => f.path.toLowerCase());

  // Detect test directories
  const testDirPatterns = ["test", "tests", "__tests__", "spec", "specs", "e2e", "integration"];
  for (const file of files) {
    if (file.type === "dir") {
      const dirName = file.name.toLowerCase();
      if (testDirPatterns.some((pattern) => dirName.includes(pattern))) {
        testDirectories.push(file.path);
      }
    }
  }

  // Detect test files
  const testFilePatterns = [".test.", ".spec.", "_test.", "_spec."];
  const testFiles = files.filter((f) =>
    f.type === "file" && testFilePatterns.some((pattern) => f.name.toLowerCase().includes(pattern))
  );

  // Detect testing frameworks from package.json
  const packageJsonFile = files.find((f) => f.name.toLowerCase() === "package.json");
  if (packageJsonFile) {
    const content = await fetchFileContent(owner, repo, packageJsonFile.path);
    if (content) {
      try {
        const packageJson = JSON.parse(content);
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (allDeps.jest || allDeps["@jest/core"]) {
          testingFrameworks.push("Jest");
          hasUnitTests = true;
        }
        if (allDeps.vitest) {
          testingFrameworks.push("Vitest");
          hasUnitTests = true;
        }
        if (allDeps.mocha) {
          testingFrameworks.push("Mocha");
          hasUnitTests = true;
        }
        if (allDeps.pytest || fileNames.includes("pytest.ini")) {
          testingFrameworks.push("pytest");
          hasUnitTests = true;
        }
        if (allDeps["react-testing-library"] || allDeps["@testing-library/react"]) {
          testingFrameworks.push("React Testing Library");
          hasUnitTests = true;
        }
        if (allDeps.cypress) {
          testingFrameworks.push("Cypress");
          hasE2ETests = true;
        }
        if (allDeps.playwright || allDeps["@playwright/test"]) {
          testingFrameworks.push("Playwright");
          hasE2ETests = true;
        }
        if (allDeps["@testing-library/jest-dom"]) {
          hasIntegrationTests = true;
        }

        // Check for test scripts
        if (packageJson.scripts) {
          if (packageJson.scripts.test || packageJson.scripts["test:unit"]) {
            hasUnitTests = true;
          }
          if (packageJson.scripts["test:e2e"] || packageJson.scripts["test:integration"]) {
            hasIntegrationTests = true;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  // Detect CI for testing
  const ciPatterns = [".github/workflows", ".gitlab-ci.yml", ".travis.yml", "circleci"];
  hasCI = files.some((f) =>
    ciPatterns.some((pattern) => f.path.toLowerCase().includes(pattern))
  );

  // Check for Python testing
  if (fileNames.includes("pytest.ini") || fileNames.includes("setup.cfg")) {
    if (!testingFrameworks.includes("pytest")) {
      testingFrameworks.push("pytest");
    }
    hasUnitTests = true;
  }

  // Calculate score
  let score = 0;

  if (testFiles.length > 0 || testDirectories.length > 0) {
    score += 30;
  }

  if (hasUnitTests) score += 25;
  if (hasIntegrationTests) score += 20;
  if (hasE2ETests) score += 15;
  if (hasCI) score += 10;

  // Generate recommendations
  if (testFiles.length === 0 && testDirectories.length === 0) {
    recommendations.push("Add unit tests for core functionality");
  }

  if (!hasUnitTests) {
    recommendations.push("Set up a testing framework (Jest, Vitest, pytest, etc.)");
  }

  if (!hasIntegrationTests && hasUnitTests) {
    recommendations.push("Add integration tests for component interactions");
  }

  if (!hasE2ETests && (hasUnitTests || hasIntegrationTests)) {
    recommendations.push("Add end-to-end tests with Cypress or Playwright");
  }

  if (!hasCI) {
    recommendations.push("Set up CI/CD to run tests automatically");
  }

  if (testFiles.length < 5 && testDirectories.length > 0) {
    recommendations.push("Increase test coverage with more test cases");
  }

  return {
    score: Math.min(100, score),
    hasUnitTests,
    hasIntegrationTests,
    hasE2ETests,
    testDirectories,
    testingFrameworks,
    hasCI,
    recommendations,
  };
}
