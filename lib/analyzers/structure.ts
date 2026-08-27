import type { FileNode, StructureAnalysis } from "../types";

const FRONTEND_INDICATORS = [
  "react", "vue", "angular", "svelte", "next", "nuxt", "gatsby",
  "package.json", "vite.config", "webpack.config", "tsconfig.json",
  "components/", "pages/", "app/", "src/", "public/", "assets/",
];

const BACKEND_INDICATORS = [
  "server.js", "server.ts", "app.py", "main.py",
  "api/", "routes/", "controllers/", "middleware/",
  "requirements.txt", "pyproject.toml", "go.mod",
  "pom.xml", "build.gradle", "Cargo.toml", "Gemfile",
];

const CONFIG_EXTENSIONS = [".json", ".yaml", ".yml", ".toml", ".ini", ".env", ".config", ".rc"];
const DOC_EXTENSIONS = [".md", ".rst", ".txt"];
const TEST_PATTERNS = ["test", "spec", "__tests__", "tests/", "testing"];
const CI_PATTERNS = [".github/workflows", ".gitlab-ci.yml", ".travis.yml", "circleci", "azure-pipelines"];
const DOCKER_PATTERNS = ["Dockerfile", "docker-compose", ".dockerignore"];
const PACKAGE_FILES = [
  "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "requirements.txt", "Pipfile", "pyproject.toml", "setup.py", "poetry.lock",
  "go.mod", "go.sum", "pom.xml", "build.gradle", "Cargo.toml", "Cargo.lock",
  "Gemfile", "Gemfile.lock", "composer.json", "composer.lock",
];

export function analyzeStructure(
  files: FileNode[],
  languages: Record<string, number>
): StructureAnalysis {
  const importantFiles: string[] = [];
  const configurationFiles: string[] = [];
  const documentationFiles: string[] = [];
  const testFiles: string[] = [];
  const ciFiles: string[] = [];
  const dockerFiles: string[] = [];
  const environmentFiles: string[] = [];
  const packageFiles: string[] = [];

  for (const file of files) {
    if (file.type !== "file") continue;

    const name = file.name.toLowerCase();
    const path = file.path.toLowerCase();

    // Important files
    if (name === "readme.md" || name === "license" || name === "contributing.md") {
      importantFiles.push(file.path);
    }

    // Configuration files
    if (CONFIG_EXTENSIONS.some((ext) => name.endsWith(ext)) && !path.includes("node_modules")) {
      configurationFiles.push(file.path);
    }

    // Documentation files
    if (DOC_EXTENSIONS.some((ext) => name.endsWith(ext)) && path.includes("docs")) {
      documentationFiles.push(file.path);
    } else if (name === "readme.md" || name === "changelog.md" || name === "contributing.md") {
      documentationFiles.push(file.path);
    }

    // Test files
    if (TEST_PATTERNS.some((pattern) => path.includes(pattern) || name.includes(pattern))) {
      testFiles.push(file.path);
    }

    // CI files
    if (CI_PATTERNS.some((pattern) => path.includes(pattern))) {
      ciFiles.push(file.path);
    }

    // Docker files
    if (DOCKER_PATTERNS.some((pattern) => name.includes(pattern.toLowerCase()))) {
      dockerFiles.push(file.path);
    }

    // Environment files
    if (name.startsWith(".env") || name.includes("environment")) {
      environmentFiles.push(file.path);
    }

    // Package files
    if (PACKAGE_FILES.includes(name)) {
      packageFiles.push(file.path);
    }
  }

  const hasFrontend = files.some((f) =>
    FRONTEND_INDICATORS.some((ind) => f.path.toLowerCase().includes(ind.toLowerCase()))
  );

  const hasBackend = files.some((f) =>
    BACKEND_INDICATORS.some((ind) => f.path.toLowerCase().includes(ind.toLowerCase()))
  );

  const detectedTechnologies = detectTechnologies(files);
  const architecture = detectArchitecture(hasFrontend, hasBackend, detectedTechnologies);

  return {
    files,
    importantFiles,
    languages,
    hasFrontend,
    hasBackend,
    detectedTechnologies,
    configurationFiles,
    documentationFiles,
    testFiles,
    ciFiles,
    dockerFiles,
    environmentFiles,
    packageFiles,
    architecture,
  };
}

function detectTechnologies(files: FileNode[]): string[] {
  const technologies: Set<string> = new Set();
  const fileNames = files.map((f) => f.path.toLowerCase());

  // JavaScript/TypeScript ecosystem
  if (fileNames.includes("package.json")) {
    technologies.add("Node.js");

    // Check for specific frameworks in package.json content would require fetching
    // For now, detect based on directory structure
    if (fileNames.some((f) => f.includes("next.config"))) technologies.add("Next.js");
    if (fileNames.some((f) => f.includes("nuxt.config"))) technologies.add("Nuxt.js");
    if (fileNames.some((f) => f.includes("vite.config"))) technologies.add("Vite");
    if (fileNames.some((f) => f.includes("webpack.config"))) technologies.add("Webpack");
    if (fileNames.some((f) => f.includes("tsconfig.json"))) technologies.add("TypeScript");
    if (fileNames.some((f) => f.includes("tailwind.config"))) technologies.add("Tailwind CSS");
  }

  // Python ecosystem
  if (fileNames.some((f) => f.includes("requirements.txt") || f.includes("pyproject.toml") || f.includes("setup.py"))) {
    technologies.add("Python");
    if (fileNames.some((f) => f.includes("django"))) technologies.add("Django");
    if (fileNames.some((f) => f.includes("flask"))) technologies.add("Flask");
    if (fileNames.some((f) => f.includes("fastapi"))) technologies.add("FastAPI");
  }

  // Go
  if (fileNames.includes("go.mod")) technologies.add("Go");

  // Rust
  if (fileNames.includes("cargo.toml")) technologies.add("Rust");

  // Ruby
  if (fileNames.includes("gemfile")) technologies.add("Ruby");
  if (fileNames.some((f) => f.includes("rails"))) technologies.add("Rails");

  // PHP
  if (fileNames.includes("composer.json")) technologies.add("PHP");
  if (fileNames.some((f) => f.includes("laravel"))) technologies.add("Laravel");

  // Java
  if (fileNames.some((f) => f.includes("pom.xml") || f.includes("build.gradle"))) {
    technologies.add("Java");
    if (fileNames.some((f) => f.includes("spring"))) technologies.add("Spring");
  }

  // Docker
  if (fileNames.some((f) => f.includes("dockerfile"))) technologies.add("Docker");

  // CI/CD
  if (fileNames.some((f) => f.includes(".github/workflows"))) technologies.add("GitHub Actions");
  if (fileNames.some((f) => f.includes(".gitlab-ci.yml"))) technologies.add("GitLab CI");

  return Array.from(technologies);
}

function detectArchitecture(
  hasFrontend: boolean,
  hasBackend: boolean,
  technologies: string[]
): string {
  if (hasFrontend && hasBackend) {
    return "Full-Stack Application";
  } else if (hasFrontend) {
    return "Frontend Application";
  } else if (hasBackend) {
    return "Backend Service";
  } else if (technologies.includes("Docker")) {
    return "Containerized Application";
  } else {
    return "General Project";
  }
}
