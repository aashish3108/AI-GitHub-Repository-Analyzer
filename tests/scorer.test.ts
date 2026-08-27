import { describe, it, expect } from "vitest";
import { calculateOverallScore } from "@/lib/scorer";

describe("calculateOverallScore", () => {
  it("returns a perfect score for excellent inputs", () => {
    const result = calculateOverallScore({
      codeQuality: 100,
      security: 100,
      readme: 100,
      testing: 100,
      dependencies: 50,
      hasLockfile: true,
      hasCI: true,
      structureCompleteness: 10,
      stars: 1000,
    });
    expect(result.overallScore).toBe(100);
  });

  it("returns a low score for poor inputs", () => {
    const result = calculateOverallScore({
      codeQuality: 20,
      security: 30,
      readme: 10,
      testing: 5,
      dependencies: 0,
      hasLockfile: false,
      hasCI: false,
      structureCompleteness: 0,
      stars: 0,
    });
    expect(result.overallScore).toBeLessThan(40);
  });

  it("returns score between 0 and 100", () => {
    const result = calculateOverallScore({
      codeQuality: 50,
      security: 50,
      readme: 50,
      testing: 50,
      dependencies: 10,
      hasLockfile: true,
      hasCI: false,
      structureCompleteness: 3,
      stars: 10,
    });
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it("returns all score breakdown categories", () => {
    const result = calculateOverallScore({
      codeQuality: 80,
      security: 90,
      readme: 70,
      testing: 60,
      dependencies: 20,
      hasLockfile: true,
      hasCI: true,
      structureCompleteness: 5,
      stars: 100,
    });
    expect(result.scoreBreakdown).toHaveProperty("codeQuality");
    expect(result.scoreBreakdown).toHaveProperty("architecture");
    expect(result.scoreBreakdown).toHaveProperty("documentation");
    expect(result.scoreBreakdown).toHaveProperty("security");
    expect(result.scoreBreakdown).toHaveProperty("testing");
    expect(result.scoreBreakdown).toHaveProperty("dependencies");
    expect(result.scoreBreakdown).toHaveProperty("maintainability");
    expect(result.scoreBreakdown).toHaveProperty("organization");
  });

  it("security has more weight than documentation", () => {
    // With high security, low doc vs high doc, low security
    const highSecurity = calculateOverallScore({
      codeQuality: 50,
      security: 100,
      readme: 0,
      testing: 50,
      dependencies: 20,
      hasLockfile: true,
      hasCI: true,
      structureCompleteness: 3,
      stars: 10,
    });

    const highDoc = calculateOverallScore({
      codeQuality: 50,
      security: 0,
      readme: 100,
      testing: 50,
      dependencies: 20,
      hasLockfile: true,
      hasCI: true,
      structureCompleteness: 3,
      stars: 10,
    });

    expect(highSecurity.overallScore).toBeGreaterThan(highDoc.overallScore);
  });
});
