"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Services", href: "/#categories" },
  { label: "For Technicians", href: "/#technicians" },
  { label: "For Service Centers", href: "/#service-centers" },
];

const CATEGORY_LINKS = [
  { label: "Mobile Repair", href: "/mobiles", icon: "📱" },
  { label: "TV Repair", href: "/tv", icon: "📺" },
  { label: "Laptop Repair", href: "/laptops", icon: "💻" },
  { label: "Refrigerator", href: "/appliances", icon: "❄️" },
  { label: "AC Service", href: "/appliances", icon: "🌡️" },
  { label: "CCTV Systems", href: "/cctv", icon: "📷" },
  { label: "Solar & Inverter", href: "/solar", icon: "☀️" },
];

export default function LocalTechNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();
  const isConsumerPage = !pathname?.startsWith("/dashboard") && !pathname?.startsWith("/mobiles/dashboard");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span
              className={`text-xl font-bold tracking-tight ${
                scrolled ? "text-gray-900" : "text-white"
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              LocalTech
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  scrolled ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </a>
            ))}

            {/* Services dropdown */}
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition ${
                  scrolled ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                All Services
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
                  {CATEGORY_LINKS.map((c) => (
                    <Link
                      key={c.href + c.label}
                      href={c.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                    >
                      <span className="text-lg">{c.icon}</span>
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition ${
                scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/#get-help"
              className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition shadow-sm shadow-green-500/20"
            >
              Get Repair Help
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition ${
              scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
            >
              {l.label}
            </a>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
            {CATEGORY_LINKS.map((c) => (
              <Link
                key={c.href + c.label}
                href={c.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                <span>{c.icon}</span>
                {c.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
            <Link href="/login" className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-center">
              Sign In
            </Link>
            <Link href="/#get-help" className="block px-4 py-4 bg-green-500 text-white font-bold rounded-xl text-center">
              Get Repair Help →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
