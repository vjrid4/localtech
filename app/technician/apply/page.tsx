"use client";

/**
 * /technician/apply — public technician application. Target: done in 3 min
 * on a budget Android phone. Phone number is the identity; everything else
 * is the minimum needed to screen + dispatch.
 */

import { useState } from "react";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";
import { track } from "@/lib/analytics";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const CATEGORIES = [
  { id: "mobile",    icon: "📱", label: "Mobiles" },
  { id: "tv",        icon: "📺", label: "TVs" },
  { id: "laptop",    icon: "💻", label: "Laptops" },
  { id: "appliance", icon: "🧊", label: "Appliances" },
  { id: "cctv",      icon: "📷", label: "CCTV" },
  { id: "solar",     icon: "☀️", label: "Solar" },
];

export default function TechnicianApplyPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [years, setYears] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [pincodesRaw, setPincodesRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function toggleCategory(id: string) {
    setCategories((prev) => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const pincodes = pincodesRaw.split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
    if (categories.length === 0) { setError("Pick at least one category you repair."); return; }
    if (pincodes.length === 0 || pincodes.some(p => !/^\d{6}$/.test(p))) {
      setError("Enter the 6-digit pincodes you can serve (comma separated).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/technicians/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          yearsExperience: parseInt(years || "0", 10),
          categories,
          pincodes,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      track("technician_application_submitted", { categories, city: city.trim() });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LocalTechNav />
      <div className="pt-28 pb-20 px-4 max-w-lg mx-auto">

        {done ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-5">🎉</div>
            <h1 className="text-2xl font-bold mb-3" style={jk}>Application received!</h1>
            <p className="text-gray-500 mb-2">Our team reviews every application within 24 hours.</p>
            <p className="text-gray-500 text-sm mb-8">We&apos;ll call you on <span className="font-semibold text-gray-700">{phone}</span> for verification and next steps.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-gray-900 text-white font-bold rounded-xl">Back to Home</Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-2">For Technicians</p>
              <h1 className="text-3xl font-bold mb-2" style={jk}>Earn more with LocalTech</h1>
              <p className="text-gray-500 text-sm">Verified jobs near you · keep 90% of every repair · weekly payouts. Takes 3 minutes.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Full name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2}
                    placeholder="Ravi Kumar"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none text-[16px]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Mobile number * <span className="normal-case font-normal">(also WhatsApp)</span></label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required
                    inputMode="numeric" placeholder="9876543210"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none text-[16px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">City *</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} required minLength={2}
                      placeholder="Vijayawada"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none text-[16px]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Experience (yrs)</label>
                    <input value={years} onChange={(e) => setYears(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      inputMode="numeric" placeholder="5"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none text-[16px]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">What do you repair? *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-medium transition ${
                        categories.includes(c.id)
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      <span className="text-xl">{c.icon}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Pincodes you serve *</label>
                <input value={pincodesRaw} onChange={(e) => setPincodesRaw(e.target.value)}
                  placeholder="520001, 520002, 520010"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none text-[16px]" />
                <p className="text-xs text-gray-400 mt-1.5">Comma separated. Jobs in these areas come to you first.</p>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition disabled:opacity-50 text-[16px]">
                {submitting ? "Submitting…" : "Apply Now — Free"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                No fees, ever. By applying you agree to ID verification (Aadhaar) before going live.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
