"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { apiGet } from "@/lib/auth/client";

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
  RECEIVED: "#6366f1", DIAGNOSED: "#8b5cf6", QUOTED: "#f59e0b",
  APPROVED: "#06b6d4", IN_PROGRESS: "#3b82f6", COMPLETED: "#22c55e",
  DELIVERED: "#10b981", CANCELLED: "#ef4444",
};

const tooltipStyle = {
  backgroundColor: "#202020",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function ShopAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ success: boolean; data: Analytics }>("/api/analytics/shop")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return null;

  const formatINR = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  const pieData = Object.entries(data.repairStatus)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({ name: status.replace("_", " "), value: count, color: STATUS_COLORS[status] ?? "#666" }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-graphite-400 mt-1">Full business intelligence view</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Revenue This Month", value: formatINR(data.summary.revenueThisMonth) },
          { label: "Revenue This Year", value: formatINR(data.summary.revenueThisYear) },
          { label: "Repairs This Month", value: data.summary.repairsThisMonth },
          { label: "Completed This Month", value: data.summary.completedThisMonth },
          { label: "Repairs This Year", value: data.summary.repairsThisYear },
          { label: "Avg Turnaround", value: `${data.summary.avgTurnaroundTime}d` },
        ].map((k) => (
          <div key={k.label} className="glass rounded-xl p-5">
            <p className="text-xs text-graphite-400 uppercase tracking-widest mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-accent-500">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <Card title="Monthly Revenue — 12 Months">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.chartData.monthlyRevenue}>
            <defs>
              <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#606060" tick={{ fill: "#808080", fontSize: 11 }} />
            <YAxis stroke="#606060" tick={{ fill: "#808080", fontSize: 11 }} tickFormatter={formatINR} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatINR(Number(v)), "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revG)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly trend */}
        <Card title="Weekly Repair Volume — 12 Weeks">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.chartData.repairTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#606060" tick={{ fill: "#808080", fontSize: 11 }} />
              <YAxis stroke="#606060" tick={{ fill: "#808080", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status breakdown */}
        <Card title="Repair Status Breakdown">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(v) => <span style={{ color: "#aaa", fontSize: 11 }}>{v}</span>} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-graphite-500 text-sm">No data yet</div>
          )}
        </Card>
      </div>

      {/* Technician leaderboard */}
      <Card title="Technician Leaderboard">
        {data.topTechnicians.length > 0 ? (
          <div className="space-y-3">
            {data.topTechnicians.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-graphite-600 w-5 text-right">{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-500 text-xs font-bold">{t.name[0]}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <span className="text-xs text-graphite-400">⭐ {t.rating}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-accent-500 rounded-full" style={{ width: `${Math.min(100, (t.totalRepairs / 300) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-xs text-graphite-400 w-16 text-right">{t.totalRepairs} repairs</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-graphite-500 text-sm">No technician data</div>
        )}
      </Card>
    </div>
  );
}
