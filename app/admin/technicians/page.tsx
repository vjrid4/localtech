"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost } from "@/lib/auth/client";

type Tech = {
  id: string;
  publicSlug: string;
  categories: string[];
  pincodes: string[];
  yearsExperience: number;
  whatsappNumber: string;
  verificationLevel: string;
  kycStatus: string;
  isActive: boolean;
  acceptingJobs: boolean;
  trustScore: number;
  totalCompleted: number;
  createdAt: string;
  user: { name: string; phone: string | null; email: string; createdAt: string };
};

const LEVELS = ["UNVERIFIED", "ID_VERIFIED", "FIELD_VERIFIED"];
const CAT_ICON: Record<string, string> = { mobile: "📱", tv: "📺", laptop: "💻", appliance: "🧊", cctv: "📷", solar: "☀️" };

export default function AdminTechniciansPage() {
  const [techs, setTechs] = useState<Tech[]>([]);
  const [filter, setFilter] = useState<"pending" | "active" | "">("pending");
  const [loading, setLoading] = useState(true);

  async function load(f: string) {
    setLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: Tech[] }>(`/api/admin/technicians${f ? `?filter=${f}` : ""}`);
      setTechs(res.data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(filter); }, [filter]);

  async function update(id: string, changes: Partial<Pick<Tech, "isActive" | "verificationLevel" | "acceptingJobs">>) {
    await apiPatch("/api/admin/technicians", { id, ...changes });
    setTechs((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } as Tech : t)));
  }

  async function editAreas(t: Tech) {
    const pinsRaw = prompt("Serviceable pincodes (comma separated, 6 digits):", t.pincodes.join(", "));
    if (pinsRaw === null) return;
    const pincodes = pinsRaw.split(/[,\s]+/).map((p) => p.trim()).filter(Boolean);
    if (pincodes.some((p) => !/^\d{6}$/.test(p))) { alert("Each pincode must be 6 digits."); return; }
    const catsRaw = prompt("Categories (mobile, tv, laptop, appliance, cctv, solar):", t.categories.join(", "));
    if (catsRaw === null) return;
    const categories = catsRaw.split(/[,\s]+/).map((c) => c.trim().toLowerCase()).filter(Boolean);
    await apiPatch("/api/admin/technicians", { id: t.id, pincodes, categories });
    load(filter);
  }

  async function copyLoginLink(id: string) {
    const res = await apiPost<{ success: boolean; data: { url: string } }>(
      "/api/admin/technicians/reset-link", { technicianProfileId: id });
    await navigator.clipboard.writeText(res.data.url);
    alert("Set-password link copied — valid 24h. Send it to the technician on WhatsApp.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Technicians</h1>
        <div className="flex gap-2">
          {([["pending", "Applications"], ["active", "Active"], ["", "All"]] as const).map(([f, label]) => (
            <button key={label} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                filter === f ? "border-accent-500/50 text-accent-400 bg-accent-500/10" : "border-white/10 text-graphite-400 hover:text-white"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      ) : techs.length === 0 ? (
        <p className="text-graphite-500 text-sm">
          {filter === "pending" ? "No pending applications." : "No technicians found."}
        </p>
      ) : (
        <div className="space-y-3">
          {techs.map((t) => (
            <div key={t.id} className="glass rounded-xl border border-white/10 p-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm">
                    {t.user.name}
                    <a href={`tel:${t.user.phone ?? t.whatsappNumber}`} className="ml-2 text-accent-400 hover:text-accent-300 font-normal">
                      📞 {t.user.phone ?? t.whatsappNumber}
                    </a>
                    <a href={`https://wa.me/91${t.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                      className="ml-2 text-green-400 hover:text-green-300 font-normal text-xs">WhatsApp</a>
                  </p>
                  <p className="text-xs text-graphite-500 mt-1">
                    {t.categories.map((c) => CAT_ICON[c] ?? c).join(" ")} · {t.yearsExperience} yrs ·
                    {" "}{t.pincodes.length} pincode{t.pincodes.length !== 1 ? "s" : ""} ({t.pincodes.slice(0, 3).join(", ")}{t.pincodes.length > 3 ? "…" : ""})
                    {" "}· applied {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.isActive ? "bg-accent-500/15 text-accent-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {t.isActive ? "LIVE" : "PENDING"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-graphite-400">{t.verificationLevel}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-graphite-400">KYC: {t.kycStatus}</span>
                    {t.totalCompleted > 0 && (
                      <span className="text-xs text-graphite-500">{t.totalCompleted} jobs · score {Math.round(t.trustScore)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => editAreas(t)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-graphite-300 hover:text-white transition">
                    Edit areas
                  </button>
                  <select
                    value={t.verificationLevel}
                    onChange={(e) => update(t.id, { verificationLevel: e.target.value })}
                    className="text-xs bg-graphite-900 border border-white/10 rounded-lg px-2 py-1.5 text-graphite-300"
                  >
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {t.isActive && (
                    <button onClick={() => copyLoginLink(t.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-graphite-300 hover:text-white transition">
                      Login link
                    </button>
                  )}
                  {t.isActive ? (
                    <button onClick={() => update(t.id, { isActive: false })}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition">
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => update(t.id, { isActive: true })}
                      className="text-xs px-3 py-1.5 rounded-lg bg-accent-500 text-graphite-950 font-bold hover:bg-accent-400 transition">
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
