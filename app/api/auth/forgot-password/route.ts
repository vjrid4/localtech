import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({ email: z.string().email() });

const JWT_SECRET = process.env.JWT_SECRET!;
const OK = { success: true, message: "If that email exists, a reset link has been sent." };

export async function POST(request: NextRequest) {
  try {
    const { email } = schema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, tokenVersion: true },
    });

    if (!user) {
      // Equalize timing — jwt.sign matches the dominant work on the user branch
      jwt.sign({ purpose: "noop" }, JWT_SECRET, { expiresIn: "1h" });
      return NextResponse.json(OK);
    }

    // resetCounter = current tokenVersion. Once the password is reset,
    // tokenVersion is incremented and this token becomes invalid (single-use,
    // no sensitive material in the payload).
    const token = jwt.sign(
      { userId: user.id, email: user.email, purpose: "password-reset", resetCounter: user.tokenVersion },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    // In production: deliver resetUrl via email (SMTP / transactional service)
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
    }

    return NextResponse.json(OK);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Valid email required" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Request failed" }, { status: 500 });
  }
}
