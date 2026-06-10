"use client";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";
const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export default function TVPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LocalTechNav />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="text-7xl mb-8">📺</div>
        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5 text-purple-600 text-sm font-medium mb-6">Coming Soon</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900" style={jk}>TV Repair</h1>
        <p className="text-gray-500 text-xl max-w-lg mb-4 leading-relaxed">
          LED, LCD, OLED — display panels, power board, backlight and motherboard repairs coming to your city.
        </p>
        <p className="text-gray-400 text-sm mb-10">We&apos;re onboarding verified TV repair specialists. Check back soon.</p>
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
