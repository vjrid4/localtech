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

export async function POST(request: NextRequest) {
  try {
    const { token, password } = schema.parse(await request.json());

    let payload: { userId: string; purpose: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string; purpose: string };
    } catch {
      return NextResponse.json({ success: false, message: "Reset link is invalid or has expired." }, { status: 400 });
    }

    if (payload.purpose !== "password-reset") {
      return NextResponse.json({ success: false, message: "Invalid reset token." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Reset failed." }, { status: 500 });
  }
}
