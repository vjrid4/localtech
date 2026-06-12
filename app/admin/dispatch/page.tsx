"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/auth/client";

type Offer = {
  id: string;
  status: string;
  sentAt: string;
  technician: { id: string; user: { name: string } };
};
type Dispatch = {
  id: string;
  status: string;
  wave: number;
  createdAt: string;
  assignedTechId: string | null;
  booking: {
    reference: string; name: string; phone: string;
    deviceType: string; deviceBrand: string | null; deviceModel: string | null;
    issueDescription: string; city: string | null; pincode: string | null; createdAt: string;
  };
  offers: Offer[];
  candidates: { id: string; name: string }[];
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  OFFERED: "bg-blue-500/15 text-blue-400",
  ASSIGNED: "bg-accent-500/15 text-accent-400",
  EXPIRED_TO_MANUAL: "bg-red-500/15 text-red-400",
  CANCELLED: "bg-white/5 text-graphite-500",
};
const OFFER_DOT: Record<string, string> = {
  SENT: "🟡", ACCEPTED: "🟢", DECLINED: "🔴", EXPIRED: "⚪", VIEWED: "🔵",
};

function ageLabel(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function AdminDispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [openOnly, setOpenOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [assignPick, setAssignPick] = useState<Record<string, string>>({});

  const load = useCallback(async (open: boolean) => {
    try {
      const res = await apiGet<{ success: boolean; data: Dispatch[] }>(`/api/admin/dispatches${open ? "?open=1" : ""}`);
      setDispatches(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load(openOnly);
    const iv = setInterval(() => load(openOnly), 30000);
    return () => clearInterval(iv);
  }, [openOnly, load]);

  async function assign(dispatchId: string) {
    const technicianId = assignPick[dispatchId];
    if (!technicianId) return;
    await apiPost("/api/admin/dispatches", { dispatchId, technicianId });
    load(openOnly);
  }

  async function cancel(dispatchId: string) {
    if (!confirm("Cancel this dispatch and the booking?")) return;
    await apiPatch("/api/admin/dispatches", { dispatchId, action: "cancel" });
    load(openOnly);
  }

  const stuck = dispatches.filter((d) => d.status === "EXPIRED_TO_MANUAL").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">
          Dispatch Board
          {stuck > 0 && <span className="ml-3 text-sm px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 align-middle">{stuck} need manual assignment</span>}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setOpenOnly(true)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${openOnly ? "border-accent-500/50 text-accent-400 bg-accent-500/10" : "border-white/10 text-graphite-400"}`}>
            Open
          </button>
          <button onClick={() => setOpenOnly(false)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${!openOnly ? "border-accent-500/50 text-accent-400 bg-accent-500/10" : "border-white/10 text-graphite-400"}`}>
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      ) : dispatches.length === 0 ? (
        <p className="text-graphite-500 text-sm">No {openOnly ? "open " : ""}dispatches. New bookings appear here automatically.</p>
      ) : (
        <div className="space-y-3">
          {dispatches.map((d) => (
            <div key={d.id} className={`glass rounded-xl border p-4 ${d.status === "EXPIRED_TO_MANUAL" ? "border-red-500/40" : "border-white/10"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm">
                    <span className="font-mono text-accent-400">{d.booking.reference}</span>
                    {" · "}{[d.booking.deviceBrand, d.booking.deviceModel].filter(Boolean).join(" ") || d.booking.deviceType}
                    <span className="text-graphite-500 font-normal"> · {ageLabel(d.createdAt)} ago · wave {d.wave}</span>
                  </p>
                  <p className="text-xs text-graphite-400 mt-1">
                    {d.booking.name} <a href={`tel:${d.booking.phone}`} className="text-accent-400">📞 {d.booking.phone}</a>
                    {d.booking.pincode ? ` · ${d.booking.pincode}` : d.booking.city ? ` · ${d.booking.city}` : ""}
                  </p>
                  <p className="text-xs text-graphite-500 mt-1 line-clamp-2">{d.booking.issueDescription}</p>
                  {d.offers.length > 0 && (
                    <p className="text-xs text-graphite-500 mt-2">
                      Offers: {d.offers.map((o) => `${OFFER_DOT[o.status] ?? "·"} ${o.technician.user.name}`).join("  ")}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_STYLE[d.status] ?? "bg-white/5 text-graphite-400"}`}>
                  {d.status.replace(/_/g, " ")}
                </span>
              </div>

              {["PENDING", "OFFERED", "EXPIRED_TO_MANUAL"].includes(d.status) && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  <select
                    value={assignPick[d.id] ?? ""}
                    onChange={(e) => setAssignPick((p) => ({ ...p, [d.id]: e.target.value }))}
                    className="flex-1 min-w-[180px] text-xs bg-graphite-900 border border-white/10 rounded-lg px-2 py-2 text-graphite-300"
                  >
                    <option value="">Assign manually…</option>
                    {d.candidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button onClick={() => assign(d.id)} disabled={!assignPick[d.id]}
                    className="text-xs px-4 py-2 rounded-lg bg-accent-500 text-graphite-950 font-bold hover:bg-accent-400 transition disabled:opacity-40">
                    Assign
                  </button>
                  <button onClick={() => cancel(d.id)}
                    className="text-xs px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
