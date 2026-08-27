import { describe, it, expect } from "vitest";
import { analyzeStructure } from "@/lib/analyzers/structure";
import type { FileNode } from "@/lib/types";

describe("analyzeStructure", () => {
  const makeFiles = (paths: string[]): FileNode[] =>
    paths.map((p) => ({
      name: p.split("/").pop() || "",
      path: p,
      type: (p.includes(".") ? "file" : "dir") as "file" | "dir",
    }));

  it("detects a Next.js frontend", () => {
    const files = makeFiles([
      "package.json",
      "tsconfig.json",
      "next.config.js",
      "src/app/page.tsx",
      "src/components/Button.tsx",
      "public/logo.svg",
    ]);
    const result = analyzeStructure(files, { TypeScript: 5000, JavaScript: 2000 });
    expect(result.hasFrontend).toBe(true);
    expect(result.detectedTechnologies).toContain("Next.js");
    expect(result.detectedTechnologies).toContain("TypeScript");
    expect(result.architecture).toBe("Frontend Application");
  });

  it("detects a full-stack application", () => {
    const files = makeFiles([
      "package.json",
      "src/app/page.tsx",
      "src/server/api.ts",
      "src/controllers/user.ts",
    ]);
    const result = analyzeStructure(files, { TypeScript: 8000 });
    expect(result.hasFrontend).toBe(true);
    expect(result.hasBackend).toBe(true);
    expect(result.architecture).toBe("Full-Stack Application");
  });

  it("detects Python backend", () => {
    const files = makeFiles([
      "requirements.txt",
      "app.py",
      "src/routes.py",
      "tests/test_app.py",
    ]);
    const result = analyzeStructure(files, { Python: 3000 });
    expect(result.hasBackend).toBe(true);
    expect(result.detectedTechnologies).toContain("Python");
  });

  it("categorizes files correctly", () => {
    const files = makeFiles([
      "README.md",
      "LICENSE",
      "CONTRIBUTING.md",
      ".env",
      "package.json",
      "package-lock.json",
      "Dockerfile",
      "docker-compose.yml",
      ".github/workflows/ci.yml",
      "tsconfig.json",
      "src/__tests__/main.test.ts",
      "src/main.test.ts",
    ]);

    const result = analyzeStructure(files, {});

    expect(result.documentationFiles.some((f) => f.includes("README.md"))).toBe(true);
    expect(result.environmentFiles.some((f) => f.includes(".env"))).toBe(true);
    expect(result.packageFiles.some((f) => f.includes("package.json"))).toBe(true);
    expect(result.dockerFiles.length).toBeGreaterThan(0);
    expect(result.ciFiles.length).toBeGreaterThan(0);
    expect(result.testFiles.length).toBeGreaterThan(0);
  });

  it("handles empty repository", () => {
    const result = analyzeStructure([], {});
    expect(result.files).toEqual([]);
    expect(result.detectedTechnologies).toEqual([]);
    expect(result.languages).toEqual({});
  });
});
