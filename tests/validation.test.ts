import { describe, it, expect } from "vitest";
import { parseGitHubUrl, validateRepositoryUrl } from "@/lib/validation";

describe("parseGitHubUrl", () => {
  it("parses a standard GitHub URL", () => {
    const result = parseGitHubUrl("https://github.com/vercel/next.js");
    expect(result).toEqual({ owner: "vercel", repo: "next.js" });
  });

  it("parses URL with trailing slash", () => {
    const result = parseGitHubUrl("https://github.com/facebook/react/");
    expect(result).toEqual({ owner: "facebook", repo: "react" });
  });

  it("parses URL with www prefix", () => {
    const result = parseGitHubUrl("https://www.github.com/tailwindlabs/tailwindcss");
    expect(result).toEqual({ owner: "tailwindlabs", repo: "tailwindcss" });
  });

  it("throws on non-GitHub URL", () => {
    expect(() => parseGitHubUrl("https://gitlab.com/user/repo")).toThrow(
      "URL must be from github.com"
    );
  });

  it("throws on URL without repo", () => {
    expect(() => parseGitHubUrl("https://github.com/vercel")).toThrow(
      "Invalid GitHub repository URL format"
    );
  });

  it("throws on invalid URL format", () => {
    expect(() => parseGitHubUrl("not-a-url")).toThrow();
  });
});

describe("validateRepositoryUrl", () => {
  it("returns valid for a correct URL", () => {
    const result = validateRepositoryUrl("https://github.com/vercel/next.js");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns error for empty input", () => {
    const result = validateRepositoryUrl("");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("required");
  });

  it("returns error for non-GitHub URL", () => {
    const result = validateRepositoryUrl("https://gitlab.com/user/repo");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("github.com");
  });

  it("returns error for invalid URL", () => {
    const result = validateRepositoryUrl("just some text");
    expect(result.valid).toBe(false);
  });
});
