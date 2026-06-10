"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/auth/client";
import StatusUpdateDrawer from "@/components/StatusUpdateDrawer";

type Repair = {
  id: string;
  issue: string;
  status: string;
  priority: string;
  diagnosis: string | null;
  estimatedCost: number | null;
  finalCost: number | null;
  createdAt: string;
  completionDate: string | null;
  customer: { user: { name: string; phone: string | null } };
  device: { brand: string; model: string };
  technician: { user: { name: string } } | null;
};

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "#6366f1", DIAGNOSED: "#8b5cf6", QUOTED: "#f59e0b",
  APPROVED: "#06b6d4", IN_PROGRESS: "#3b82f6", COMPLETED: "#22c55e",
  DELIVERED: "#10b981", CANCELLED: "#ef4444",
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#6b7280", MEDIUM: "#3b82f6", HIGH: "#f59e0b", URGENT: "#ef4444",
};
const ALL_STATUSES = ["RECEIVED","DIAGNOSED","QUOTED","APPROVED","IN_PROGRESS","COMPLETED","DELIVERED","CANCELLED"];

export default function ShopRepairsPage() {
  const searchParams = useSearchParams();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(searchParams?.get("created") === "1");

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    const url = statusFilter ? `/api/repairs?status=${statusFilter}` : "/api/repairs";
    apiGet<{ success: boolean; data: Repair[] }>(url)
      .then((r) => setRepairs(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = repairs.filter((r) =>
    !search ||
    r.issue.toLowerCase().includes(search.toLowerCase()) ||
    r.customer.user.name.toLowerCase().includes(search.toLowerCase()) ||
    r.device.brand.toLowerCase().includes(search.toLowerCase()) ||
    r.device.model.toLowerCase().includes(search.toLowerCase())
  );

  const formatINR = (n: number) =>
    n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="glass rounded-xl p-4 border border-accent-500/30 text-accent-400 text-sm flex items-center gap-2 animate-fade-in">
          <span className="text-base">✓</span>
          Repair job created successfully!
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Repairs</h1>
          <p className="text-graphite-400 mt-1">{repairs.length} total · {filtered.length} shown</p>
        </div>
        <Link
          href="/dashboard/shop/repairs/new"
          className="px-4 py-2.5 bg-accent-500 text-graphite-950 font-bold rounded-xl hover:bg-accent-400 transition text-sm"
        >
          + New Repair
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search issue, customer, device..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`text-xs px-3 py-2 rounded-lg border transition ${!statusFilter ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}
          >All</button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-2 rounded-lg border transition ${statusFilter === s ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}
            >{s.replace("_", " ")}</button>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-graphite-500 text-sm">No repairs found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Device / Issue</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Customer</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3 hidden md:table-cell">Technician</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Status</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Priority</th>
                <th className="text-right text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Cost / Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition">
                  <td className="py-3 px-5">
                    <p className="font-medium">{r.device.brand} {r.device.model}</p>
                    <p className="text-xs text-graphite-400 mt-0.5 truncate max-w-48">{r.issue}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium">{r.customer.user.name}</p>
                    <p className="text-xs text-graphite-500">{r.customer.user.phone ?? "—"}</p>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <p className="text-graphite-300">{r.technician?.user.name ?? <span className="text-graphite-600">Unassigned</span>}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: (STATUS_COLORS[r.status] ?? "#666") + "22", color: STATUS_COLORS[r.status] ?? "#aaa" }}>
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-bold" style={{ color: PRIORITY_COLORS[r.priority] ?? "#aaa" }}>{r.priority}</span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <p className="font-medium">{r.finalCost ? formatINR(r.finalCost) : r.estimatedCost ? formatINR(r.estimatedCost) : "—"}</p>
                      <StatusUpdateDrawer
                        repairId={r.id}
                        currentStatus={r.status}
                        currentDiagnosis={r.diagnosis}
                        currentEstimatedCost={r.estimatedCost}
                        onUpdated={(newStatus, fields) => {
                          setRepairs((prev) =>
                            prev.map((rep) =>
                              rep.id === r.id ? { ...rep, status: newStatus, ...fields } : rep
                            )
                          );
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
