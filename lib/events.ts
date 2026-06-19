import { prisma } from "@/lib/db/prisma";

/**
 * Append-only domain event log — the single most important table for the
 * 10-year plan. Every metric, trust score, fraud baseline, and ML training
 * set derives from these rows. Rules:
 *   • append-only — never update or delete
 *   • fire-and-forget — logging must NEVER break the calling flow
 *   • payload carries before/after snapshots for state changes
 *
 * Canonical types (dot notation): booking.created, lead.created,
 * technician.applied/approved/activated/suspended, dispatch.created,
 * offer.sent/accepted/declined/expired, job.assigned/status_changed/
 * quoted/completed/cancelled, review.submitted, warranty.created/
 * claim_filed/resolved, auth.registered/login, admin.*
 */
export async function logEvent(e: {
  type: string;
  actorType: "CUSTOMER" | "TECHNICIAN" | "ADMIN" | "REPAIR_SHOP_OWNER" | "SUPPLIER" | "SYSTEM";
  actorId?: string;
  subjectType: string;
  subjectId: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.event.create({
      data: {
        type: e.type,
        actorType: e.actorType,
        actorId: e.actorId ?? null,
        subjectType: e.subjectType,
        subjectId: e.subjectId,
        payload: (e.payload ?? undefined) as never,
      },
    });
  } catch (err) {
    // Never let event logging break a user-facing flow
    console.error("[events] failed to log", e.type, err);
  }
}
