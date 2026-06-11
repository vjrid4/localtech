import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  const userType = request.nextUrl.searchParams.get("userType");
  const users = await prisma.user.findMany({
    where: userType ? { userType: userType as never } : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      userType: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ success: true, data: users });
}
