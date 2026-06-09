import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export function authenticateToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return {
      authenticated: false,
      user: null,
      error: "No token provided",
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      authenticated: false,
      user: null,
      error: "Invalid or expired token",
    };
  }

  return {
    authenticated: true,
    user: payload,
    error: null,
  };
}

export function createUnauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}
