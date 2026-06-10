import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import { prisma } from "@/lib/db/prisma";

export async function authenticateToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return { authenticated: false, user: null, error: "No token provided" };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return { authenticated: false, user: null, error: "Invalid or expired token" };
  }

  // If the JWT carries a tokenVersion, verify it matches the DB — this
  // invalidates all sessions issued before a password reset.
  if (payload.tokenVersion !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { tokenVersion: true },
    });
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return { authenticated: false, user: null, error: "Session invalidated" };
    }
  }

  return { authenticated: true, user: payload, error: null };
}

export function createUnauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}
