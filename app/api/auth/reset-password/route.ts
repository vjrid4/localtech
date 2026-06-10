import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

const JWT_SECRET = process.env.JWT_SECRET!;
const BAD_TOKEN = { success: false, message: "Reset link is invalid or has expired." };

export async function POST(request: NextRequest) {
  try {
    const { token, password } = schema.parse(await request.json());

    let payload: { userId: string; purpose: string; resetCounter: number };
    try {
      payload = jwt.verify(token, JWT_SECRET) as typeof payload;
    } catch {
      return NextResponse.json(BAD_TOKEN, { status: 400 });
    }

    if (payload.purpose !== "password-reset") {
      return NextResponse.json(BAD_TOKEN, { status: 400 });
    }

    // resetCounter is required — tokens without it (or issued before this
    // field was added) are rejected rather than silently passed through.
    if (typeof payload.resetCounter !== "number") {
      return NextResponse.json(BAD_TOKEN, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { tokenVersion: true },
    });

    if (!user) {
      return NextResponse.json(BAD_TOKEN, { status: 400 });
    }

    // Single-use enforcement: resetCounter must match current tokenVersion.
    // A successful reset increments tokenVersion, so replayed tokens fail.
    if (payload.resetCounter !== user.tokenVersion) {
      return NextResponse.json(BAD_TOKEN, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Increment tokenVersion: invalidates this reset token AND all outstanding
    // session JWTs simultaneously.
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashed, tokenVersion: { increment: 1 } },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Reset failed." }, { status: 500 });
  }
}
