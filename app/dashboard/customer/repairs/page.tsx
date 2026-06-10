"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/auth/client";

type Repair = {
  id: string;
  issue: string;
  status: string;
  priority: string;
  estimatedCost: number | null;
  finalCost: number | null;
  createdAt: string;
  completionDate: string | null;
  device: { brand: string; model: string };
  technician: { user: { name: string } } | null;
};

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "#6366f1", DIAGNOSED: "#8b5cf6", QUOTED: "#f59e0b",
  APPROVED: "#06b6d4", IN_PROGRESS: "#3b82f6", COMPLETED: "#22c55e",
  DELIVERED: "#10b981", CANCELLED: "#ef4444",
};

const STATUS_ORDER = ["RECEIVED","DIAGNOSED","QUOTED","APPROVED","IN_PROGRESS","COMPLETED","DELIVERED"];

function RepairProgress({ status }: { status: string }) {
  const idx = STATUS_ORDER.indexOf(status);
  if (idx === -1) return null;
  return (
    <div className="mt-3">
      <div className="flex items-center gap-0.5">
        {STATUS_ORDER.map((s, i) => (
          <div
            key={s}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i <= idx ? STATUS_COLORS[s] : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-graphite-600">Received</span>
        <span className="text-xs text-graphite-600">Delivered</span>
      </div>
    </div>
  );
}

export default function CustomerRepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    apiGet<{ success: boolean; data: Repair[] }>("/api/repairs")
      .then((r) => setRepairs(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = repairs.filter((r) =>
    active ? r.status !== "DELIVERED" && r.status !== "CANCELLED" : true
  );

  const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">My Repairs</h1>
        <p className="text-graphite-400 mt-1">{repairs.length} total repairs</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActive(true)}
          className={`text-xs px-4 py-2 rounded-lg border transition ${active ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}
        >Active</button>
        <button
          onClick={() => setActive(false)}
          className={`text-xs px-4 py-2 rounded-lg border transition ${!active ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}
        >All History</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="glass rounded-xl p-8 text-center text-red-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-graphite-500 text-sm">No repairs found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="glass rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{r.device.brand} {r.device.model}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: (STATUS_COLORS[r.status] ?? "#666") + "22", color: STATUS_COLORS[r.status] ?? "#aaa" }}>
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-graphite-400 mt-1">{r.issue}</p>
                  {r.technician && (
                    <p className="text-xs text-graphite-500 mt-1">Assigned to {r.technician.user.name}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-lg">{r.finalCost ? formatINR(r.finalCost) : r.estimatedCost ? formatINR(r.estimatedCost) : "—"}</p>
                  <p className="text-xs text-graphite-500">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                  {r.completionDate && (
                    <p className="text-xs text-accent-500">Done {new Date(r.completionDate).toLocaleDateString("en-IN")}</p>
                  )}
                </div>
              </div>
              <RepairProgress status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
