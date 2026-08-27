import { NextRequest, NextResponse } from "next/server";
import { createAnalysis, getAnalysis } from "@/lib/cache";
import { validateRepositoryUrl } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repositoryUrl } = body as { repositoryUrl?: string };

    if (!repositoryUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }

    const validation = validateRepositoryUrl(repositoryUrl);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const analysisId = await createAnalysis(repositoryUrl);

    return NextResponse.json({
      id: analysisId,
      status: "pending",
      message: "Analysis started",
    });
  } catch (error) {
    console.error("POST /api/analyze error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 }
      );
    }

    const { analysis, result } = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: analysis.id,
      status: analysis.status,
      progress: analysis.progress,
      progressMessage: analysis.progressMessage,
      errorMessage: analysis.errorMessage,
      result,
    });
  } catch (error) {
    console.error("GET /api/analyze error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
