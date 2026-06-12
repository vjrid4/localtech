import { logEvent } from "@/lib/events";

/**
 * WhatsApp delivery layer — currently a logged no-op.
 *
 * When the BSP account (AiSensy/Interakt) is approved, implement `send()`
 * with their REST API and every queued template below goes live without
 * touching the dispatch engine. Until then each attempted send is recorded
 * to the Event table (`whatsapp.skipped`) so we can measure exactly what
 * WOULD have been sent.
 */

export type WaTemplate =
  | "booking_confirmed"
  | "technician_assigned"
  | "quote_ready"
  | "job_completed"
  | "job_offer"
  | "job_won"
  | "job_missed";

export async function sendWhatsApp(opts: {
  to: string;               // 10-digit Indian mobile
  template: WaTemplate;
  params: Record<string, string>;
  subjectType: string;
  subjectId: string;
}): Promise<void> {
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!apiKey) {
    await logEvent({
      type: "whatsapp.skipped",
      actorType: "SYSTEM",
      subjectType: opts.subjectType,
      subjectId: opts.subjectId,
      payload: { template: opts.template, to: opts.to.slice(-4).padStart(10, "x"), params: opts.params },
    });
    if (process.env.NODE_ENV !== "production") {
      console.log(`[whatsapp:stub] ${opts.template} → ${opts.to}`, opts.params);
    }
    return;
  }

  // TODO(BSP): real send via AiSensy/Interakt API, then log whatsapp.sent
}
