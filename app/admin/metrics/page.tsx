"use client";

/**
 * /admin/metrics — four-panel ops cockpit (T24).
 * Demand funnel · Supply health · Quality · Unit economics
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/auth/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────

type WeekBucket = { week: string; bookings: number; completed: number };

type MetricsData = {
  funnel: {
    allTime: { bookings: number; dispatched: number; assigned: number; completed: number; reviewed: number; completionRate: number };
    thisWeek: { bookings: number; completed: number };
    weeklyChart: WeekBucket[];
  };
  supply: {
    applied: number; idVerified: number; fieldVerified: number; active: number;
    weeklyActive: number; acceptanceRate: number;
    leagueTable: { name: string; slug: string; completed: number; redos: number; trustScore: number; isActive: boolean; verificationLevel: string }[];
  };
  quality: {
    avgRating: number | null; reviewCount: number; reviewRate: number;
    redoRate: number; openClaims: number; staleClaims: number;
  };
  economics: {
    completedJobs: number; avgJobValueRs: number;
    totalCommissionDueRs: number; avgCommissionRs: number; commissionCollectedRs: number;
  };
};

type Tab = "funnel" | "supply" | "quality" | "economics";

// ── Shared components ───────────────────────────────────────────────────────

function KpiTile({ label, value, target, targetLabel, format = "number", alert }: {
  label: string; value: number | null; target?: number;
  targetLabel?: string; format?: "number" | "percent" | "rupee" | "rating";
  alert?: boolean;
}) {
  const fmt = (v: number | null) => {
    if (v === null) return "—";
    if (format === "percent") return `${v}%`;
    if (format === "rupee") return `₹${v.toLocaleString("en-IN")}`;
    if (format === "rating") return `${v}/5`;
    return v.toLocaleString("en-IN");
  };

  const metTarget = target !== undefined && value !== null && (
    (format === "percent" && label.toLowerCase().includes("redo") ? value <= target : value >= target)
  );
  const borderColor = alert
    ? "border-red-500/50"
    : target !== undefined
    ? metTarget ? "border-green-500/30" : "border-amber-500/30"
    : "border-white/10";
  const valueColor = alert
    ? "text-red-400"
    : target !== undefined
    ? metTarget ? "text-green-400" : "text-amber-400"
    : "text-white";

  return (
    <div className={`glass rounded-xl p-4 border ${borderColor}`}>
      <p className={`text-2xl font-bold ${valueColor}`}>{fmt(value)}</p>
      <p className="text-xs text-graphite-400 mt-1">{label}</p>
      {targetLabel && (
        <p className={`text-xs mt-1 ${metTarget ? "text-green-500" : "text-amber-500"}`}>
          target: {targetLabel}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-white mb-4">{children}</h2>;
}

// ── Panel 1: Demand Funnel ──────────────────────────────────────────────────

function FunnelPanel({ d }: { d: MetricsData["funnel"] }) {
  const steps = [
    { label: "Bookings", value: d.allTime.bookings, pct: 100 },
    { label: "Dispatched", value: d.allTime.dispatched, pct: d.allTime.bookings ? Math.round(d.allTime.dispatched / d.allTime.bookings * 100) : 0 },
    { label: "Assigned", value: d.allTime.assigned, pct: d.allTime.bookings ? Math.round(d.allTime.assigned / d.allTime.bookings * 100) : 0 },
    { label: "Completed", value: d.allTime.completed, pct: d.allTime.bookings ? Math.round(d.allTime.completed / d.allTime.bookings * 100) : 0 },
    { label: "Reviewed", value: d.allTime.reviewed, pct: d.allTime.bookings ? Math.round(d.allTime.reviewed / d.allTime.bookings * 100) : 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile label="Completion rate (all-time)" value={d.allTime.completionRate} target={60} targetLabel="≥60%" format="percent" />
        <KpiTile label="Bookings this week" value={d.thisWeek.bookings} />
        <KpiTile label="Completed this week" value={d.thisWeek.completed} />
        <KpiTile label="Reviews collected" value={d.allTime.reviewed} />
      </div>

      {/* Funnel bar */}
      <div className="glass rounded-xl border border-white/10 p-5">
        <SectionHeader>All-time conversion funnel</SectionHeader>
        <div className="space-y-3">
          {steps.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-24 text-xs text-graphite-400 shrink-0">{s.label}</div>
              <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full bg-accent-500/80 rounded-full transition-all duration-500"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <div className="w-20 text-right text-xs text-white font-medium">
                {s.value.toLocaleString("en-IN")}
                <span className="text-graphite-500 ml-1">({s.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly trend chart */}
      <div className="glass rounded-xl border border-white/10 p-5">
        <SectionHeader>Weekly trend — last 8 weeks</SectionHeader>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={d.weeklyChart} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gbookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gcompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
            <Area type="monotone" dataKey="bookings" stroke="#22c55e" fill="url(#gbookings)" strokeWidth={2} name="Bookings" />
            <Area type="monotone" dataKey="completed" stroke="#a3e635" fill="url(#gcompleted)" strokeWidth={2} name="Completed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Panel 2: Supply Health ──────────────────────────────────────────────────

function SupplyPanel({ d }: { d: MetricsData["supply"] }) {
  const LEVEL_COLOR: Record<string, string> = {
    UNVERIFIED: "text-graphite-500",
    ID_VERIFIED: "text-blue-400",
    FIELD_VERIFIED: "text-green-400",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiTile label="Applications" value={d.applied} />
        <KpiTile label="ID verified" value={d.idVerified} />
        <KpiTile label="Field verified" value={d.fieldVerified} />
        <KpiTile label="Active (switch on)" value={d.active} target={30} targetLabel="≥30" />
        <KpiTile label="Weekly active" value={d.weeklyActive} target={40} targetLabel="≥40 by day 90" />
        <KpiTile label="Acceptance rate (7d)" value={d.acceptanceRate} target={40} targetLabel="≥40%" format="percent" />
      </div>

      {/* Supply funnel */}
      <div className="glass rounded-xl border border-white/10 p-5">
        <SectionHeader>Onboarding funnel</SectionHeader>
        {[
          { label: "Applied", value: d.applied },
          { label: "ID Verified", value: d.idVerified },
          { label: "Field Verified", value: d.fieldVerified },
          { label: "Active", value: d.active },
          { label: "Weekly active", value: d.weeklyActive },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 mb-3">
            <div className="w-28 text-xs text-graphite-400 shrink-0">{s.label}</div>
            <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-blue-500/70 rounded-full transition-all duration-500"
                style={{ width: d.applied ? `${Math.round(s.value / d.applied * 100)}%` : "0%" }}
              />
            </div>
            <div className="w-20 text-right text-xs text-white font-medium">
              {s.value}
              <span className="text-graphite-500 ml-1">
                ({d.applied ? Math.round(s.value / d.applied * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
        {d.acceptanceRate < 40 && d.applied > 0 && (
          <p className="text-xs text-amber-400 mt-3 bg-amber-500/10 rounded-lg px-3 py-2">
            ⚠ Acceptance rate {d.acceptanceRate}% is below 40% target — check price expectations or area mismatch.
          </p>
        )}
      </div>

      {/* League table */}
      <div className="glass rounded-xl border border-white/10 p-5">
        <SectionHeader>Technician league table (top 10 by completed jobs)</SectionHeader>
        {d.leagueTable.length === 0 ? (
          <p className="text-sm text-graphite-500">No technicians yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-graphite-500 text-xs border-b border-white/5">
                  <th className="text-left pb-2 font-medium">#</th>
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-right pb-2 font-medium">Done</th>
                  <th className="text-right pb-2 font-medium">Redos</th>
                  <th className="text-right pb-2 font-medium">Trust</th>
                  <th className="text-center pb-2 font-medium">Level</th>
                  <th className="text-center pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {d.leagueTable.map((t, i) => (
                  <tr key={t.slug} className="hover:bg-white/3 transition">
                    <td className="py-2.5 text-graphite-500 pr-3">{i + 1}</td>
                    <td className="py-2.5">
                      <Link href={`/t/${t.slug}`} target="_blank" className="text-white hover:text-accent-400 transition">
                        {t.name}
                      </Link>
                    </td>
                    <td className="py-2.5 text-right text-white font-medium">{t.completed}</td>
                    <td className="py-2.5 text-right text-graphite-400">{t.redos}</td>
                    <td className="py-2.5 text-right text-accent-400 font-medium">{t.trustScore}</td>
                    <td className={`py-2.5 text-center text-xs ${LEVEL_COLOR[t.verificationLevel] ?? "text-graphite-500"}`}>
                      {t.verificationLevel.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${t.isActive ? "bg-green-500/15 text-green-400" : "bg-graphite-800 text-graphite-500"}`}>
                        {t.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel 3: Quality ────────────────────────────────────────────────────────

function QualityPanel({ d }: { d: MetricsData["quality"] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiTile label="Average rating" value={d.avgRating} target={4.3} targetLabel="≥4.3" format="rating" />
        <KpiTile label="Review rate" value={d.reviewRate} target={45} targetLabel="≥45%" format="percent" />
        <KpiTile label="Total reviews" value={d.reviewCount} />
        <KpiTile label="Redo rate" value={d.redoRate} target={5} targetLabel="≤5%" format="percent"
          alert={d.redoRate > 5} />
        <KpiTile label="Open warranty claims" value={d.openClaims} alert={d.openClaims > 0} />
        <KpiTile label="Claims open >48h" value={d.staleClaims} alert={d.staleClaims > 0} />
      </div>

      {d.staleClaims > 0 && (
        <div className="glass rounded-xl border border-red-500/30 p-4">
          <p className="text-sm font-bold text-red-400 mb-1">Action required</p>
          <p className="text-sm text-red-300">
            {d.staleClaims} warranty claim{d.staleClaims > 1 ? "s have" : " has"} been open for more than 48 hours.
            SLA is 4h triage + same-day recovery call.
          </p>
          <Link href="/admin/claims" className="inline-block mt-3 text-xs px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition">
            Go to claims queue →
          </Link>
        </div>
      )}

      <div className="glass rounded-xl border border-white/10 p-5">
        <SectionHeader>Quality targets</SectionHeader>
        <div className="space-y-4">
          {[
            { label: "Avg rating", value: d.avgRating !== null ? `${d.avgRating}/5` : "—", target: "≥4.3", met: d.avgRating !== null && d.avgRating >= 4.3 },
            { label: "Review rate", value: `${d.reviewRate}%`, target: "≥45%", met: d.reviewRate >= 45 },
            { label: "Redo rate", value: `${d.redoRate}%`, target: "≤5%", met: d.redoRate <= 5 },
            { label: "Stale claims (>48h)", value: String(d.staleClaims), target: "0", met: d.staleClaims === 0 },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm text-white">{row.label}</p>
                <p className="text-xs text-graphite-500">Target: {row.target}</p>
              </div>
              <div className={`text-lg font-bold ${row.met ? "text-green-400" : "text-amber-400"}`}>
                {row.met ? "✓" : "○"} {row.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Panel 4: Unit Economics ─────────────────────────────────────────────────

function EconomicsPanel({ d }: { d: MetricsData["economics"] }) {
  const contribution = d.avgCommissionRs - 15; // ~₹15 messaging+infra cost per job (estimate)
  const targetContribution = 80;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiTile label="Completed jobs" value={d.completedJobs} />
        <KpiTile label="Avg job value" value={d.avgJobValueRs} format="rupee" />
        <KpiTile label="Avg commission booked" value={d.avgCommissionRs} format="rupee" target={120} targetLabel="≥₹120" />
        <KpiTile label="Total commission booked" value={d.totalCommissionDueRs} format="rupee" />
        <KpiTile label="Commission collected" value={d.commissionCollectedRs} format="rupee" />
        <KpiTile
          label="Est. contribution / job"
          value={d.completedJobs > 0 ? contribution : null}
          format="rupee"
          target={targetContribution}
          targetLabel="≥₹80"
        />
      </div>

      <div className="glass rounded-xl border border-white/10 p-5">
        <SectionHeader>Unit economics model</SectionHeader>
        <div className="space-y-3 text-sm">
          {[
            { label: "Avg repair value (AOV)", value: `₹${d.avgJobValueRs.toLocaleString("en-IN")}`, note: "target ₹1,200" },
            { label: "Commission rate", value: "10%", note: "of AOV" },
            { label: "Avg commission booked", value: `₹${d.avgCommissionRs.toLocaleString("en-IN")}`, note: "target ₹120" },
            { label: "Messaging + infra est.", value: "−₹15", note: "WhatsApp + hosting per job" },
            { label: "Redo cost est.", value: "−₹10", note: "amortised at 3–5% redo rate" },
            { label: "Contribution / job", value: d.completedJobs > 0 ? `₹${contribution.toLocaleString("en-IN")}` : "—", note: "target ₹80–120", bold: true },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
              <div>
                <p className={row.bold ? "text-white font-semibold" : "text-graphite-300"}>{row.label}</p>
                <p className="text-xs text-graphite-500">{row.note}</p>
              </div>
              <p className={`font-mono ${row.bold ? "text-accent-400 font-bold" : "text-graphite-300"}`}>{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {d.commissionCollectedRs === 0 && d.completedJobs > 0 && (
        <div className="glass rounded-xl border border-amber-500/30 p-4">
          <p className="text-sm font-bold text-amber-400 mb-1">Commission collection not wired</p>
          <p className="text-sm text-amber-300/80">
            ₹{d.totalCommissionDueRs.toLocaleString("en-IN")} booked but ₹0 collected.
            Implement weekly invoice flow (T25 — Razorpay Payment Links) before day 45.
            Collect from job #1, even manually, or you build a charity not a marketplace.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "funnel", label: "Demand funnel", icon: "📈" },
  { key: "supply", label: "Supply health", icon: "👷" },
  { key: "quality", label: "Quality", icon: "⭐" },
  { key: "economics", label: "Unit economics", icon: "💰" },
];

export default function MetricsPage() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("funnel");
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  function load() {
    apiGet<{ success: boolean; data: MetricsData }>("/api/admin/metrics")
      .then((res) => { setData(res.data); setRefreshedAt(new Date()); })
      .catch((e) => setError(e.message));
  }

  useEffect(() => { load(); }, []);

  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Metrics</h1>
        <div className="flex items-center gap-3">
          {refreshedAt && (
            <span className="text-xs text-graphite-500">
              Updated {refreshedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={load}
            className="text-xs px-3 py-1.5 glass border border-white/10 rounded-lg text-graphite-300 hover:text-white transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key
                ? "bg-accent-500/15 text-accent-400 border border-accent-500/30"
                : "text-graphite-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      {!data ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === "funnel" && <FunnelPanel d={data.funnel} />}
          {tab === "supply" && <SupplyPanel d={data.supply} />}
          {tab === "quality" && <QualityPanel d={data.quality} />}
          {tab === "economics" && <EconomicsPanel d={data.economics} />}
        </>
      )}
    </div>
  );
}
