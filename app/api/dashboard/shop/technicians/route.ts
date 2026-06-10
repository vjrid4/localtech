import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const auth = await authenticateToken(request);
  if (!auth.authenticated) return createUnauthorizedResponse();

  try {
    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });

    if (!shop) {
      return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
    }

    const technicians = await prisma.technician.findMany({
      where: { repairShopId: shop.id },
      include: {
        user: { select: { name: true, email: true, phone: true, createdAt: true } },
        _count: { select: { repairs: true } },
        repairs: {
          where: { status: { not: "COMPLETED" } },
          select: { id: true },
        },
      },
      orderBy: { totalRepairs: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: technicians.map((t: any) => ({
        id: t.id,
        name: t.user.name,
        email: t.user.email,
        phone: t.user.phone,
        specialization: t.specialization,
        certifications: t.certifications,
        rating: t.rating,
        totalRepairs: t.totalRepairs,
        activeRepairs: t.repairs.length,
        joinedAt: t.user.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch technicians", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
