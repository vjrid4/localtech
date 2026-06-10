import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) return createUnauthorizedResponse();

  try {
    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      include: {
        branches: { select: { id: true, name: true, city: true } },
        technicians: {
          include: { user: { select: { name: true } } },
          orderBy: { totalRepairs: "desc" },
        },
      },
    });

    if (!shop) {
      return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        shop: { id: shop.id, name: shop.name },
        branches: shop.branches,
        technicians: shop.technicians.map((t: any) => ({
          id: t.id,
          name: t.user.name,
          rating: t.rating,
          activeRepairs: 0,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch shop context" },
      { status: 500 }
    );
  }
}
