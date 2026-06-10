"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const ISSUES = [
  { icon: "💔", title: "Cracked Screen", desc: "LCD, AMOLED, Gorilla Glass replacement for all brands" },
  { icon: "🔋", title: "Battery Drain", desc: "Original OEM batteries, same-day service available" },
  { icon: "⚡", title: "Charging Issues", desc: "Port cleaning, flex cable, charging IC repair" },
  { icon: "💧", title: "Water Damage", desc: "Full board-level inspection and component-level repair" },
  { icon: "📸", title: "Camera Problems", desc: "Front & rear camera module, lens, OIS repair" },
  { icon: "🔊", title: "Speaker / Mic", desc: "Audio IC, earpiece, speaker mesh replacement" },
  { icon: "🔘", title: "Button Issues", desc: "Power, volume, home button flex and switch repair" },
  { icon: "📡", title: "Network / Signal", desc: "Antenna, SIM tray, signal IC repair" },
];

const BRANDS = [
  { name: "Samsung", logo: "📱", popular: true },
  { name: "Apple iPhone", logo: "🍎", popular: true },
  { name: "OnePlus", logo: "📱", popular: true },
  { name: "Xiaomi / Redmi", logo: "📱", popular: true },
  { name: "Realme", logo: "📱", popular: false },
  { name: "OPPO", logo: "📱", popular: false },
  { name: "Vivo", logo: "📱", popular: false },
  { name: "Google Pixel", logo: "📱", popular: false },
  { name: "Motorola", logo: "📱", popular: false },
  { name: "Nokia", logo: "📱", popular: false },
  { name: "iQOO", logo: "📱", popular: false },
  { name: "All Others", logo: "📱", popular: false },
];

const PRICE_GUIDE = [
  { issue: "Screen Replacement (mid-range)", from: 1200, to: 3500 },
  { issue: "Battery Replacement", from: 400, to: 900 },
  { issue: "Charging Port", from: 350, to: 800 },
  { issue: "Back Glass Replacement", from: 500, to: 1500 },
  { issue: "Camera Module", from: 600, to: 2500 },
  { issue: "Water Damage Repair", from: 800, to: 3000 },
];

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export default function MobilesPage() {
  return (
    <div className="bg-white text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LocalTechNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #064e3b 60%, #0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #22c55e 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1.5 text-green-400 text-sm mb-6">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Mobile Repair Specialists
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6" style={jk}>
                Mobile Repair,<br /><span className="text-green-400">Done Right.</span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Expert repairs for every brand and model. Genuine parts, transparent pricing,
                30-day warranty. Doorstep or walk-in — your choice.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard/shop/repairs/new" className="px-7 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition text-center">
                  Book a Repair Now
                </Link>
                <a href="#price-guide" className="px-7 py-4 bg-white/10 border border-white/20 hover:bg-white/15 text-white font-medium rounded-xl transition text-center">
                  View Price Guide
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ISSUES.slice(0, 4).map((issue, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
                  <div className="text-2xl mb-2">{issue.icon}</div>
                  <h3 className="font-bold text-white text-sm mb-1" style={jk}>{issue.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{issue.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All repair types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={jk}>What We Fix</h2>
            <p className="text-gray-500 mb-12">Component-level repairs, not just screen swaps.</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ISSUES.map((issue, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-green-100 transition-all group">
                  <div className="text-3xl mb-3">{issue.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm" style={jk}>{issue.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{issue.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={jk}>All Major Brands</h2>
            <p className="text-gray-500 mb-12">If it's a phone, we can fix it.</p>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            {BRANDS.map((b, i) => (
              <Reveal key={i} delay={i * 30}>
                <div className={`px-5 py-3 rounded-xl border text-sm font-medium transition cursor-pointer hover:-translate-y-0.5 ${b.popular ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                  {b.name}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Price guide */}
      <section id="price-guide" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={jk}>Price Guide</h2>
            <p className="text-gray-500 mb-12">Indicative prices. Exact quote shared before work begins — always.</p>
          </Reveal>
          <div className="space-y-3">
            {PRICE_GUIDE.map((p, i) => (
              <Reveal key={i} delay={i * 40}>
                <div className="bg-white rounded-xl px-6 py-4 border border-gray-100 flex items-center justify-between hover:shadow-sm transition">
                  <span className="text-gray-800 font-medium text-sm">{p.issue}</span>
                  <span className="text-green-600 font-bold text-sm">₹{p.from.toLocaleString()} – ₹{p.to.toLocaleString()}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}>
            <p className="mt-6 text-xs text-gray-400 text-center">Prices vary by brand, model and part availability. Digital estimate provided before any work begins.</p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-500">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={jk}>Ready to get your phone fixed?</h2>
            <p className="text-white/80 text-lg mb-10">Tell us the problem and we&apos;ll connect you with a verified technician near you in minutes.</p>
            <Link href="/dashboard/shop/repairs/new" className="inline-block px-10 py-4 bg-white text-green-600 font-bold rounded-2xl text-lg hover:bg-gray-50 transition shadow-xl">
              Book Repair Now →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-white font-bold" style={jk}>LocalTech</span>
          </Link>
          <p>&copy; {new Date().getFullYear()} LocalTech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
