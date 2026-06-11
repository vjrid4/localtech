"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/auth/client";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  leadType: string;
  status: string;
  notes: string | null;
  createdAt: string;
};

const STATUSES = ["NEW", "CONTACTED", "ONBOARDED", "REJECTED"];
const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-amber-500/15 text-amber-400",
  CONTACTED: "bg-blue-500/15 text-blue-400",
  ONBOARDED: "bg-accent-500/15 text-accent-400",
  REJECTED: "bg-red-500/15 text-red-400",
};
const TYPE_LABEL: Record<string, string> = {
  REPAIR_SHOP_OWNER: "🏪 Shop Owner",
  TECHNICIAN: "🔧 Technician",
  SUPPLIER: "📦 Supplier",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  async function load(status: string) {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: Lead[] }>(
        `/api/admin/leads${status ? `?status=${status}` : ""}`
      );
      setLeads(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(filter); }, [filter]);

  async function updateStatus(id: string, status: string) {
    await apiPatch("/api/admin/leads", { id, status });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function saveNotes(id: string) {
    const notes = notesDraft[id] ?? "";
    await apiPatch("/api/admin/leads", { id, notes });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
    setEditingNotes(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Business Leads</h1>
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
      ) : leads.length === 0 ? (
        <p className="text-graphite-500 text-sm">No leads{filter ? ` with status ${filter}` : ""}.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="glass rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm">
                    {l.name}
                    <span className="ml-2 text-xs text-graphite-400">{TYPE_LABEL[l.leadType] ?? l.leadType}</span>
                  </p>
                  <p className="text-xs text-graphite-500 mt-0.5">
                    <a href={`mailto:${l.email}`} className="text-accent-400 hover:text-accent-300">{l.email}</a>
                    {l.phone && <a href={`tel:${l.phone}`} className="ml-3 text-accent-400 hover:text-accent-300">📞 {l.phone}</a>}
                    {l.city && <span className="ml-3">{l.city}</span>}
                    <span className="ml-3">{new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[l.status] ?? "bg-white/5 text-graphite-400"}`}>{l.status}</span>
                  <select
                    value={l.status}
                    onChange={(e) => updateStatus(l.id, e.target.value)}
                    className="text-xs bg-graphite-900 border border-white/10 rounded-lg px-2 py-1.5 text-graphite-300"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => {
                      setEditingNotes(editingNotes === l.id ? null : l.id);
                      setNotesDraft((d) => ({ ...d, [l.id]: l.notes ?? "" }));
                    }}
                    className="text-xs text-graphite-400 hover:text-white px-2 py-1.5"
                  >
                    Notes
                  </button>
                </div>
              </div>
              {editingNotes === l.id ? (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <textarea
                    value={notesDraft[l.id] ?? ""}
                    onChange={(e) => setNotesDraft((d) => ({ ...d, [l.id]: e.target.value }))}
                    rows={2}
                    className="w-full text-sm bg-graphite-900 border border-white/10 rounded-lg p-2 text-white"
                    placeholder="Call notes, follow-up date…"
                  />
                  <button onClick={() => saveNotes(l.id)} className="text-xs px-3 py-1.5 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition">
                    Save
                  </button>
                </div>
              ) : l.notes ? (
                <p className="mt-2 text-xs text-graphite-400 border-t border-white/5 pt-2">📝 {l.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
