import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/razorpay
 * Handles payment.link.paid and payment_link.cancelled events.
 * Register this URL in Razorpay Dashboard → Webhooks.
 * Set RAZORPAY_WEBHOOK_SECRET in .env.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[razorpay webhook] RAZORPAY_WEBHOOK_SECRET not configured — rejecting");
    return NextResponse.json({ success: false }, { status: 500 });
  }
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, message: "Bad JSON" }, { status: 400 });
  }

  const event = payload.event as string;
  const entity = (payload.payload as Record<string, unknown>)?.payment_link?.entity as Record<string, unknown> | undefined;

  if (!entity) {
    return NextResponse.json({ success: true, message: "No entity — ignoring" });
  }

  const razorpayLinkId = entity.id as string;
  const referenceId    = entity.reference_id as string; // invoice number
  const status         = entity.status as string;

  await logEvent({
    type: `razorpay.${event}`,
    actorType: "SYSTEM",
    subjectType: "invoice",
    subjectId: razorpayLinkId,
    payload: { referenceId, status },
  });

  if (event === "payment_link.paid") {
    const invoice = await prisma.invoice.findFirst({
      where: { OR: [{ razorpayLinkId }, { invoiceNumber: referenceId }] },
      select: { id: true, paymentStatus: true },
    });
    if (invoice && invoice.paymentStatus !== "PAID") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paymentStatus: "PAID",
          paidDate: new Date(),
          paymentMethod: "RAZORPAY",
        },
      });
      await logEvent({
        type: "invoice.paid",
        actorType: "SYSTEM",
        subjectType: "invoice",
        subjectId: invoice.id,
        payload: { via: "razorpay_webhook", razorpayLinkId },
      });
    }
  }

  if (event === "payment_link.cancelled") {
    const invoice = await prisma.invoice.findFirst({
      where: { OR: [{ razorpayLinkId }, { invoiceNumber: referenceId }] },
      select: { id: true },
    });
    if (invoice) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { razorpayLinkId: null, razorpayLinkUrl: null, razorpayLinkExpiry: null },
      });
    }
  }

  return NextResponse.json({ success: true });
}
