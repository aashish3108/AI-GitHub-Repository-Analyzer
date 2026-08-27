import type {
  AnalysisResult,
  RepositoryInfo,
  FileNode,
  ProgressUpdate,
} from "./types";
import {
  fetchRepositoryInfo,
  fetchRepositoryTree,
  fetchLanguages,
} from "./github";
import { analyzeStructure } from "./analyzers/structure";
import { analyzeCodeQuality } from "./analyzers/code-quality";
import { analyzeSecurity } from "./analyzers/security";
import { analyzeDependencies } from "./analyzers/dependencies";
import { analyzeReadme } from "./analyzers/readme";
import { analyzeTesting } from "./analyzers/testing";
import { generateAIReview } from "./ai";
import { calculateOverallScore } from "./scorer";

export interface AnalysisCallbacks {
  onProgress?: (update: ProgressUpdate) => void;
}

const STAGES = [
  { message: "Connecting to GitHub", percentage: 5 },
  { message: "Fetching repository metadata", percentage: 15 },
  { message: "Analyzing repository structure", percentage: 25 },
  { message: "Inspecting code quality", percentage: 40 },
  { message: "Running security checks", percentage: 55 },
  { message: "Analyzing dependencies", percentage: 65 },
  { message: "Reviewing documentation", percentage: 75 },
  { message: "Checking test coverage", percentage: 82 },
  { message: "Generating AI review", percentage: 92 },
  { message: "Compiling final report", percentage: 100 },
];

export async function runFullAnalysis(
  owner: string,
  repo: string,
  callbacks: AnalysisCallbacks = {}
): Promise<AnalysisResult> {
  const reportProgress = (stageIndex: number) => {
    if (callbacks.onProgress && stageIndex < STAGES.length) {
      callbacks.onProgress({
        stage: stageIndex,
        message: STAGES[stageIndex].message,
        percentage: STAGES[stageIndex].percentage,
      });
    }
  };

  // Stage 0: Connect
  reportProgress(0);

  // Stage 1: Fetch repository info
  let repository: RepositoryInfo;
  try {
    repository = await fetchRepositoryInfo(owner, repo);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch repository"
    );
  }
  reportProgress(1);

  // Stage 2: Analyze structure
  const [tree, languages] = await Promise.all([
    fetchRepositoryTree(owner, repo, repository.defaultBranch),
    fetchLanguages(owner, repo),
  ]);

  const files: FileNode[] = filterIrrelevantFiles(tree);
  const structure = analyzeStructure(files, languages);
  reportProgress(2);

  // Stage 3-7: Run analyzers in parallel
  const [codeQuality, security, dependencies, readme, testing] = await Promise.all([
    analyzeCodeQuality(owner, repo, files).then((r) => {
      reportProgress(3);
      return r;
    }),
    analyzeSecurity(owner, repo, files).then((r) => {
      reportProgress(4);
      return r;
    }),
    analyzeDependencies(owner, repo, files).then((r) => {
      reportProgress(5);
      return r;
    }),
    analyzeReadme(owner, repo, files).then((r) => {
      reportProgress(6);
      return r;
    }),
    analyzeTesting(owner, repo, files).then((r) => {
      reportProgress(7);
      return r;
    }),
  ]);

  // Build partial result for AI review
  const partialResult: Partial<AnalysisResult> = {
    repository,
    structure,
    codeQuality,
    security,
    dependencies,
    readme,
    testing,
  };

  // Stage 8: AI Review
  reportProgress(8);
  const aiReview = (await generateAIReview(partialResult)) ?? {
    executiveSummary: "AI review unavailable. Please configure OPENAI_API_KEY for detailed AI insights.",
    strengths: ["Repository structure analyzed"],
    weaknesses: ["AI analysis unavailable without API key"],
    technicalRecommendations: ["Configure OpenAI API key for comprehensive review"],
    architectureReview: "Architecture analysis based on heuristic detection only.",
    developerExperience: "Set up AI integration for detailed developer experience review.",
    productionReadiness: "Configure AI for production readiness assessment.",
  };

  // Stage 9: Calculate overall score
  const { overallScore, scoreBreakdown } = calculateOverallScore({
    codeQuality: codeQuality.score,
    security: security.score,
    readme: readme.score,
    testing: testing.score,
    dependencies: dependencies.totalDependencies,
    hasLockfile: dependencies.hasLockfile,
    hasCI: testing.hasCI,
    structureCompleteness: structure.detectedTechnologies.length,
    stars: repository.stars,
  });

  reportProgress(9);

  return {
    repository,
    structure,
    codeQuality,
    security,
    dependencies,
    readme,
    testing,
    aiReview,
    overallScore,
    scoreBreakdown,
  };
}

function filterIrrelevantFiles(files: FileNode[]): FileNode[] {
  const ignoredPatterns = [
    /^node_modules\//,
    /^\.git\//,
    /^\.next\//,
    /^dist\//,
    /^build\//,
    /^\.venv\//,
    /^venv\//,
    /^__pycache__\//,
    /^\.tox\//,
    /^target\//,
    /\/\.DS_Store$/,
    /\.min\.js$/,
    /\.min\.css$/,
    /\.lock$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /pnpm-lock\.yaml$/,
    /\.svg$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.ico$/,
    /\.woff$/,
    /\.woff2$/,
    /\.ttf$/,
    /\.eot$/,
    /\.mp4$/,
    /\.mp3$/,
    /\.zip$/,
    /\.tar\.gz$/,
    /\.pdf$/,
  ];

  return files.filter((file) => {
    return !ignoredPatterns.some((pattern) => pattern.test(file.path));
  });
}
