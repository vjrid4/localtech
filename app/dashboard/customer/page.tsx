"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/auth/client";

type CustomerDashboard = {
  metrics: {
    totalDevices: number;
    completedRepairs: number;
    activeWarranties: number;
    totalSpent: number;
  };
  devices: { id: string; brand: string; model: string; color: string | null }[];
  recentRepairs: {
    id: string;
    issue: string;
    status: string;
    completionDate: string | null;
    finalCost: number | null;
  }[];
};

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "#6366f1",
  DIAGNOSED: "#8b5cf6",
  QUOTED: "#f59e0b",
  APPROVED: "#06b6d4",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

const BRAND_ICONS: Record<string, string> = {
  Apple: "🍎",
  Samsung: "📱",
  OnePlus: "🔴",
  Xiaomi: "⚡",
  Realme: "🟡",
  Oppo: "🟢",
};

function StatCard({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-accent-500" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-graphite-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function CustomerDashboard() {
  const [data, setData] = useState<CustomerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<{ success: boolean; data: CustomerDashboard }>("/api/dashboard/customer")
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="glass rounded-xl p-8 text-center text-red-400">
      <p>{error}</p>
    </div>
  );

  if (!data) return null;

  const formatINR = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Devices</h1>
        <p className="text-graphite-400 mt-1">Repair history and device health · Live data</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Devices" value={data.metrics.totalDevices} sub="Registered" accent />
        <StatCard label="Total Spent" value={formatINR(data.metrics.totalSpent)} sub="On repairs" accent />
        <StatCard label="Repairs Done" value={data.metrics.completedRepairs} sub="Completed" />
        <StatCard label="Active Warranties" value={data.metrics.activeWarranties} sub="Under coverage" />
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest mb-4">My Devices</h3>
        {data.devices.length === 0 ? (
          <p className="text-center text-graphite-500 py-10 text-sm">No devices registered yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.devices.map((device) => (
              <div key={device.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-accent-500/20 transition">
                <div className="w-10 h-10 rounded-lg bg-graphite-800 flex items-center justify-center text-xl">
                  {BRAND_ICONS[device.brand] ?? "📱"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{device.brand} {device.model}</p>
                  {device.color && <p className="text-xs text-graphite-500 capitalize">{device.color}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest">Repair History</h3>
          <span className="text-xs text-graphite-500">{data.recentRepairs.length} records</span>
        </div>
        {data.recentRepairs.length === 0 ? (
          <p className="text-center text-graphite-500 py-10 text-sm">No repairs on record</p>
        ) : (
          <div>
            {data.recentRepairs.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium truncate">{r.issue}</p>
                  {r.completionDate && (
                    <p className="text-xs text-graphite-500">{new Date(r.completionDate).toLocaleDateString("en-IN")}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {r.finalCost && (
                    <span className="text-sm font-semibold text-graphite-300">{formatINR(r.finalCost)}</span>
                  )}
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: (STATUS_COLORS[r.status] ?? "#666") + "22",
                      color: STATUS_COLORS[r.status] ?? "#aaa",
                    }}
                  >
                    {r.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
