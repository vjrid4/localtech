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

    let payload: { userId: string; purpose: string; pwHash?: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as typeof payload;
    } catch {
      return NextResponse.json(BAD_TOKEN, { status: 400 });
    }

    if (payload.purpose !== "password-reset") {
      return NextResponse.json(BAD_TOKEN, { status: 400 });
    }

    // Fetch current user to enforce single-use: if pwHash in the JWT no
    // longer matches the DB, the token has already been consumed.
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(BAD_TOKEN, { status: 400 });
    }

    if (payload.pwHash && payload.pwHash !== user.password) {
      return NextResponse.json(BAD_TOKEN, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Increment tokenVersion to invalidate all outstanding session JWTs.
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
