"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Link from "next/link";
import { apiGet } from "@/lib/auth/client";

type ShopDashboard = {
  shop: { id: string; name: string; city: string; rating: number };
  metrics: {
    activeRepairs: number;
    completedThisMonth: number;
    totalRevenue: number;
    activeTechnicians: number;
  };
  recentRepairs: {
    id: string;
    device: string;
    status: string;
    estimatedCost: number | null;
    createdAt: string;
  }[];
};

type Analytics = {
  summary: {
    repairsThisMonth: number;
    repairsThisYear: number;
    completedThisMonth: number;
    revenueThisMonth: number;
    revenueThisYear: number;
    avgTurnaroundTime: number;
  };
  repairStatus: Record<string, number>;
  topTechnicians: { name: string; totalRepairs: number; currentRepairs: number; rating: number }[];
  chartData: {
    monthlyRevenue: { month: string; revenue: number }[];
    repairTrend: { week: string; count: number }[];
  };
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

function StatCard({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-accent-500" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-graphite-500 mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#202020",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

export default function ShopDashboard() {
  const [dash, setDash] = useState<ShopDashboard | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [d, a] = await Promise.all([
          apiGet<{ success: boolean; data: ShopDashboard }>("/api/dashboard/shop"),
          apiGet<{ success: boolean; data: Analytics }>("/api/analytics/shop"),
        ]);
        setDash(d.data);
        setAnalytics(a.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="glass rounded-xl p-8 text-center text-red-400">
      <p className="text-2xl mb-2">⚠️</p>
      <p>{error}</p>
    </div>
  );

  if (!dash || !analytics) return null;

  const pieData = Object.entries(analytics.repairStatus)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({ name: status.replace("_", " "), value: count, color: STATUS_COLORS[status] ?? "#666" }));

  const formatINR = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dash.shop.name}</h1>
          <p className="text-graphite-400 mt-1">{dash.shop.city} · ⭐ {dash.shop.rating} · Live data</p>
        </div>
        <Link
          href="/dashboard/shop/repairs/new"
          className="px-4 py-2.5 bg-accent-500 text-graphite-950 font-bold rounded-xl hover:bg-accent-400 transition text-sm shrink-0"
        >
          + New Repair
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Repairs" value={dash.metrics.activeRepairs} sub="Currently in progress" accent />
        <StatCard label="Revenue This Month" value={formatINR(analytics.summary.revenueThisMonth)} sub={`Year: ${formatINR(analytics.summary.revenueThisYear)}`} accent />
        <StatCard label="Completed This Month" value={analytics.summary.completedThisMonth} sub={`Avg turnaround: ${analytics.summary.avgTurnaroundTime}d`} />
        <StatCard label="Technicians" value={dash.metrics.activeTechnicians} sub="Active staff" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue */}
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Revenue (12 months)">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.chartData.monthlyRevenue}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#606060" tick={{ fill: "#808080", fontSize: 11 }} />
                <YAxis stroke="#606060" tick={{ fill: "#808080", fontSize: 11 }} tickFormatter={(v) => formatINR(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatINR(Number(v)), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Repair Status Pie */}
        <ChartCard title="Repair Status">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  formatter={(value) => <span style={{ color: "#aaa", fontSize: 11 }}>{value}</span>}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-graphite-500 text-sm">No repair data yet</div>
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Repair Trend */}
        <ChartCard title="Weekly Repair Volume">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analytics.chartData.repairTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#606060" tick={{ fill: "#808080", fontSize: 11 }} />
              <YAxis stroke="#606060" tick={{ fill: "#808080", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Technicians */}
        <ChartCard title="Technician Performance">
          {analytics.topTechnicians.length > 0 ? (
            <div className="space-y-3 pt-1">
              {analytics.topTechnicians.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-500 text-xs font-bold shrink-0">
                    {t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-sm font-medium truncate">{t.name}</p>
                      <span className="text-xs text-graphite-400 ml-2 shrink-0">⭐ {t.rating}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-accent-500 rounded-full"
                        style={{ width: `${Math.min(100, (t.totalRepairs / 300) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-graphite-400 shrink-0 w-12 text-right">{t.totalRepairs} jobs</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-graphite-500 text-sm">No technician data</div>
          )}
        </ChartCard>
      </div>

      {/* Recent Repairs */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest">Active Repairs</h3>
          <span className="text-xs text-graphite-500">{dash.recentRepairs.length} records</span>
        </div>
        {dash.recentRepairs.length === 0 ? (
          <p className="text-center text-graphite-500 py-8 text-sm">No active repairs</p>
        ) : (
          <div className="space-y-3">
            {dash.recentRepairs.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.device}</p>
                  <p className="text-xs text-graphite-500">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  {r.estimatedCost && <span className="text-sm text-graphite-300">{formatINR(r.estimatedCost)}</span>}
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: (STATUS_COLORS[r.status] ?? "#666") + "22", color: STATUS_COLORS[r.status] ?? "#aaa" }}
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
