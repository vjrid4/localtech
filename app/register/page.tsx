"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setToken, setUser, apiPost } from "@/lib/auth/client";
import { track, identify } from "@/lib/analytics";

type Tab = "customer" | "business";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export default function RegisterPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("customer");

  // Customer form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Business enquiry form
  const [bizName, setBizName] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizType, setBizType] = useState<"REPAIR_SHOP_OWNER" | "TECHNICIAN" | "SUPPLIER">("REPAIR_SHOP_OWNER");
  const [bizCity, setBizCity] = useState("");
  const [bizSent, setBizSent] = useState(false);
  const [bizLoading, setBizLoading] = useState(false);
  const [bizError, setBizError] = useState("");

  async function handleCustomerRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ success: boolean; data: any }>("/api/auth/register", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        userType: "CUSTOMER",
      });
      setToken(res.data.token);
      setUser({ id: res.data.id, email: res.data.email, name: res.data.name, userType: res.data.userType });
      identify(res.data.id, { userType: "CUSTOMER" });
      track("registration", { userType: "CUSTOMER" });
      router.push("/dashboard/customer");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleBizEnquiry(e: React.FormEvent) {
    e.preventDefault();
    setBizLoading(true);
    setBizError("");
    try {
      // Store lead without creating a user account — admin provisions elevated-role accounts
      const res = await fetch("/api/leads/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bizName.trim(),
          email: bizEmail.trim(),
          phone: bizPhone.trim(),
          city: bizCity.trim() || undefined,
          leadType: bizType,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      track("business_enquiry_submitted", { leadType: bizType });
      setBizSent(true);
    } catch (err: any) {
      setBizError(err.message || "Failed to submit enquiry");
    } finally {
      setBizLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0d1a10 50%, #0a0a0a 100%)" }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xl font-bold text-white" style={jk}>LocalTech</span>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-1 text-center" style={jk}>Create an account</h1>
          <p className="text-graphite-400 text-sm text-center mb-6">Join LocalTech to track your repairs and devices</p>

          <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setTab("customer")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === "customer" ? "bg-accent-500 text-graphite-950" : "text-graphite-400 hover:text-white"}`}
            >
              Customer
            </button>
            <button
              onClick={() => setTab("business")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === "business" ? "bg-accent-500 text-graphite-950" : "text-graphite-400 hover:text-white"}`}
            >
              Business / Technician
            </button>
          </div>

          {tab === "customer" ? (
            <form onSubmit={handleCustomerRegister} className="space-y-4">
              <div>
                <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required autoFocus className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm" />
              </div>
              <div>
                <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm" />
              </div>
              <div>
                <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Phone (optional)</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm" />
              </div>
              <div>
                <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm" />
              </div>
              <div>
                <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-accent-500 text-graphite-950 font-bold rounded-xl hover:bg-accent-400 transition disabled:opacity-50 text-sm">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-graphite-950 border-t-transparent rounded-full animate-spin" />
                    Creating Account…
                  </span>
                ) : "Create Account"}
              </button>
            </form>
          ) : bizSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="text-4xl">✅</div>
              <p className="font-bold text-white" style={jk}>Enquiry received!</p>
              <p className="text-graphite-400 text-sm">Our team will reach out to <strong className="text-white">{bizEmail}</strong> within 24 hours to set up your account.</p>
            </div>
          ) : (
            <form onSubmit={handleBizEnquiry} className="space-y-4">
              <p className="text-graphite-400 text-xs leading-relaxed">
                Service center owners, independent technicians, and suppliers get a dedicated portal.
                Fill in your details and we&apos;ll set up your account within 24 hours.
              </p>
              <div>
                <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Account Type</label>
                <div className="flex gap-2">
                  {(["REPAIR_SHOP_OWNER", "TECHNICIAN", "SUPPLIER"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setBizType(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${bizType === t ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}>
                      {t === "REPAIR_SHOP_OWNER" ? "Service Center" : t === "TECHNICIAN" ? "Technician" : "Supplier"}
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="Your / business name *" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm" />
              <input type="email" value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} placeholder="Business email *" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} placeholder="Phone *" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm" />
                <input type="text" value={bizCity} onChange={(e) => setBizCity(e.target.value)} placeholder="City" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm" />
              </div>
              {bizError && <p className="text-red-400 text-sm">{bizError}</p>}
              <button type="submit" disabled={bizLoading} className="w-full py-3.5 bg-accent-500 text-graphite-950 font-bold rounded-xl hover:bg-accent-400 transition disabled:opacity-50 text-sm">
                {bizLoading ? "Submitting…" : "Submit Enquiry"}
              </button>
            </form>
          )}

          <p className="text-center text-graphite-500 text-xs mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-400 hover:text-accent-300 transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
