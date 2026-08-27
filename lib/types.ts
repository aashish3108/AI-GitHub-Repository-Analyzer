export interface RepositoryInfo {
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  mainLanguage: string | null;
  license: string | null;
  size: number;
  createdAt: string;
  updatedAt: string;
  defaultBranch: string;
  topics: string[];
  url: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
}

export interface StructureAnalysis {
  files: FileNode[];
  importantFiles: string[];
  languages: Record<string, number>;
  hasFrontend: boolean;
  hasBackend: boolean;
  detectedTechnologies: string[];
  configurationFiles: string[];
  documentationFiles: string[];
  testFiles: string[];
  ciFiles: string[];
  dockerFiles: string[];
  environmentFiles: string[];
  packageFiles: string[];
  architecture: string;
}

export interface CodeQualityAnalysis {
  score: number;
  organization: number;
  readability: number;
  maintainability: number;
  naming: number;
  errorHandling: number;
  modularity: number;
  documentation: number;
  explanations: string[];
}

export interface SecurityFinding {
  severity: "critical" | "high" | "medium" | "low" | "informational";
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
}

export interface SecurityAnalysis {
  score: number;
  findings: SecurityFinding[];
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: "dependencies" | "devDependencies" | "peerDependencies";
}

export interface DependencyAnalysis {
  packageManager: string | null;
  dependencies: DependencyInfo[];
  totalDependencies: number;
  hasLockfile: boolean;
  suspiciousPatterns: string[];
  recommendations: string[];
}

export interface ReadmeAnalysis {
  score: number;
  hasDescription: boolean;
  hasInstallation: boolean;
  hasUsage: boolean;
  hasFeatures: boolean;
  hasScreenshots: boolean;
  hasConfiguration: boolean;
  hasContributing: boolean;
  hasLicense: boolean;
  recommendations: string[];
}

export interface TestingAnalysis {
  score: number;
  hasUnitTests: boolean;
  hasIntegrationTests: boolean;
  hasE2ETests: boolean;
  testDirectories: string[];
  testingFrameworks: string[];
  hasCI: boolean;
  recommendations: string[];
}

export interface AIReview {
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  technicalRecommendations: string[];
  architectureReview: string;
  developerExperience: string;
  productionReadiness: string;
}

export interface AnalysisResult {
  repository: RepositoryInfo;
  structure: StructureAnalysis;
  codeQuality: CodeQualityAnalysis;
  security: SecurityAnalysis;
  dependencies: DependencyAnalysis;
  readme: ReadmeAnalysis;
  testing: TestingAnalysis;
  aiReview: AIReview;
  overallScore: number;
  scoreBreakdown: {
    codeQuality: number;
    architecture: number;
    documentation: number;
    security: number;
    testing: number;
    dependencies: number;
    maintainability: number;
    organization: number;
  };
}

export interface ProgressUpdate {
  stage: number;
  message: string;
  percentage: number;
}
