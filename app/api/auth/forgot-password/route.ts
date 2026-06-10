import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({ email: z.string().email() });

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { email } = schema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    // Always return 200 — don't reveal whether the email exists
    if (!user) {
      return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    // Short-lived reset token (1 hour)
    const token = jwt.sign(
      { userId: user.id, email: user.email, purpose: "password-reset" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    // In production: send resetUrl via email (SMTP / transactional email)
    // For dev: log to console so it can be used directly
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Password reset link for ${email}:`);
      console.log(resetUrl);
    }

    return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Valid email required" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Request failed" }, { status: 500 });
  }
}
