"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setToken, setUser, apiPost } from "@/lib/auth/client";

const DEMO_ACCOUNTS = [
  { label: "Shop Owner", email: "shop@example.com", color: "text-accent-500" },
  { label: "Technician", email: "tech@example.com", color: "text-blue-400" },
  { label: "Customer", email: "customer@example.com", color: "text-purple-400" },
  { label: "Supplier", email: "supplier@example.com", color: "text-orange-400" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ success: boolean; data: any }>("/api/auth/login", { email, password });
      setToken(res.data.token);
      setUser({ id: res.data.id, email: res.data.email, name: res.data.name, userType: res.data.userType });
      const dest = {
        REPAIR_SHOP_OWNER: "/dashboard/shop",
        TECHNICIAN: "/dashboard/technician",
        CUSTOMER: "/dashboard/customer",
        SUPPLIER: "/dashboard/supplier",
      }[res.data.userType as string] ?? "/dashboard";
      router.push(dest);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password123");
  }

  return (
    <div className="min-h-screen bg-graphite-950 flex items-center justify-center px-4">
      {/* Glow orbs */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-5"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text-accent mb-2">LocalTech</h1>
          <p className="text-graphite-400 text-sm">Sign in to your dashboard</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Demo account pills */}
          <div className="mb-6">
            <p className="text-xs text-graphite-500 mb-3 uppercase tracking-widest">Quick demo login</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => quickLogin(a.email)}
                  className={`text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition ${a.color} bg-white/5 hover:bg-white/8 text-left`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-graphite-400 mb-1 uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-graphite-400 mb-1 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-graphite-500 mt-4">
            <Link href="/forgot-password" className="text-graphite-400 hover:text-accent-400 transition">Forgot password?</Link>
          </p>
          <p className="text-center text-xs text-graphite-500 mt-2">
            Demo password for all accounts: <span className="text-graphite-300 font-mono">password123</span>
          </p>
          <p className="text-center text-xs text-graphite-500 mt-3">
            New to LocalTech?{" "}
            <Link href="/register" className="text-accent-400 hover:text-accent-300 transition">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
