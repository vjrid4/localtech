import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

const deviceSchema = z.object({
  customerId: z.string(),
  brand: z.string().min(1),
  model: z.string().min(1),
  imei: z.string().optional(),
  serialNumber: z.string().optional(),
  color: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().optional(),
});

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) return createUnauthorizedResponse();

  const customerId = request.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ success: false, message: "customerId is required" }, { status: 400 });
  }

  try {
    // Verify the customer belongs to caller's shop
    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });
    if (!shop) return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, repairShopId: shop.id },
    });
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    const devices = await prisma.device.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: devices });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch devices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) return createUnauthorizedResponse();

  try {
    const body = await request.json();
    const data = deviceSchema.parse(body);

    // Verify customer belongs to caller's shop
    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });
    if (!shop) return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });

    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, repairShopId: shop.id },
    });
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    const device = await prisma.device.create({
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: device }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to create device" }, { status: 500 });
  }
}
