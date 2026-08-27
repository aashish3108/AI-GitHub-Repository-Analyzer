import OpenAI from "openai";
import type { AnalysisResult } from "./types";

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    });
  }

  return openaiClient;
}

export function isAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function generateAIReview(
  analysisData: Partial<AnalysisResult>
): Promise<AnalysisResult["aiReview"] | null> {
  const client = getClient();

  if (!client) {
    return generateFallbackReview(analysisData);
  }

  const prompt = buildAnalysisPrompt(analysisData);

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert software architect and code reviewer. Analyze GitHub repositories and provide professional, constructive feedback. Be specific and actionable. Format your response as JSON with the exact structure requested.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return generateFallbackReview(analysisData);
    }

    // Try to parse JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If JSON parsing fails, try to extract structured text
    }

    return parseTextReview(content);
  } catch (error) {
    console.error("AI review generation failed:", error);
    return generateFallbackReview(analysisData);
  }
}

function buildAnalysisPrompt(data: Partial<AnalysisResult>): string {
  return `Analyze this GitHub repository and provide a professional review:

Repository: ${data.repository?.name || "Unknown"}
Owner: ${data.repository?.owner || "Unknown"}
Description: ${data.repository?.description || "No description"}
Stars: ${data.repository?.stars || 0}
Forks: ${data.repository?.forks || 0}
Main Language: ${data.repository?.mainLanguage || "Unknown"}

Architecture: ${data.structure?.architecture || "Unknown"}
Technologies: ${(data.structure?.detectedTechnologies || []).join(", ")}

Code Quality Score: ${data.codeQuality?.score || 0}/100
Security Score: ${data.security?.score || 0}/100
Testing Score: ${data.testing?.score || 0}/100
README Score: ${data.readme?.score || 0}/100

Provide your analysis in the following JSON format:
{
  "executiveSummary": "2-3 sentence overview",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "technicalRecommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "architectureReview": "Paragraph about architecture quality",
  "developerExperience": "Paragraph about DX and setup",
  "productionReadiness": "Paragraph about production readiness with score estimate"
}`;
}

function parseTextReview(text: string): AnalysisResult["aiReview"] {
  return {
    executiveSummary: extractSection(text, "Executive Summary", "Strengths") || text.slice(0, 200),
    strengths: extractList(text, "Strengths", "Weaknesses"),
    weaknesses: extractList(text, "Weaknesses", "Technical Recommendations"),
    technicalRecommendations: extractList(text, "Technical Recommendations", "Architecture Review"),
    architectureReview: extractSection(text, "Architecture Review", "Developer Experience") || "Architecture review not available",
    developerExperience: extractSection(text, "Developer Experience", "Production Readiness") || "Developer experience review not available",
    productionReadiness: extractSection(text, "Production Readiness", null) || "Production readiness assessment not available",
  };
}

function extractSection(text: string, start: string, end: string | null): string | null {
  const startIdx = text.indexOf(start);
  if (startIdx === -1) return null;

  const contentStart = text.indexOf("\n", startIdx) + 1;
  const endIdx = end ? text.indexOf(end, contentStart) : text.length;

  if (endIdx === -1) return null;

  return text.slice(contentStart, endIdx).trim();
}

function extractList(text: string, start: string, end: string | null): string[] {
  const section = extractSection(text, start, end);
  if (!section) return [];

  return section
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 5);
}

function generateFallbackReview(data: Partial<AnalysisResult>): AnalysisResult["aiReview"] {
  const overallScore = data.overallScore || 50;

  return {
    executiveSummary: `This repository shows ${overallScore >= 70 ? "good" : overallScore >= 50 ? "moderate" : "limited"} overall quality. ${data.repository?.description || "The project"} ${data.repository?.stars && data.repository.stars > 100 ? "has gained community traction" : "is a personal or small-scale project"}.`,
    strengths: [
      data.readme && data.readme.score >= 70 ? "Well-documented project" : "Project has basic structure",
      data.security && data.security.score >= 70 ? "Good security practices" : "Organized codebase",
      data.testing && data.testing.score >= 70 ? "Comprehensive testing" : "Clear project purpose",
    ],
    weaknesses: [
      data.testing && data.testing.score < 50 ? "Limited test coverage" : "Documentation could be improved",
      data.security && data.security.score < 50 ? "Security improvements needed" : "Testing coverage could be enhanced",
      data.codeQuality && data.codeQuality.score < 60 ? "Code quality needs attention" : "Architecture could be more modular",
    ],
    technicalRecommendations: [
      "Add comprehensive unit and integration tests",
      "Improve documentation and code comments",
      "Set up automated code quality checks",
    ],
    architectureReview: `The repository structure appears ${data.structure?.detectedTechnologies?.length ? "well-organized with modern technologies" : "basic"}. ${data.structure?.hasFrontend && data.structure?.hasBackend ? "Full-stack architecture detected" : "Single-purpose application detected"}.`,
    developerExperience: `Setup process ${data.readme && data.readme.hasInstallation ? "is documented" : "needs documentation"}. ${data.structure?.documentationFiles?.length ? "Documentation files are present" : "More documentation would improve developer experience"}.`,
    productionReadiness: `Based on the analysis, this repository is ${overallScore >= 80 ? "production-ready" : overallScore >= 60 ? "approaching production readiness with some improvements needed" : "not yet ready for production use"}. Key areas for improvement include ${data.testing && data.testing.score < 50 ? "testing" : "documentation and security"}.`,
  };
}
