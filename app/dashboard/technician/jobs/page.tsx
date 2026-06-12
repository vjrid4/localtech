"use client";

/**
 * /dashboard/technician/jobs — the marketplace technician's whole world:
 * live offers with countdown, active jobs with one-tap status progression,
 * quote entry, and recent history.
 */

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/auth/client";

type Booking = {
  reference?: string;
  name?: string;
  phone?: string;
  deviceType: string;
  deviceBrand: string | null;
  deviceModel: string | null;
  issueDescription: string;
  city: string | null;
  pincode: string | null;
};
type Offer = { id: string; expiresAt: string; booking: Booking };
type Job = {
  id: string;
  reference: string;
  status: string;
  quoteAmount: number | null;
  booking: Booking | null;
};

const NEXT_ACTION: Record<string, { status?: string; label: string; quote?: boolean }> = {
  ASSIGNED:       { status: "EN_ROUTE",   label: "On my way 🛵" },
  EN_ROUTE:       { status: "DIAGNOSED",  label: "Diagnosed ✓" },
  DIAGNOSED:      { quote: true,          label: "Send quote" },
  QUOTED:         {                       label: "Waiting for customer approval…" },
  QUOTE_APPROVED: { status: "IN_PROGRESS",label: "Start repair 🔧" },
  IN_PROGRESS:    { status: "COMPLETED",  label: "Mark completed ✅" },
};

const STATUS_BADGE: Record<string, string> = {
  ASSIGNED: "bg-blue-500/15 text-blue-400",
  EN_ROUTE: "bg-blue-500/15 text-blue-400",
  DIAGNOSED: "bg-violet-500/15 text-violet-400",
  QUOTED: "bg-amber-500/15 text-amber-400",
  QUOTE_APPROVED: "bg-accent-500/15 text-accent-400",
  IN_PROGRESS: "bg-accent-500/15 text-accent-400",
  COMPLETED: "bg-accent-500/15 text-accent-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

function deviceLabel(b: Booking | null) {
  if (!b) return "Device";
  return [b.deviceBrand, b.deviceModel].filter(Boolean).join(" ") || b.deviceType;
}

function Countdown({ until }: { until: string }) {
  const [left, setLeft] = useState(Math.max(0, new Date(until).getTime() - Date.now()));
  useEffect(() => {
    const iv = setInterval(() => setLeft(Math.max(0, new Date(until).getTime() - Date.now())), 1000);
    return () => clearInterval(iv);
  }, [until]);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return <span className={`font-mono text-xs ${left < 120000 ? "text-red-400" : "text-amber-400"}`}>{m}:{String(s).padStart(2, "0")}</span>;
}

export default function TechnicianJobsPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [active, setActive] = useState<Job[]>([]);
  const [recent, setRecent] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [quoteFor, setQuoteFor] = useState<string | null>(null);
  const [quoteAmt, setQuoteAmt] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await apiGet<{ success: boolean; data: { offers: Offer[]; active: Job[]; recent: Job[] } }>("/api/jobs");
      setOffers(res.data.offers);
      setActive(res.data.active);
      setRecent(res.data.recent);
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 20000); // poll — offers are time-critical
    return () => clearInterval(iv);
  }, [load]);

  async function respond(offerId: string, action: "accept" | "decline") {
    try {
      const res = await apiPost<{ success: boolean; data?: { won?: boolean }; message?: string }>(
        `/api/offers/${offerId}`, { action });
      if (action === "accept" && res.data?.won) setNotice("🎉 Job is yours! Customer details unlocked below.");
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Could not respond");
    }
    load();
  }

  async function advance(job: Job) {
    const next = NEXT_ACTION[job.status];
    if (!next?.status) return;
    const reason = next.status === "CANCELLED" ? prompt("Reason?") ?? undefined : undefined;
    try {
      await apiPatch(`/api/jobs/${job.id}`, { action: "status", status: next.status, reason });
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Update failed");
    }
    load();
  }

  async function sendQuote(jobId: string) {
    const amt = parseInt(quoteAmt, 10);
    if (!amt || amt < 1) return;
    try {
      await apiPatch(`/api/jobs/${jobId}`, { action: "quote", amountRupees: amt });
      setQuoteFor(null);
      setQuoteAmt("");
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "Quote failed");
    }
    load();
  }

  if (loading) return <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Marketplace Jobs</h1>
      {notice && (
        <div className="px-4 py-3 rounded-xl bg-accent-500/10 border border-accent-500/30 text-accent-400 text-sm flex justify-between gap-3">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="shrink-0">✕</button>
        </div>
      )}

      {/* ── New offers ── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-graphite-400 mb-3">
          New offers {offers.length > 0 && <span className="text-accent-400">({offers.length})</span>}
        </h2>
        {offers.length === 0 ? (
          <p className="text-graphite-500 text-sm">No open offers right now — new jobs appear here instantly.</p>
        ) : (
          <div className="space-y-3">
            {offers.map((o) => (
              <div key={o.id} className="glass rounded-xl border border-accent-500/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm">🔧 {deviceLabel(o.booking)}</p>
                    <p className="text-xs text-graphite-400 mt-1 line-clamp-2">{o.booking.issueDescription}</p>
                    <p className="text-xs text-graphite-500 mt-1">
                      📍 {o.booking.pincode ?? o.booking.city ?? "—"} · expires in <Countdown until={o.expiresAt} />
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => respond(o.id, "accept")}
                    className="flex-1 py-2.5 rounded-lg bg-accent-500 text-graphite-950 text-sm font-bold hover:bg-accent-400 transition">
                    Accept job
                  </button>
                  <button onClick={() => respond(o.id, "decline")}
                    className="px-4 py-2.5 rounded-lg border border-white/10 text-graphite-400 text-sm hover:text-white transition">
                    Pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Active jobs ── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-graphite-400 mb-3">Active jobs</h2>
        {active.length === 0 ? (
          <p className="text-graphite-500 text-sm">No active jobs.</p>
        ) : (
          <div className="space-y-3">
            {active.map((j) => {
              const next = NEXT_ACTION[j.status];
              return (
                <div key={j.id} className="glass rounded-xl border border-white/10 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm">
                        <span className="font-mono text-accent-400">{j.reference}</span> · {deviceLabel(j.booking)}
                      </p>
                      {j.booking && (
                        <p className="text-xs text-graphite-400 mt-1">
                          {j.booking.name}
                          {j.booking.phone && <a href={`tel:${j.booking.phone}`} className="ml-2 text-accent-400">📞 {j.booking.phone}</a>}
                          {j.booking.pincode ? ` · ${j.booking.pincode}` : j.booking.city ? ` · ${j.booking.city}` : ""}
                        </p>
                      )}
                      <p className="text-xs text-graphite-500 mt-1 line-clamp-2">{j.booking?.issueDescription}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_BADGE[j.status] ?? "bg-white/5 text-graphite-400"}`}>
                      {j.status.replace(/_/g, " ")}
                      {j.quoteAmount ? ` · ₹${(j.quoteAmount / 100).toLocaleString("en-IN")}` : ""}
                    </span>
                  </div>

                  {quoteFor === j.id ? (
                    <div className="flex gap-2 mt-3">
                      <input
                        value={quoteAmt}
                        onChange={(e) => setQuoteAmt(e.target.value.replace(/\D/g, ""))}
                        placeholder="Amount in ₹"
                        inputMode="numeric"
                        className="flex-1 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                        autoFocus
                      />
                      <button onClick={() => sendQuote(j.id)}
                        className="px-4 py-2.5 rounded-lg bg-accent-500 text-graphite-950 text-sm font-bold">Send</button>
                      <button onClick={() => setQuoteFor(null)}
                        className="px-3 py-2.5 rounded-lg border border-white/10 text-graphite-400 text-sm">✕</button>
                    </div>
                  ) : next ? (
                    <div className="flex gap-2 mt-3">
                      {next.quote ? (
                        <button onClick={() => setQuoteFor(j.id)}
                          className="flex-1 py-2.5 rounded-lg bg-accent-500 text-graphite-950 text-sm font-bold hover:bg-accent-400 transition">
                          {next.label}
                        </button>
                      ) : next.status ? (
                        <button onClick={() => advance(j)}
                          className="flex-1 py-2.5 rounded-lg bg-accent-500 text-graphite-950 text-sm font-bold hover:bg-accent-400 transition">
                          {next.label}
                        </button>
                      ) : (
                        <p className="text-xs text-graphite-500 py-2">{next.label}</p>
                      )}
                      {!["QUOTED"].includes(j.status) && (
                        <button
                          onClick={async () => {
                            const reason = prompt("Cancel reason?");
                            if (reason === null) return;
                            await apiPatch(`/api/jobs/${j.id}`, { action: "status", status: "CANCELLED", reason });
                            load();
                          }}
                          className="px-3 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition">
                          Cancel
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Recent ── */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-graphite-400 mb-3">Recent</h2>
          <div className="space-y-2">
            {recent.map((j) => (
              <div key={j.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm">
                <span className="text-graphite-300 truncate">
                  <span className="font-mono text-graphite-500">{j.reference}</span> · {deviceLabel(j.booking)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[j.status]}`}>{j.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
