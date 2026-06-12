"use client";

/**
 * /track/[reference] — the most important page in the company.
 * Public, mobile-first, fast on 3G. Shows the booking journey as a timeline;
 * technician card + quote + warranty sections light up automatically once
 * the dispatch engine starts filling the Job layer.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

type TrackData = {
  booking: {
    reference: string;
    status: string;
    deviceType: string;
    deviceBrand: string | null;
    deviceModel: string | null;
    issueDescription: string;
    city: string | null;
    createdAt: string;
  };
  job: {
    status: string;
    quoteAmount: number | null;
    completedAt: string | null;
    technician: { name: string; slug: string; photoUrl: string | null; trustScore: number; totalCompleted: number } | null;
    warranty: { startsAt: string; expiresAt: string; status: string } | null;
  } | null;
};

// Customer-facing journey steps derived from booking + job status
const JOURNEY = [
  { key: "received",  label: "Request received",       desc: "We have your booking" },
  { key: "assigned",  label: "Technician assigned",    desc: "A verified technician will call you" },
  { key: "quoted",    label: "Quote shared",           desc: "Approve before any work starts" },
  { key: "working",   label: "Repair in progress",     desc: "Your device is being fixed" },
  { key: "done",      label: "Completed",              desc: "30-day warranty active" },
];

function journeyIndex(bookingStatus: string, jobStatus: string | null): number {
  if (!jobStatus) return bookingStatus === "CANCELLED" ? -1 : 0;
  const map: Record<string, number> = {
    ASSIGNED: 1, EN_ROUTE: 1, DIAGNOSED: 1,
    QUOTED: 2, QUOTE_APPROVED: 2,
    IN_PROGRESS: 3,
    COMPLETED: 4,
  };
  return map[jobStatus] ?? 0;
}

const DEVICE_ICONS: Record<string, string> = {
  mobile: "📱", tv: "📺", laptop: "💻", appliance: "🧊", cctv: "📷", solar: "☀️",
};

export default function TrackPage() {
  const params = useParams<{ reference: string }>();
  const reference = (params?.reference ?? "").toString().toUpperCase();
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!reference) return;
    fetch(`/api/track/${reference}`)
      .then(async (r) => {
        const j = await r.json();
        if (!j.success) throw new Error(j.message);
        setData(j.data);
      })
      .catch((e) => setError(e.message || "Could not load booking"))
      .finally(() => setLoading(false));
  }, [reference]);

  const idx = data ? journeyIndex(data.booking.status, data.job?.status ?? null) : 0;
  const cancelled = data?.booking.status === "CANCELLED" || data?.job?.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LocalTechNav />
      <div className="pt-28 pb-20 px-4 max-w-lg mx-auto">

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h1 className="text-xl font-bold mb-2" style={jk}>Booking not found</h1>
            <p className="text-gray-500 text-sm mb-6">Check the reference number on your confirmation — it looks like LT-XXXXXXX.</p>
            <Link href="/book" className="inline-block px-6 py-3 bg-green-500 text-white font-bold rounded-xl">Book a Repair</Link>
          </div>
        ) : data && (
          <>
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Booking</p>
                  <p className="text-2xl font-bold text-green-600 font-mono tracking-wider" style={jk}>{data.booking.reference}</p>
                </div>
                <div className="text-4xl">{DEVICE_ICONS[data.booking.deviceType] ?? "🔧"}</div>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {[data.booking.deviceBrand, data.booking.deviceModel].filter(Boolean).join(" ") || data.booking.deviceType}
                {" — "}{data.booking.issueDescription}
              </p>
              <p className="text-xs text-gray-400 mt-1.5">
                Booked {new Date(data.booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                {data.booking.city ? ` · ${data.booking.city}` : ""}
              </p>
            </div>

            {/* Cancelled state */}
            {cancelled ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center mb-5">
                <p className="font-bold text-red-600" style={jk}>This booking was cancelled</p>
                <p className="text-sm text-red-500 mt-1">Need help? Book again any time.</p>
                <Link href="/book" className="inline-block mt-4 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl">Book Again</Link>
              </div>
            ) : (
              /* Journey timeline */
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                <h2 className="font-bold mb-4" style={jk}>Repair status</h2>
                <ol className="space-y-0">
                  {JOURNEY.map((step, i) => {
                    const done = i < idx;
                    const current = i === idx;
                    return (
                      <li key={step.key} className="flex gap-3.5">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            done ? "bg-green-500 text-white"
                            : current ? "bg-green-100 text-green-600 ring-2 ring-green-500"
                            : "bg-gray-100 text-gray-400"
                          }`}>
                            {done ? "✓" : i + 1}
                          </div>
                          {i < JOURNEY.length - 1 && (
                            <div className={`w-0.5 flex-1 min-h-6 ${done ? "bg-green-500" : "bg-gray-200"}`} />
                          )}
                        </div>
                        <div className="pb-5">
                          <p className={`text-sm font-semibold leading-7 ${current ? "text-green-700" : done ? "text-gray-800" : "text-gray-400"}`}>
                            {step.label}
                            {current && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse align-middle" />}
                          </p>
                          <p className={`text-xs ${current || done ? "text-gray-500" : "text-gray-300"}`}>{step.desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {/* Technician card — appears once assigned */}
            {data.job?.technician && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 flex items-center gap-4">
                {data.job.technician.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.job.technician.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold">
                    {data.job.technician.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={jk}>{data.job.technician.name}</p>
                  <p className="text-xs text-gray-500">
                    ⭐ {data.job.technician.trustScore}/100 · {data.job.technician.totalCompleted} repairs · ID verified
                  </p>
                </div>
              </div>
            )}

            {/* Quote — appears once quoted; approve button while awaiting */}
            {data.job?.quoteAmount != null && data.job.quoteAmount > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Repair quote</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.job.status === "QUOTED" ? "Approve to start the repair" : "Approved — repair can begin"}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900" style={jk}>₹{(data.job.quoteAmount / 100).toLocaleString("en-IN")}</p>
                </div>
                {data.job.status === "QUOTED" && (
                  <button
                    onClick={async () => {
                      setApproving(true);
                      try {
                        const r = await fetch(`/api/track/${reference}/approve-quote`, { method: "POST" });
                        const j = await r.json();
                        if (j.success) {
                          setData((prev) => prev && prev.job ? { ...prev, job: { ...prev.job, status: "QUOTE_APPROVED" } } : prev);
                        }
                      } finally {
                        setApproving(false);
                      }
                    }}
                    disabled={approving}
                    className="mt-4 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {approving ? "Approving…" : "Approve Quote ✓"}
                  </button>
                )}
              </div>
            )}

            {/* Warranty card — appears once completed */}
            {data.job?.warranty && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🛡️</span>
                  <p className="font-bold text-green-800" style={jk}>30-day warranty {data.job.warranty.status === "ACTIVE" ? "active" : data.job.warranty.status.toLowerCase()}</p>
                </div>
                <p className="text-sm text-green-700">
                  Covered until {new Date(data.job.warranty.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.
                  Same issue again? We fix it free.
                </p>
              </div>
            )}

            {/* Help strip */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-sm text-gray-600 mb-3">Questions about this booking?</p>
              <a href="https://wa.me/?text=Hi%2C%20I%20need%20help%20with%20my%20LocalTech%20booking%20" className="inline-block px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition">
                Chat on WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
