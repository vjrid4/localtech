import { logEvent } from "@/lib/events";

/**
 * WhatsApp delivery layer — AiSensy BSP implementation.
 *
 * Without WHATSAPP_API_KEY: every attempted send is recorded as
 * `whatsapp.skipped` so we can see exactly what WOULD have gone out.
 * Add the key to .env and every queued message goes live without
 * touching the dispatch engine.
 *
 * AiSensy dashboard setup:
 *   Create a campaign for each WaTemplate name below (exact match).
 *   Parameter order per campaign must match the `params` array in TEMPLATE_MAP.
 *   Webhook URL → https://localtech.in/api/webhooks/whatsapp
 */

export type WaTemplate =
  | "booking_confirmed"
  | "technician_assigned"
  | "quote_ready"
  | "job_completed"
  | "review_request"
  | "review_reminder"
  | "warranty_reminder"
  | "job_offer"
  | "job_won"
  | "job_missed"
  | "kyc_nudge"
  | "activation_congrats"
  | "weekly_summary";

// Parameter order must match the campaign template body in the BSP dashboard.
const TEMPLATE_MAP: Record<WaTemplate, (p: Record<string, string>) => string[]> = {
  booking_confirmed:    (p) => [p.name, p.reference, p.trackUrl],
  technician_assigned:  (p) => [p.name, p.score, p.repairs, p.trackUrl],
  quote_ready:          (p) => [p.amount, p.trackUrl],
  job_completed:        (p) => [p.warrantyDays, p.trackUrl],
  review_request:       (p) => [p.techName, p.reviewUrl],
  review_reminder:      (p) => [p.techName, p.reviewUrl],
  warranty_reminder:    (p) => [p.trackUrl],
  job_offer:            (p) => [p.device, p.issue, p.area, p.reference],
  job_won:              (p) => [p.customerName, p.phone, p.trackUrl],
  job_missed:           (_) => [],
  kyc_nudge:            (p) => [p.kycUrl],
  activation_congrats:  (p) => [p.name, p.profileUrl],
  weekly_summary:       (p) => [p.completed, p.earned, p.score],
};

/** Normalise phone to 10-digit Indian mobile (strips +91 / 0 prefix). */
function normalisePhone(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^(91|0)/, "").slice(-10);
}

async function sendReal(
  to: string,
  template: WaTemplate,
  params: Record<string, string>,
): Promise<void> {
  const apiKey = process.env.WHATSAPP_API_KEY!;
  const phone = normalisePhone(to);

  // AiSensy campaign message API
  const res = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      campaignName: template,
      destination: `91${phone}`,
      userName: params.name ?? params.customerName ?? params.techName ?? "User",
      templateParams: TEMPLATE_MAP[template](params),
      media: {},
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AiSensy ${res.status}: ${body.slice(0, 200)}`);
  }
}

export async function sendWhatsApp(opts: {
  to: string;
  template: WaTemplate;
  params: Record<string, string>;
  subjectType: string;
  subjectId: string;
}): Promise<void> {
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!apiKey) {
    // Log what would have been sent — keeps the Event table honest.
    await logEvent({
      type: "whatsapp.skipped",
      actorType: "SYSTEM",
      subjectType: opts.subjectType,
      subjectId: opts.subjectId,
      payload: {
        template: opts.template,
        to: opts.to.slice(-4).padStart(10, "x"),
        params: opts.params,
      },
    });
    if (process.env.NODE_ENV !== "production") {
      console.log(`[wa:stub] ${opts.template} → ${opts.to}`, opts.params);
    }
    return;
  }

  try {
    await sendReal(opts.to, opts.template, opts.params);
    await logEvent({
      type: "whatsapp.sent",
      actorType: "SYSTEM",
      subjectType: opts.subjectType,
      subjectId: opts.subjectId,
      payload: { template: opts.template, to: normalisePhone(opts.to) },
    });
  } catch (err) {
    console.error("[wa:send]", opts.template, err);
    await logEvent({
      type: "whatsapp.failed",
      actorType: "SYSTEM",
      subjectType: opts.subjectType,
      subjectId: opts.subjectId,
      payload: { template: opts.template, error: String(err) },
    });
    // Never throw — a failed WhatsApp must never fail the caller
  }
}
