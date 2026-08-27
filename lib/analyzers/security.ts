import type { FileNode, SecurityAnalysis, SecurityFinding } from "../types";
import { fetchFileContent } from "../github";

const SECRET_PATTERNS = [
  { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?[\w-]{20,}/i, severity: "high" as const, title: "Potential API Key" },
  { pattern: /(?:secret|password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]{8,}/i, severity: "high" as const, title: "Potential Secret/Password" },
  { pattern: /(?:token|auth)\s*[:=]\s*['"]?[\w-]{20,}/i, severity: "medium" as const, title: "Potential Token" },
  { pattern: /sk-[a-zA-Z0-9]{20,}/i, severity: "critical" as const, title: "OpenAI API Key Pattern" },
  { pattern: /ghp_[a-zA-Z0-9]{36}/i, severity: "critical" as const, title: "GitHub Personal Access Token" },
  { pattern: /AKIA[0-9A-Z]{16}/i, severity: "critical" as const, title: "AWS Access Key ID" },
  { pattern: /-----BEGIN (?:RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/i, severity: "critical" as const, title: "Private Key Detected" },
];

const SUSPICIOUS_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  "config.json",
  "credentials.json",
  "secrets.json",
];

export async function analyzeSecurity(
  owner: string,
  repo: string,
  files: FileNode[]
): Promise<SecurityAnalysis> {
  const findings: SecurityFinding[] = [];

  // Check for suspicious files in root
  for (const file of files) {
    if (file.type !== "file") continue;

    const fileName = file.name.toLowerCase();
    const path = file.path.toLowerCase();

    // Check if file is in suspicious list
    if (SUSPICIOUS_FILES.some((suspicious) => path.includes(suspicious))) {
      if (!path.includes(".env.example") && !path.includes(".env.template")) {
        findings.push({
          severity: "medium",
          title: "Sensitive Configuration File",
          description: `Found potentially sensitive file: ${file.name}`,
          file: file.path,
          recommendation: "Ensure this file is in .gitignore and never committed to version control",
        });
      }
    }

    // Check if .env files are properly gitignored
    if (fileName === ".gitignore") {
      const content = await fetchFileContent(owner, repo, file.path);
      if (content) {
        if (!content.includes(".env") && !content.includes(".env.local")) {
          findings.push({
            severity: "high",
            title: "Missing .env in .gitignore",
            description: "The .gitignore file does not exclude .env files",
            file: file.path,
            recommendation: "Add .env, .env.local, and .env.production to .gitignore",
          });
        }
      }
    }
  }

  // Sample and analyze source files for secrets
  const sourceFiles = files.filter((f) => {
    if (f.type !== "file") return false;
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ["js", "jsx", "ts", "tsx", "py", "java", "go", "rb", "php"].includes(ext || "");
  });

  const filesToCheck = sourceFiles.slice(0, 15);

  for (const file of filesToCheck) {
    const content = await fetchFileContent(owner, repo, file.path);
    if (!content) continue;

    // Check for secret patterns
    for (const { pattern, severity, title } of SECRET_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        // Mask the actual secret value
        const maskedValue = matches[0].substring(0, 10) + "********";

        findings.push({
          severity,
          title,
          description: `Potential ${title.toLowerCase()} detected: \`${maskedValue}\``,
          file: file.path,
          recommendation: "Remove hardcoded secrets and use environment variables instead. If this is a real secret, rotate it immediately.",
        });

        // Limit findings per file to avoid spam
        break;
      }
    }
  }

  // Check for missing security practices
  const hasLicense = files.some((f) => f.name.toLowerCase() === "license" || f.name.toLowerCase() === "license.md");
  const hasSecurityPolicy = files.some((f) =>
    f.path.toLowerCase().includes("security.md") || f.path.toLowerCase().includes(".github/security.md")
  );

  if (!hasSecurityPolicy) {
    findings.push({
      severity: "low",
      title: "No Security Policy",
      description: "Repository does not have a security policy file",
      recommendation: "Add a SECURITY.md file to explain how to report vulnerabilities",
    });
  }

  if (!hasLicense) {
    findings.push({
      severity: "informational",
      title: "No License File",
      description: "Repository does not have a license file",
      recommendation: "Add a LICENSE file to clarify usage rights",
    });
  }

  // Calculate score
  let score = 100;
  for (const finding of findings) {
    switch (finding.severity) {
      case "critical":
        score -= 25;
        break;
      case "high":
        score -= 15;
        break;
      case "medium":
        score -= 8;
        break;
      case "low":
        score -= 3;
        break;
      case "informational":
        score -= 1;
        break;
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    findings: findings.slice(0, 20), // Limit to top 20 findings
  };
}
