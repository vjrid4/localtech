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

  // Always verify tokenVersion against the DB. Tokens issued before this
  // field existed will have tokenVersion=undefined at runtime, which
  // naturally fails the strict-equality check — forcing re-login.
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { tokenVersion: true },
  });

  if (!user || user.tokenVersion !== payload.tokenVersion) {
    return { authenticated: false, user: null, error: "Session invalidated" };
  }

  return { authenticated: true, user: payload, error: null };
}

export function createUnauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

/** Authenticate and require a specific role. Returns null on success, or an error response. */
export async function requireRole(request: NextRequest, role: string) {
  const auth = await authenticateToken(request);
  if (!auth.authenticated) {
    return { auth, errorResponse: createUnauthorizedResponse(auth.error ?? undefined) };
  }
  if (auth.user!.userType !== role) {
    return {
      auth,
      errorResponse: NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 }),
    };
  }
  return { auth, errorResponse: null };
}
