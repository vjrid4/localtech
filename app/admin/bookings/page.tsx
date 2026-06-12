"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost } from "@/lib/auth/client";

type Booking = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  deviceType: string;
  deviceBrand: string | null;
  deviceModel: string | null;
  issueDescription: string;
  status: string;
  createdAt: string;
  dispatch: { id: string; status: string } | null;
};

const STATUSES = ["PENDING", "ASSIGNED", "CONVERTED", "CANCELLED"];
const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  ASSIGNED: "bg-blue-500/15 text-blue-400",
  CONVERTED: "bg-accent-500/15 text-accent-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load(status: string) {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: Booking[] }>(
        `/api/admin/bookings${status ? `?status=${status}` : ""}`
      );
      setBookings(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(filter); }, [filter]);

  async function updateStatus(id: string, status: string) {
    await apiPatch("/api/admin/bookings", { id, status });
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  async function sendToDispatch(id: string) {
    try {
      await apiPost("/api/admin/bookings/dispatch", { bookingId: id });
      alert("✅ Dispatched — offers are going out. Manage it on the Dispatch board.");
      load(filter);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Dispatch failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <div className="flex gap-2">
          {["", ...STATUSES].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                filter === s ? "border-accent-500/50 text-accent-400 bg-accent-500/10" : "border-white/10 text-graphite-400 hover:text-white"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      ) : bookings.length === 0 ? (
        <p className="text-graphite-500 text-sm">No bookings{filter ? ` with status ${filter}` : ""}.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="glass rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-accent-400 text-sm">{b.reference}</span>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {b.name}
                      <a href={`tel:${b.phone}`} className="ml-2 text-accent-400 hover:text-accent-300 font-normal">📞 {b.phone}</a>
                    </p>
                    <p className="text-xs text-graphite-500 truncate">
                      {b.deviceType}{b.deviceBrand ? ` · ${b.deviceBrand}` : ""}{b.deviceModel ? ` ${b.deviceModel}` : ""}{b.city ? ` · ${b.city}` : ""} · {new Date(b.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!b.dispatch && !["CONVERTED", "CANCELLED"].includes(b.status) && (
                    <button onClick={() => sendToDispatch(b.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-accent-500 text-graphite-950 font-bold hover:bg-accent-400 transition">
                      Send to dispatch
                    </button>
                  )}
                  {b.dispatch && (
                    <span className="text-xs text-graphite-500">🚦 {b.dispatch.status.replace(/_/g, " ").toLowerCase()}</span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[b.status] ?? "bg-white/5 text-graphite-400"}`}>{b.status}</span>
                  <select
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    className="text-xs bg-graphite-900 border border-white/10 rounded-lg px-2 py-1.5 text-graphite-300"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                    className="text-xs text-graphite-400 hover:text-white px-2 py-1.5"
                  >
                    {expanded === b.id ? "Hide" : "Issue"}
                  </button>
                </div>
              </div>
              {expanded === b.id && (
                <div className="mt-3 pt-3 border-t border-white/5 text-sm text-graphite-300">
                  <p className="whitespace-pre-wrap">{b.issueDescription}</p>
                  {b.email && <p className="text-xs text-graphite-500 mt-2">Email: {b.email}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
