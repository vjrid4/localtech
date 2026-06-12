import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/middleware";
import { generateIcon } from "@/lib/ai/icon-generator";

export async function POST(request: NextRequest) {
  // ADMIN-only: this endpoint spends Anthropic + Google API credits per call
  const { errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const { description } = body;

  if (!description?.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const result = await generateIcon(description);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Icon generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
