"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

function SuccessContent() {
  const params = useSearchParams();
  const ref = params?.get("ref") ?? "LT-XXXXXXX";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LocalTechNav />
      <div className="pt-32 pb-20 px-4 max-w-lg mx-auto text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold mb-3 text-gray-900" style={jk}>Booking Confirmed!</h1>
        <p className="text-gray-500 text-lg mb-8">
          Your repair request has been received. A verified technician will contact you within 2 hours.
        </p>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <p className="text-sm text-gray-500 mb-2">Your booking reference</p>
          <p className="text-3xl font-bold text-green-600 tracking-widest font-mono" style={jk}>{ref}</p>
          <p className="text-xs text-gray-400 mt-2">Save this reference to track your repair status</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-sm">
          {[
            { icon: "📞", title: "We call you", desc: "Within 2 hours" },
            { icon: "📋", title: "Digital estimate", desc: "Before work starts" },
            { icon: "🛡️", title: "30-day warranty", desc: "On every repair" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-bold text-gray-800">{item.title}</p>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition">
            Back to Home
          </Link>
          <Link href="/register" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition">
            Create Account to Track Repairs
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
