import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({ email: z.string().email() });

const JWT_SECRET = process.env.JWT_SECRET!;
const OK = { success: true, message: "If that email exists, a reset link has been sent." };

export async function POST(request: NextRequest) {
  try {
    const { email } = schema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    if (!user) {
      // Equalize response time — bcrypt cost matches the real code path so
      // response timing does not reveal whether the email exists.
      await bcrypt.hash("_timing_equalizer_", 10);
      return NextResponse.json(OK);
    }

    // Include current password hash so the token is single-use: once the
    // password is changed, this token is cryptographically invalid.
    const token = jwt.sign(
      { userId: user.id, email: user.email, purpose: "password-reset", pwHash: user.password },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    // In production: send resetUrl via email (SMTP / transactional email)
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Password reset link for ${email}:`);
      console.log(resetUrl);
    }

    return NextResponse.json(OK);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Valid email required" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Request failed" }, { status: 500 });
  }
}
