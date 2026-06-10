"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/auth/client";

type SupplierDashboard = {
  metrics: { totalOrders: number; thisMonthRevenue: number; rating: number; activeProducts: number };
  recentOrders: { id: string; orderNumber: string; status: string; totalAmount: number; createdAt: string }[];
  topProducts: { id: string; name: string; sold: number; sellingPrice: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#06b6d4", SHIPPED: "#3b82f6",
  DELIVERED: "#22c55e", CANCELLED: "#ef4444",
};

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<SupplierDashboard["recentOrders"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    apiGet<{ success: boolean; data: SupplierDashboard }>("/api/dashboard/supplier")
      .then((r) => setOrders(r.data.recentOrders))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;
  const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-graphite-400 mt-1">{orders.length} orders · {filtered.length} shown</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("")}
          className={`text-xs px-3 py-2 rounded-lg border transition ${!filter ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}
        >All</button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-2 rounded-lg border transition ${filter === s ? "border-white/20 text-white bg-white/8" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}
            style={filter === s ? { background: (STATUS_COLORS[s] ?? "#666") + "22", borderColor: STATUS_COLORS[s] + "44", color: STATUS_COLORS[s] } : {}}
          >{s}</button>
        ))}
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-graphite-500 text-sm">No orders found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Order #</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Date</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Status</th>
                <th className="text-right text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition">
                  <td className="py-3 px-5">
                    <p className="font-mono font-medium text-sm">{o.orderNumber}</p>
                  </td>
                  <td className="py-3 px-3 text-graphite-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: (STATUS_COLORS[o.status] ?? "#666") + "22", color: STATUS_COLORS[o.status] ?? "#aaa" }}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right font-bold">{formatINR(o.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
