"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/auth/client";

type Technician = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialization: string[];
  certifications: string[];
  rating: number;
  totalRepairs: number;
  activeRepairs: number;
  joinedAt: string;
};

export default function TechniciansPage() {
  const [techs, setTechs] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<{ success: boolean; data: Technician[] }>("/api/dashboard/shop/technicians")
      .then((r) => setTechs(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="glass rounded-xl p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Technicians</h1>
        <p className="text-graphite-400 mt-1">{techs.length} staff members</p>
      </div>

      {techs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-graphite-500">No technicians registered yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techs.map((t) => (
            <div key={t.id} className="glass rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-500 text-lg font-bold shrink-0">
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">{t.name}</p>
                  <p className="text-xs text-graphite-500">{t.email}</p>
                  {t.phone && <p className="text-xs text-graphite-500">{t.phone}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-accent-500 font-bold text-lg">{t.rating.toFixed(1)}</p>
                  <p className="text-xs text-graphite-500">rating</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 rounded-lg py-2">
                  <p className="text-xl font-bold">{t.totalRepairs}</p>
                  <p className="text-xs text-graphite-500">Total</p>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <p className="text-xl font-bold text-accent-500">{t.activeRepairs}</p>
                  <p className="text-xs text-graphite-500">Active</p>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <p className="text-xl font-bold">{t.certifications.length}</p>
                  <p className="text-xs text-graphite-500">Certs</p>
                </div>
              </div>

              {t.specialization.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {t.specialization.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-accent-500/10 text-accent-400 border border-accent-500/20">{s}</span>
                  ))}
                </div>
              )}

              <p className="text-xs text-graphite-600">Joined {new Date(t.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
