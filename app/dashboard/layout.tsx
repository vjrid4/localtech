"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getUser, clearToken } from "@/lib/auth/client";

const NAV = {
  REPAIR_SHOP_OWNER: [
    { href: "/dashboard/shop", icon: "📊", label: "Overview" },
    { href: "/dashboard/shop/repairs", icon: "🔧", label: "Repairs" },
    { href: "/dashboard/shop/inventory", icon: "📦", label: "Inventory" },
    { href: "/dashboard/shop/technicians", icon: "👨‍🔧", label: "Technicians" },
    { href: "/dashboard/shop/analytics", icon: "📈", label: "Analytics" },
    { href: "/dashboard/shop/billing", icon: "🧾", label: "Billing" },
  ],
  TECHNICIAN: [
    { href: "/dashboard/technician/jobs", icon: "🔧", label: "Marketplace Jobs" },
    { href: "/dashboard/technician", icon: "📋", label: "Shop Jobs" },
    { href: "/dashboard/technician/knowledge", icon: "🧠", label: "Knowledge" },
  ],
  CUSTOMER: [
    { href: "/dashboard/customer", icon: "📱", label: "My Devices" },
    { href: "/dashboard/customer/repairs", icon: "🔧", label: "Repairs" },
  ],
  SUPPLIER: [
    { href: "/dashboard/supplier", icon: "📦", label: "Overview" },
    { href: "/dashboard/supplier/orders", icon: "📋", label: "Orders" },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; userType: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
    } else {
      setUser(u);
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-graphite-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = NAV[user.userType as keyof typeof NAV] ?? [];
  const roleLabel = user.userType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-graphite-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-graphite-900 border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Brand */}
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="text-xl font-bold gradient-text-accent">LocalTech</Link>
          <p className="text-xs text-graphite-500 mt-1">{roleLabel}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? "bg-accent-500/15 text-accent-400 border border-accent-500/30"
                    : "text-graphite-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-500 text-sm font-bold">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-graphite-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { clearToken(); router.push("/login"); }}
            className="w-full text-xs text-graphite-500 hover:text-red-400 transition py-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 flex items-center px-4 gap-4 bg-graphite-900/50 backdrop-blur sticky top-0 z-20">
          <button
            className="md:hidden text-graphite-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <span className="text-xs text-graphite-500">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
