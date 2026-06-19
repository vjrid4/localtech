import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken } from "@/lib/auth/middleware";
import { createPaymentLink } from "@/lib/razorpay";
import { logEvent } from "@/lib/events";

/**
 * POST /api/invoices/[id]/payment-link
 * Generates (or returns existing) Razorpay Payment Link for an invoice.
 * Only the shop owner whose invoice this is can call this.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateToken(request);
  if (!auth.authenticated) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      repair: {
        include: {
          customer: { include: { user: { select: { name: true, phone: true, email: true } } } },
        },
      },
      repairShop: { select: { userId: true } },
    },
  });

  if (!invoice) return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
  if (invoice.repairShop.userId !== auth.user!.userId) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }
  if (invoice.paymentStatus === "PAID") {
    return NextResponse.json({ success: false, message: "Invoice is already paid" }, { status: 409 });
  }

  // Return existing link if still valid (>1h remaining)
  if (invoice.razorpayLinkUrl && invoice.razorpayLinkExpiry) {
    const expiresMs = new Date(invoice.razorpayLinkExpiry).getTime();
    if (expiresMs > Date.now() + 3600 * 1000) {
      return NextResponse.json({ success: true, data: { url: invoice.razorpayLinkUrl, existing: true } });
    }
  }

  const customer = invoice.repair.customer.user;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in";

  const link = await createPaymentLink({
    amountPaise: Math.round(invoice.totalAmount * 100),
    description: `Repair invoice ${invoice.invoiceNumber}`,
    customerName: customer.name,
    customerPhone: customer.phone ?? invoice.repair.customer.user.phone ?? "9999999999",
    customerEmail: customer.email ?? undefined,
    referenceId: invoice.invoiceNumber,
    callbackUrl: `${appUrl}/dashboard/shop/billing?paid=${invoice.id}`,
  });

  await prisma.invoice.update({
    where: { id },
    data: {
      razorpayLinkId: link.id,
      razorpayLinkUrl: link.short_url,
      razorpayLinkExpiry: new Date(link.expire_by * 1000),
      paymentMethod: "RAZORPAY",
    },
  });

  await logEvent({
    type: "invoice.payment_link_created",
    actorType: "REPAIR_SHOP_OWNER",
    actorId: auth.user!.userId,
    subjectType: "invoice",
    subjectId: id,
    payload: { linkId: link.id, amount: invoice.totalAmount },
  });

  return NextResponse.json({ success: true, data: { url: link.short_url, existing: false } });
}
