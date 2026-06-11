"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/auth/client";

type Overview = {
  pendingBookings: number;
  totalBookings: number;
  newLeads: number;
  totalLeads: number;
  totalUsers: number;
  totalRepairs: number;
  recentBookings: { id: string; reference: string; name: string; deviceType: string; status: string; createdAt: string }[];
  recentLeads: { id: string; name: string; leadType: string; status: string; createdAt: string }[];
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<{ success: boolean; data: Overview }>("/api/admin/overview")
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />;

  const tiles = [
    { label: "Pending Bookings", value: data.pendingBookings, href: "/admin/bookings", alert: data.pendingBookings > 0 },
    { label: "New Leads", value: data.newLeads, href: "/admin/leads", alert: data.newLeads > 0 },
    { label: "Total Bookings", value: data.totalBookings, href: "/admin/bookings", alert: false },
    { label: "Total Leads", value: data.totalLeads, href: "/admin/leads", alert: false },
    { label: "Users", value: data.totalUsers, href: "/admin/users", alert: false },
    { label: "Repairs (CRM)", value: data.totalRepairs, href: "#", alert: false },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={`glass rounded-xl p-4 border transition hover:border-white/20 ${t.alert ? "border-amber-500/50" : "border-white/10"}`}
          >
            <p className={`text-3xl font-bold ${t.alert ? "text-amber-400" : "text-white"}`}>{t.value}</p>
            <p className="text-xs text-graphite-400 mt-1">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-accent-400 hover:text-accent-300">View all →</Link>
          </div>
          {data.recentBookings.length === 0 ? (
            <p className="text-sm text-graphite-500">No bookings yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-white font-medium">{b.name}</span>
                    <span className="text-graphite-500 ml-2">{b.deviceType} · {b.reference}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === "PENDING" ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-graphite-400"}`}>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Recent Business Leads</h2>
            <Link href="/admin/leads" className="text-xs text-accent-400 hover:text-accent-300">View all →</Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <p className="text-sm text-graphite-500">No leads yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentLeads.map((l) => (
                <li key={l.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-white font-medium">{l.name}</span>
                    <span className="text-graphite-500 ml-2">{l.leadType.replace(/_/g, " ").toLowerCase()}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === "NEW" ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-graphite-400"}`}>{l.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
