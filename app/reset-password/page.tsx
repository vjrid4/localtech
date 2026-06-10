"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

function ResetContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params?.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0d1a10 50%, #0a0a0a 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xl font-bold text-white" style={jk}>LocalTech</span>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          {!token ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">⚠️</div>
              <p className="text-white font-bold" style={jk}>Invalid reset link</p>
              <p className="text-graphite-400 text-sm">This link is missing a token. Please request a new one.</p>
              <Link href="/forgot-password" className="block text-accent-400 hover:text-accent-300 text-sm transition mt-4">Request new link</Link>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">✅</div>
              <p className="text-white font-bold" style={jk}>Password updated!</p>
              <p className="text-graphite-400 text-sm">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1 text-center" style={jk}>New password</h1>
              <p className="text-graphite-400 text-sm text-center mb-6">Choose a strong password for your account</p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-accent-500 text-graphite-950 font-bold rounded-xl hover:bg-accent-400 transition disabled:opacity-50 text-sm"
                >
                  {loading ? "Updating…" : "Set New Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0a0a0a,#0d1a10,#0a0a0a)" }}><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ResetContent />
    </Suspense>
  );
}
