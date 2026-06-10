import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) return createUnauthorizedResponse();

  try {
    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });

    if (!shop) {
      return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });
    }

    const items = await prisma.inventoryItem.findMany({
      where: { repairShopId: shop.id },
      include: {
        sparePart: {
          select: {
            id: true,
            name: true,
            category: true,
            deviceBrand: true,
            partNumber: true,
            costPrice: true,
            sellingPrice: true,
            supplier: { select: { companyName: true } },
          },
        },
      },
      orderBy: { quantity: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: items.map((item: any) => ({
        id: item.id,
        name: item.sparePart.name,
        category: item.sparePart.category,
        brands: item.sparePart.deviceBrand,
        partNumber: item.sparePart.partNumber,
        costPrice: item.sparePart.costPrice,
        sellingPrice: item.sparePart.sellingPrice,
        supplier: item.sparePart.supplier.companyName,
        quantity: item.quantity,
        reorderLevel: item.reorderLevel,
        location: item.location,
        lowStock: item.quantity <= item.reorderLevel,
      })),
      count: items.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch inventory", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
