import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken } from "@/lib/auth/middleware";

const invoiceSchema = z.object({
  repairId: z.string(),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "WHATSAPP_PAY"]),
  gstRate: z.number().min(0).max(100).default(18),
});

// GET invoices
export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const status = request.nextUrl.searchParams.get("status");

    // SECURITY: Scope to authenticated user's shop or customer record
    const where: any = {};

    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });

    if (shop) {
      where.repairShopId = shop.id;
    } else {
      const customer = await prisma.customer.findFirst({
        where: { userId: auth.user!.userId },
        select: { id: true },
      });
      if (customer) {
        where.customerId = customer.id;
      } else {
        return NextResponse.json(
          { success: false, message: "User role not found" },
          { status: 404 }
        );
      }
    }

    if (status) where.paymentStatus = status;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        repair: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch invoices",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST create invoice
export async function POST(request: NextRequest) {
  const auth = authenticateToken(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { repairId, paymentMethod, gstRate } = invoiceSchema.parse(body);

    const repair = await prisma.repair.findUnique({
      where: { id: repairId },
      include: {
        invoice: true,
        repairShop: true,
      },
    });

    if (!repair) {
      return NextResponse.json(
        { success: false, message: "Repair not found" },
        { status: 404 }
      );
    }

    // SECURITY: Verify shop ownership before creating financial record
    if (repair.repairShop.userId !== auth.user!.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized shop access" },
        { status: 403 }
      );
    }

    if (repair.invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice already exists for this repair" },
        { status: 400 }
      );
    }

    // Calculate invoice total
    const subtotal = repair.finalCost || repair.estimatedCost || 0;
    const gstAmount = (subtotal * gstRate) / 100;
    const totalAmount = subtotal + gstAmount;

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        repairId,
        repairShopId: repair.repairShopId,
        customerId: repair.customerId,
        subtotal,
        tax: gstAmount,
        totalAmount,
        paymentStatus: "PENDING",
        paymentMethod,
      },
      include: {
        repair: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully",
        data: invoice,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create invoice",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
