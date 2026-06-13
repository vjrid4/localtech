import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { assignTechnician } from "@/lib/dispatch";
import { logEvent } from "@/lib/events";
import { sendWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/**
 * WhatsApp inbound webhook (AiSensy / Interakt / Meta Cloud API).
 *
 * GET  → hub verification handshake (BSP hits this when you save the webhook URL)
 * POST → inbound message processing:
 *   "1" or "yes"  → first-accept-wins on the technician's pending offer
 *   anything else → logged as inbound for manual follow-up
 *
 * Configure in BSP dashboard:
 *   Webhook URL:   https://localtech.in/api/webhooks/whatsapp
 *   Verify token:  WHATSAPP_WEBHOOK_SECRET (any strong random string, e.g. openssl rand -hex 32)
 *
 * Security: every POST is HMAC-SHA256 verified against WHATSAPP_WEBHOOK_SECRET
 * before any DB work. Requests without a valid signature are rejected with 401.
 * When the env var is absent (local dev), a console warning is printed and the
 * endpoint operates in open mode — set the secret before going live.
 *
 * BSP signature headers supported:
 *   AiSensy  → x-aisensy-signature   (hex HMAC-SHA256 of raw body)
 *   Interakt → x-interakt-signature  (hex HMAC-SHA256 of raw body)
 *   Meta     → x-hub-signature-256   (format: "sha256=<hex>")
 */

/** Verify HMAC-SHA256 of rawBody against the BSP signature header. */
function verifySignature(request: NextRequest, rawBody: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  // Read whichever header the BSP sends
  const raw =
    request.headers.get("x-aisensy-signature") ??
    request.headers.get("x-interakt-signature") ??
    request.headers.get("x-hub-signature-256")?.replace(/^sha256=/, "") ??
    "";

  if (!raw) return false;

  // Constant-time comparison — lengths must match first to avoid throws
  if (raw.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(raw), Buffer.from(expected));
}

/** Extract phone + text from AiSensy / Interakt / Meta inbound payload shapes. */
function parseInbound(body: Record<string, unknown>): { phone: string; text: string } | null {
  try {
    // AiSensy shape
    if (body.data && typeof body.data === "object") {
      const d = body.data as Record<string, unknown>;
      if (d.from && d.text && typeof d.text === "object") {
        const t = d.text as Record<string, unknown>;
        return { phone: String(d.from), text: String(t.body ?? "").trim() };
      }
    }
    // Interakt shape
    if (body.customer && typeof body.customer === "object") {
      const c = body.customer as Record<string, unknown>;
      const m = body.message as Record<string, unknown> | undefined;
      if (c.phone_number && m?.message) {
        return { phone: String(c.phone_number), text: String(m.message).trim() };
      }
    }
    // Meta Cloud API shape
    if (body.entry && Array.isArray(body.entry)) {
      const changes = (body.entry[0] as Record<string, unknown>)?.changes as unknown[] | undefined;
      const val = (changes?.[0] as Record<string, unknown>)?.value as Record<string, unknown> | undefined;
      const msgs = val?.messages as Record<string, unknown>[] | undefined;
      if (msgs?.[0]) {
        const m = msgs[0];
        const t = m.text as Record<string, unknown> | undefined;
        return { phone: String(m.from), text: String(t?.body ?? "").trim() };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Normalise phone to 10-digit Indian mobile. */
function normalise(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^(91|0)/, "").slice(-10);
}

/** Hub verification — BSP sends hub.mode=subscribe challenge on webhook save. */
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (mode === "subscribe" && token === secret && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  // Read raw body text first — required for HMAC verification before JSON parsing.
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // ── Signature verification ─────────────────────────────────────────────────
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (secret) {
    if (!verifySignature(request, rawBody, secret)) {
      console.warn("[wa:webhook] signature mismatch — rejected");
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  } else {
    // No secret configured — safe in local dev, but must be set in production.
    if (process.env.NODE_ENV === "production") {
      console.error("[wa:webhook] WHATSAPP_WEBHOOK_SECRET not set in production — rejecting all inbound");
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    console.warn("[wa:webhook] WHATSAPP_WEBHOOK_SECRET not set — running in open mode (dev only)");
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const inbound = parseInbound(body);
  if (!inbound) {
    // Delivery receipts, status updates, etc. — not actionable
    return NextResponse.json({ ok: true });
  }

  const phone10 = normalise(inbound.phone);
  const text = inbound.text.toLowerCase().trim();

  // Find the technician by their WhatsApp number
  const profile = await prisma.technicianProfile.findFirst({
    where: { whatsappNumber: { endsWith: phone10 } },
    select: { id: true, userId: true },
  });

  if (!profile) {
    await logEvent({
      type: "whatsapp.inbound_unknown",
      actorType: "SYSTEM",
      subjectType: "webhook",
      subjectId: "whatsapp",
      payload: { phone: phone10, text: text.slice(0, 50) },
    });
    return NextResponse.json({ ok: true });
  }

  await logEvent({
    type: "whatsapp.inbound",
    actorType: "TECHNICIAN",
    actorId: profile.userId,
    subjectType: "technician_profile",
    subjectId: profile.id,
    payload: { text: text.slice(0, 100) },
  });

  // "1" or "yes" → accept the most recent pending offer
  if (text === "1" || text === "yes" || text === "accept") {
    const offer = await prisma.dispatchOffer.findFirst({
      where: {
        technicianId: profile.id,
        status: "SENT",
        expiresAt: { gt: new Date() },
        dispatch: { status: { in: ["PENDING", "OFFERED"] } },
      },
      orderBy: { sentAt: "desc" },
    });

    if (!offer) {
      await sendWhatsApp({
        to: inbound.phone,
        template: "job_missed",
        params: {},
        subjectType: "technician_profile",
        subjectId: profile.id,
      });
      return NextResponse.json({ ok: true });
    }

    const job = await assignTechnician({
      dispatchId: offer.dispatchId,
      technicianId: profile.id,
      actorType: "TECHNICIAN",
      actorId: profile.userId,
    });

    if (!job) {
      await sendWhatsApp({
        to: inbound.phone,
        template: "job_missed",
        params: {},
        subjectType: "technician_profile",
        subjectId: profile.id,
      });
    }

    return NextResponse.json({ ok: true });
  }

  // Anything else — log for manual follow-up
  await logEvent({
    type: "whatsapp.inbound_unhandled",
    actorType: "TECHNICIAN",
    actorId: profile.userId,
    subjectType: "technician_profile",
    subjectId: profile.id,
    payload: { text: text.slice(0, 200) },
  });

  return NextResponse.json({ ok: true });
}
