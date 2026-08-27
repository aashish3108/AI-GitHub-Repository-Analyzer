import { z } from "zod";

export const githubUrlSchema = z.string().url("Invalid URL format");

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
}

export function parseGitHubUrl(url: string): ParsedGitHubUrl {
  try {
    // Validate URL format
    githubUrlSchema.parse(url);

    const urlObj = new URL(url);

    // Check if it's a GitHub URL
    if (urlObj.hostname !== "github.com" && urlObj.hostname !== "www.github.com") {
      throw new Error("URL must be from github.com");
    }

    // Parse path: /owner/repo
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    if (pathParts.length < 2) {
      throw new Error("Invalid GitHub repository URL format");
    }

    const owner = pathParts[0];
    const repo = pathParts[1];

    if (!owner || !repo) {
      throw new Error("Invalid GitHub repository URL format");
    }

    return { owner, repo };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid URL format");
    }
    throw error;
  }
}

export function validateRepositoryUrl(url: string): { valid: boolean; error?: string } {
  try {
    if (!url || url.trim() === "") {
      return { valid: false, error: "Repository URL is required" };
    }

    parseGitHubUrl(url);
    return { valid: true };
  } catch (error) {
    if (error instanceof Error) {
      return { valid: false, error: error.message };
    }
    return { valid: false, error: "Invalid repository URL" };
  }
}
