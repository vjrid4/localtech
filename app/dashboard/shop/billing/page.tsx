"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/auth/client";

type Invoice = {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  repair: { issue: string; status: string };
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PAID: "#22c55e",
  OVERDUE: "#ef4444",
  CANCELLED: "#6b7280",
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const url = filter ? `/api/invoices?status=${filter}` : "/api/invoices";
    apiGet<{ success: boolean; data: Invoice[] }>(url)
      .then((r) => setInvoices(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const totalRevenue = invoices.filter((i) => i.paymentStatus === "PAID").reduce((s, i) => s + i.totalAmount, 0);
  const pendingRevenue = invoices.filter((i) => i.paymentStatus === "PENDING").reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-graphite-400 mt-1">{invoices.length} invoices</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">Collected</p>
          <p className="text-3xl font-bold text-accent-500">{formatINR(totalRevenue)}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{formatINR(pendingRevenue)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {["", "PAID", "PENDING", "OVERDUE"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-2 rounded-lg border transition ${filter === s ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-graphite-500 text-sm">No invoices found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Invoice</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3 hidden md:table-cell">Repair</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Method</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Status</th>
                <th className="text-right text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition">
                  <td className="py-3 px-5">
                    <p className="font-mono font-medium text-xs text-graphite-200">{inv.invoiceNumber}</p>
                    <p className="text-xs text-graphite-500">{new Date(inv.createdAt).toLocaleDateString("en-IN")}</p>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <p className="text-graphite-300 truncate max-w-40 text-xs">{inv.repair.issue}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-graphite-400">{inv.paymentMethod.replace("_", " ")}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: (PAYMENT_STATUS_COLORS[inv.paymentStatus] ?? "#666") + "22", color: PAYMENT_STATUS_COLORS[inv.paymentStatus] ?? "#aaa" }}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <p className="font-bold">{formatINR(inv.totalAmount)}</p>
                    <p className="text-xs text-graphite-500">+GST {formatINR(inv.tax)}</p>
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
