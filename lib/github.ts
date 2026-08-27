import type { RepositoryInfo, FileNode } from "./types";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoLens-AI-Analyzer",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHub<T>(endpoint: string): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, { headers: getHeaders() });

    if (response.status === 404) {
      throw new Error("Repository not found or is private");
    }

    if (response.status === 403) {
      const remaining = response.headers.get("X-RateLimit-Remaining");
      if (remaining === "0") {
        throw new Error("GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to .env");
      }
      throw new Error("GitHub API access forbidden");
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to GitHub API");
    }
    throw error;
  }
}

export async function fetchRepositoryInfo(
  owner: string,
  repo: string
): Promise<RepositoryInfo> {
  const data = await fetchGitHub<any>(`/repos/${owner}/${repo}`);

  return {
    name: data.name,
    owner: data.owner.login,
    description: data.description || "No description provided",
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    openIssues: data.open_issues_count,
    mainLanguage: data.language,
    license: data.license?.spdx_id || null,
    size: data.size,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    defaultBranch: data.default_branch,
    topics: data.topics || [],
    url: data.html_url,
  };
}

export async function fetchRepositoryTree(
  owner: string,
  repo: string,
  branch: string
): Promise<FileNode[]> {
  const data = await fetchGitHub<any>(
    `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );

  if (data.truncated) {
    console.warn("Repository tree was truncated");
  }

  return (data.tree || []).map((item: any) => ({
    name: item.path.split("/").pop() || "",
    path: item.path,
    type: item.type === "tree" ? "dir" : "file",
    size: item.size,
  }));
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const data = await fetchGitHub<any>(
      `/repos/${owner}/${repo}/contents/${path}`
    );

    if (data.encoding === "base64" && data.content) {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchLanguages(
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  try {
    return await fetchGitHub<Record<string, number>>(
      `/repos/${owner}/${repo}/languages`
    );
  } catch {
    return {};
  }
}

export async function fetchReadme(
  owner: string,
  repo: string
): Promise<string | null> {
  return fetchFileContent(owner, repo, "README.md");
}
