import { db } from "@/db";
import { analyses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { AnalysisResult, ProgressUpdate } from "./types";
import { runFullAnalysis } from "./analyzer";
import { parseGitHubUrl } from "./validation";

export async function createAnalysis(repositoryUrl: string): Promise<string> {
  const { owner, repo } = parseGitHubUrl(repositoryUrl);
  const id = nanoid(12);

  await db.insert(analyses).values({
    id,
    repositoryUrl,
    owner,
    repo,
    status: "pending",
    progress: 0,
    progressMessage: "Initializing analysis",
  });

  // Start analysis in the background
  void executeAnalysis(id, owner, repo);

  return id;
}

async function executeAnalysis(id: string, owner: string, repo: string) {
  try {
    await db
      .update(analyses)
      .set({ status: "analyzing", progress: 0, progressMessage: "Starting analysis" })
      .where(eq(analyses.id, id));

    const result = await runFullAnalysis(owner, repo, {
      onProgress: async (update: ProgressUpdate) => {
        await db
          .update(analyses)
          .set({
            progress: update.percentage,
            progressMessage: update.message,
            updatedAt: new Date(),
          })
          .where(eq(analyses.id, id));
      },
    });

    await db
      .update(analyses)
      .set({
        status: "completed",
        progress: 100,
        progressMessage: "Analysis complete",
        result: result as unknown as Record<string, unknown>,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(analyses.id, id));
  } catch (error) {
    console.error("Analysis failed:", error);
    await db
      .update(analyses)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Analysis failed",
        updatedAt: new Date(),
      })
      .where(eq(analyses.id, id));
  }
}

export async function getAnalysis(id: string): Promise<{
  analysis: typeof analyses.$inferSelect | null;
  result: AnalysisResult | null;
}> {
  const rows = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1);

  if (rows.length === 0) {
    return { analysis: null, result: null };
  }

  const analysis = rows[0];
  const result = analysis.result ? (analysis.result as unknown as AnalysisResult) : null;

  return { analysis, result };
}
