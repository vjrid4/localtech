"use client";

import { useState } from "react";
import Link from "next/link";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSent(true);
    } catch (e: any) {
      setError(e.message || "Request failed");
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
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📧</div>
              <h2 className="text-xl font-bold text-white" style={jk}>Check your email</h2>
              <p className="text-graphite-400 text-sm">
                If <strong className="text-white">{email}</strong> is registered, you&apos;ll receive a password reset link within a few minutes.
              </p>
              <p className="text-graphite-600 text-xs">
                In dev mode, the reset link is printed to the server console.
              </p>
              <Link href="/login" className="block mt-4 text-accent-400 hover:text-accent-300 text-sm transition">← Back to sign in</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1 text-center" style={jk}>Reset password</h1>
              <p className="text-graphite-400 text-sm text-center mb-6">Enter your account email and we&apos;ll send a reset link</p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 text-sm"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-accent-500 text-graphite-950 font-bold rounded-xl hover:bg-accent-400 transition disabled:opacity-50 text-sm"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
              <p className="text-center text-graphite-500 text-xs mt-5">
                Remembered it? <Link href="/login" className="text-accent-400 hover:text-accent-300 transition">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
