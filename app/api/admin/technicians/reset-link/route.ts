import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { logEvent } from "@/lib/events";

/**
 * Generate a set-password link for a technician account (created with an
 * unusable random password at application time). Admin copies the link and
 * sends it on WhatsApp — the account-claiming step until phone-OTP login
 * exists. Reuses the password-reset token format (single-use via
 * resetCounter, 24h expiry for onboarding convenience).
 */
const schema = z.object({ technicianProfileId: z.string() });

export async function POST(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  try {
    const { technicianProfileId } = schema.parse(await request.json());
    const profile = await prisma.technicianProfile.findUnique({
      where: { id: technicianProfileId },
      select: { id: true, user: { select: { id: true, email: true, tokenVersion: true } } },
    });
    if (!profile) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const token = jwt.sign(
      {
        userId: profile.user.id,
        email: profile.user.email,
        purpose: "password-reset",
        resetCounter: profile.user.tokenVersion,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );
    const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in"}/reset-password?token=${token}`;

    await logEvent({
      type: "admin.reset_link_issued",
      actorType: "ADMIN",
      actorId: auth.user!.userId,
      subjectType: "technician",
      subjectId: profile.id,
    });

    return NextResponse.json({ success: true, data: { url } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed" }, { status: 500 });
  }
}
