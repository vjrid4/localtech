"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { apiGet } from "@/lib/auth/client";

type SupplierDashboard = {
  metrics: {
    totalOrders: number;
    thisMonthRevenue: number;
    rating: number;
    activeProducts: number;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
  topProducts: {
    id: string;
    name: string;
    sold: number;
    sellingPrice: number;
  }[];
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#06b6d4",
  SHIPPED: "#3b82f6",
  DELIVERED: "#22c55e",
  CANCELLED: "#ef4444",
};

const CHART_COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

const tooltipStyle = {
  backgroundColor: "#202020",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
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

export default function SupplierDashboard() {
  const [data, setData] = useState<SupplierDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<{ success: boolean; data: SupplierDashboard }>("/api/dashboard/supplier")
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
        <h1 className="text-3xl font-bold">Supplier Portal</h1>
        <p className="text-graphite-400 mt-1">Rating: {data.metrics.rating} · Orders and inventory · Live data</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="This Month Revenue" value={formatINR(data.metrics.thisMonthRevenue)} sub="Received orders" accent />
        <StatCard label="Total Orders" value={data.metrics.totalOrders} sub="All time" accent />
        <StatCard label="Active Products" value={data.metrics.activeProducts} sub="In catalogue" />
        <StatCard label="Rating" value={data.metrics.rating} sub="Shop satisfaction" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest mb-4">Top Parts by Usage</h3>
          {data.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.topProducts} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#606060" tick={{ fill: "#808080", fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  stroke="#606060"
                  tick={{ fill: "#aaa", fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Times used"]} />
                <Bar dataKey="sold" radius={[0, 4, 4, 0]}>
                  {data.topProducts.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-graphite-500 text-sm">No product usage data</div>
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest mb-4">Order Status Summary</h3>
          {data.recentOrders.length > 0 ? (
            <div className="space-y-3 pt-2">
              {(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((s) => {
                const count = data.recentOrders.filter((o) => o.status === s).length;
                if (count === 0) return null;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold w-20 shrink-0"
                      style={{ color: ORDER_STATUS_COLORS[s] }}
                    >{s}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(count / data.recentOrders.length) * 100}%`,
                          background: ORDER_STATUS_COLORS[s],
                        }}
                      />
                    </div>
                    <span className="text-xs text-graphite-400 w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-graphite-500 text-sm">No orders yet</div>
          )}
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest">Recent Orders</h3>
          <span className="text-xs text-graphite-500">{data.recentOrders.length} records</span>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="text-center text-graphite-500 py-10 text-sm">No orders received yet</p>
        ) : (
          <div>
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-mono font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-graphite-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-graphite-300">{formatINR(order.totalAmount)}</span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: (ORDER_STATUS_COLORS[order.status] ?? "#666") + "22",
                      color: ORDER_STATUS_COLORS[order.status] ?? "#aaa",
                    }}
                  >
                    {order.status}
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
