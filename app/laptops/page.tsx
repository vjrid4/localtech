"use client";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";
const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export default function LaptopsPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LocalTechNav />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="text-7xl mb-8">💻</div>
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-slate-600 text-sm font-medium mb-6">Coming Soon</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900" style={jk}>Laptop Repair</h1>
        <p className="text-gray-500 text-xl max-w-lg mb-4 leading-relaxed">
          Screen, keyboard, hinge, battery, SSD upgrades and motherboard-level repairs for all brands.
        </p>
        <p className="text-gray-400 text-sm mb-10">Verified laptop technicians coming to your city soon.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="px-7 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition">
            ← Back to Home
          </Link>
          <Link href="/mobiles" className="px-7 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition">
            Book Mobile Repair Now
          </Link>
        </div>
      </div>
    </div>
  );
}
