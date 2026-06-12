import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken } from "@/lib/auth/middleware";

/** Resolve the marketplace TechnicianProfile for an authenticated request. */
export async function requireTechnicianProfile(request: NextRequest) {
  const auth = await authenticateToken(request);
  if (!auth.authenticated) {
    return { profile: null, errorResponse: NextResponse.json({ success: false, message: auth.error }, { status: 401 }) };
  }
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: auth.user!.userId },
  });
  if (!profile) {
    return {
      profile: null,
      errorResponse: NextResponse.json(
        { success: false, message: "No technician profile for this account" },
        { status: 403 },
      ),
    };
  }
  if (!profile.isActive) {
    return {
      profile: null,
      errorResponse: NextResponse.json(
        { success: false, message: "Your profile is awaiting approval" },
        { status: 403 },
      ),
    };
  }
  return { profile, errorResponse: null };
}
