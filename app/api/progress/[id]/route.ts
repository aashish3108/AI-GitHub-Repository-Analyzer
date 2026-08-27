import { NextRequest, NextResponse } from "next/server";
import { getAnalysis } from "@/lib/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { analysis } = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: analysis.id,
      status: analysis.status,
      progress: analysis.progress,
      progressMessage: analysis.progressMessage,
      errorMessage: analysis.errorMessage,
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
