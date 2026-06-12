"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/auth/client";

type Claim = {
  id: string;
  status: string;
  description: string;
  createdAt: string;
  redoJobId: string | null;
  job: { reference: string; quoteAmount: number | null; completedAt: string | null; technician: { user: { name: string } } };
  booking: { name: string; phone: string; deviceType: string; deviceBrand: string | null; deviceModel: string | null; city: string | null; pincode: string | null } | null;
};

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-red-500/15 text-red-400",
  REDO_SCHEDULED: "bg-blue-500/15 text-blue-400",
  RESOLVED: "bg-accent-500/15 text-accent-400",
  REJECTED: "bg-white/5 text-graphite-500",
};

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [openOnly, setOpenOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async (open: boolean) => {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: Claim[] }>(`/api/admin/claims${open ? "?open=1" : ""}`);
      setClaims(res.data);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(openOnly); }, [openOnly, load]);

  async function act(id: string, action: "redo" | "resolve" | "reject") {
    if (action === "redo" && !confirm("Create a free redo booking and dispatch it? The original technician's redo count increases.")) return;
    const res = await apiPatch<{ success: boolean; data?: { redoReference?: string } }>("/api/admin/claims", { id, action });
    if (action === "redo" && res.data?.redoReference) {
      setNotice(`Redo booking ${res.data.redoReference} created and dispatched — assign it on the Dispatch board.`);
    }
    load(openOnly);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Warranty Claims</h1>
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

      {notice && (
        <div className="px-4 py-3 rounded-xl bg-accent-500/10 border border-accent-500/30 text-accent-400 text-sm flex justify-between gap-3">
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      ) : claims.length === 0 ? (
        <p className="text-graphite-500 text-sm">No {openOnly ? "open " : ""}claims. 🎉</p>
      ) : (
        <div className="space-y-3">
          {claims.map((c) => (
            <div key={c.id} className={`glass rounded-xl border p-4 ${c.status === "OPEN" ? "border-red-500/40" : "border-white/10"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm">
                    <span className="font-mono text-accent-400">{c.job.reference}</span>
                    {c.booking && <> · {[c.booking.deviceBrand, c.booking.deviceModel].filter(Boolean).join(" ") || c.booking.deviceType}</>}
                    <span className="text-graphite-500 font-normal"> · fixed by {c.job.technician.user.name}</span>
                  </p>
                  {c.booking && (
                    <p className="text-xs text-graphite-400 mt-1">
                      {c.booking.name} <a href={`tel:${c.booking.phone}`} className="text-accent-400">📞 {c.booking.phone}</a>
                      {c.booking.pincode ? ` · ${c.booking.pincode}` : c.booking.city ? ` · ${c.booking.city}` : ""}
                      {" "}· filed {new Date(c.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                  <p className="text-sm text-graphite-300 mt-2 whitespace-pre-wrap">{c.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_STYLE[c.status]}`}>{c.status.replace(/_/g, " ")}</span>
              </div>

              {c.status === "OPEN" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => act(c.id, "redo")}
                    className="flex-1 py-2 rounded-lg bg-accent-500 text-graphite-950 text-xs font-bold hover:bg-accent-400 transition">
                    Schedule free redo
                  </button>
                  <button onClick={() => act(c.id, "resolve")}
                    className="px-4 py-2 rounded-lg border border-white/10 text-graphite-300 text-xs hover:text-white transition">
                    Resolved on call
                  </button>
                  <button onClick={() => act(c.id, "reject")}
                    className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition">
                    Reject
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
