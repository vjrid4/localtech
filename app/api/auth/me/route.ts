import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) return createUnauthorizedResponse();

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user!.userId },
      select: { id: true, email: true, name: true, phone: true, userType: true, createdAt: true },
    });

    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch user" }, { status: 500 });
  }
}
