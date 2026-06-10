"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/auth/client";

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

type UninvoicedRepair = {
  id: string;
  issue: string;
  finalCost: number | null;
  estimatedCost: number | null;
  completionDate: string | null;
  customer: { user: { name: string; phone: string | null } };
  device: { brand: string; model: string };
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PAID: "#22c55e",
  OVERDUE: "#ef4444",
  CANCELLED: "#6b7280",
};

const PAYMENT_METHODS = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "WHATSAPP_PAY"] as const;

const GST_RATES = [0, 5, 12, 18, 28];

function InvoiceModal({
  repair,
  onClose,
  onCreated,
}: {
  repair: UninvoicedRepair;
  onClose: () => void;
  onCreated: (inv: Invoice) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [gstRate, setGstRate] = useState(18);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = repair.finalCost ?? repair.estimatedCost ?? 0;
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  async function generate() {
    setSubmitting(true);
    setError("");
    try {
      const r = await apiPost<{ success: boolean; data: Invoice }>("/api/invoices", {
        repairId: repair.id,
        paymentMethod,
        gstRate,
      });
      onCreated(r.data);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md glass rounded-2xl p-6 border border-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Generate Invoice</h3>
          <button onClick={onClose} className="text-graphite-500 hover:text-white transition text-lg leading-none">✕</button>
        </div>

        {/* Repair summary */}
        <div className="glass rounded-xl p-4 border border-white/5">
          <p className="font-medium text-sm mb-0.5">{repair.device.brand} {repair.device.model}</p>
          <p className="text-xs text-graphite-400 mb-2">{repair.issue}</p>
          <p className="text-xs text-graphite-500">{repair.customer.user.name} · {repair.customer.user.phone ?? "—"}</p>
        </div>

        {/* GST rate */}
        <div>
          <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">GST Rate</p>
          <div className="flex gap-2 flex-wrap">
            {GST_RATES.map((r) => (
              <button
                key={r}
                onClick={() => setGstRate(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${gstRate === r ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">Payment Method</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${paymentMethod === m ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}
              >
                {m.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="glass rounded-xl p-4 border border-accent-500/15 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-graphite-400">Subtotal</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-graphite-400">GST ({gstRate}%)</span>
            <span>{fmt(gstAmount)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-white/10 pt-2 text-base">
            <span>Total</span>
            <span className="text-accent-400">{fmt(total)}</span>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-graphite-400 hover:text-white transition text-sm">Cancel</button>
          <button
            onClick={generate}
            disabled={submitting || subtotal <= 0}
            className="flex-1 py-2.5 rounded-xl bg-accent-500 text-graphite-950 font-bold hover:bg-accent-400 transition disabled:opacity-40 text-sm"
          >
            {submitting ? "Generating…" : "Generate Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uninvoiced, setUninvoiced] = useState<UninvoicedRepair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [modalRepair, setModalRepair] = useState<UninvoicedRepair | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<{ success: boolean; data: Invoice[] }>(filter ? `/api/invoices?status=${filter}` : "/api/invoices"),
      apiGet<{ success: boolean; data: UninvoicedRepair[] }>("/api/repairs?uninvoiced=1"),
    ])
      .then(([invRes, repRes]) => {
        setInvoices(invRes.data);
        setUninvoiced(repRes.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const totalRevenue = invoices.filter((i) => i.paymentStatus === "PAID").reduce((s, i) => s + i.totalAmount, 0);
  const pendingRevenue = invoices.filter((i) => i.paymentStatus === "PENDING").reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-graphite-400 mt-1">{invoices.length} invoices · {uninvoiced.length} awaiting invoice</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">Collected</p>
          <p className="text-2xl font-bold text-accent-500">{fmt(totalRevenue)}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">Pending</p>
          <p className="text-2xl font-bold text-amber-400">{fmt(pendingRevenue)}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">Total Invoiced</p>
          <p className="text-2xl font-bold">{fmt(invoices.reduce((s, i) => s + i.totalAmount, 0))}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">Ready to Invoice</p>
          <p className="text-2xl font-bold text-blue-400">{uninvoiced.length}</p>
        </div>
      </div>

      {/* Uninvoiced completed repairs */}
      {uninvoiced.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="font-bold text-sm uppercase tracking-widest text-blue-400">Ready to Invoice ({uninvoiced.length})</h2>
          </div>
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Device / Issue</th>
                  <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Customer</th>
                  <th className="text-right text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Amount</th>
                  <th className="text-right text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Action</th>
                </tr>
              </thead>
              <tbody>
                {uninvoiced.map((r) => {
                  const cost = r.finalCost ?? r.estimatedCost ?? 0;
                  return (
                    <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition">
                      <td className="py-3 px-5">
                        <p className="font-medium">{r.device.brand} {r.device.model}</p>
                        <p className="text-xs text-graphite-400 truncate max-w-48">{r.issue}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium">{r.customer.user.name}</p>
                        <p className="text-xs text-graphite-500">{r.customer.user.phone ?? "—"}</p>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <p className="font-bold">{cost > 0 ? fmt(cost) : "—"}</p>
                        {cost <= 0 && <p className="text-xs text-amber-400">Set final cost first</p>}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={() => setModalRepair(r)}
                          disabled={cost <= 0}
                          className="px-3 py-1.5 rounded-lg bg-accent-500/15 border border-accent-500/30 text-accent-400 text-xs font-medium hover:bg-accent-500/25 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Generate Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm uppercase tracking-widest text-graphite-400">Invoice History</h2>
          <div className="flex gap-2">
            {["", "PAID", "PENDING", "OVERDUE"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${filter === s ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}
              >
                {s || "All"}
              </button>
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
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-graphite-500 text-sm">
              No invoices yet.{uninvoiced.length > 0 ? " Generate your first invoice above." : ""}
            </div>
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
                      <p className="font-bold">{fmt(inv.totalAmount)}</p>
                      <p className="text-xs text-graphite-500">incl. GST {fmt(inv.tax)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalRepair && (
        <InvoiceModal
          repair={modalRepair}
          onClose={() => setModalRepair(null)}
          onCreated={(inv) => {
            setInvoices((prev) => [inv, ...prev]);
            setUninvoiced((prev) => prev.filter((r) => r.id !== modalRepair.id));
          }}
        />
      )}
    </div>
  );
}
