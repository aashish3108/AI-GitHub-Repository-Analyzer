interface ScoreInputs {
  codeQuality: number;
  security: number;
  readme: number;
  testing: number;
  dependencies: number;
  hasLockfile: boolean;
  hasCI: boolean;
  structureCompleteness: number;
  stars: number;
}

interface ScoreBreakdown {
  codeQuality: number;
  architecture: number;
  documentation: number;
  security: number;
  testing: number;
  dependencies: number;
  maintainability: number;
  organization: number;
}

export function calculateOverallScore(inputs: ScoreInputs): {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
} {
  // Compute sub-scores
  const codeQualityScore = inputs.codeQuality;

  // Architecture score based on structure detection
  const architectureScore = Math.min(
    100,
    inputs.structureCompleteness * 10 + (inputs.hasCI ? 15 : 0)
  );

  // Documentation score from README
  const documentationScore = inputs.readme;

  // Security score
  const securityScore = inputs.security;

  // Testing score
  const testingScore = inputs.testing;

  // Dependencies score based on presence and lockfile
  let dependenciesScore = 50;
  if (inputs.dependencies > 0) dependenciesScore += 20;
  if (inputs.hasLockfile) dependenciesScore += 20;
  if (inputs.dependencies > 100) dependenciesScore -= 10;
  dependenciesScore = Math.min(100, Math.max(0, dependenciesScore));

  // Maintainability (combination of code quality + structure)
  const maintainabilityScore = Math.round(
    inputs.codeQuality * 0.6 + architectureScore * 0.4
  );

  // Organization (structure + CI + lockfile)
  let organizationScore = 50;
  if (inputs.structureCompleteness > 3) organizationScore += 20;
  if (inputs.hasCI) organizationScore += 15;
  if (inputs.hasLockfile) organizationScore += 15;
  organizationScore = Math.min(100, organizationScore);

  // Weighted overall score
  const weights = {
    codeQuality: 0.2,
    architecture: 0.15,
    documentation: 0.1,
    security: 0.2,
    testing: 0.15,
    dependencies: 0.05,
    maintainability: 0.1,
    organization: 0.05,
  };

  const overallScore = Math.round(
    codeQualityScore * weights.codeQuality +
    architectureScore * weights.architecture +
    documentationScore * weights.documentation +
    securityScore * weights.security +
    testingScore * weights.testing +
    dependenciesScore * weights.dependencies +
    maintainabilityScore * weights.maintainability +
    organizationScore * weights.organization
  );

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    scoreBreakdown: {
      codeQuality: codeQualityScore,
      architecture: architectureScore,
      documentation: documentationScore,
      security: securityScore,
      testing: testingScore,
      dependencies: dependenciesScore,
      maintainability: maintainabilityScore,
      organization: organizationScore,
    },
  };
}
