"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";
import { track } from "@/lib/analytics";

type DeviceType = "mobile" | "tv" | "laptop" | "appliance" | "cctv" | "solar";

const DEVICE_TYPES: { type: DeviceType; icon: string; label: string }[] = [
  { type: "mobile", icon: "📱", label: "Mobile / Tablet" },
  { type: "tv", icon: "📺", label: "TV" },
  { type: "laptop", icon: "💻", label: "Laptop" },
  { type: "appliance", icon: "❄️", label: "Appliance" },
  { type: "cctv", icon: "📷", label: "CCTV" },
  { type: "solar", icon: "☀️", label: "Solar / Inverter" },
];

const MOBILE_BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Oppo", "Vivo", "Google", "Motorola", "Other"];
const COMMON_ISSUES: Record<DeviceType, string[]> = {
  mobile: ["Screen cracked", "Battery drains fast", "Charging port faulty", "Water damage", "Not turning on", "Camera issue", "Speaker/mic problem"],
  tv: ["No picture / black screen", "No sound", "Remote not working", "Power issue", "Screen lines / distortion", "HDMI port issue"],
  laptop: ["Screen broken", "Battery not charging", "Keyboard issue", "Overheating", "Won't boot", "Slow / hanging", "Hinge broken"],
  appliance: ["Not cooling", "Not heating", "Not spinning", "Water leakage", "Making noise", "Not turning on", "Error code showing"],
  cctv: ["Camera offline", "DVR not recording", "Poor video quality", "Night vision issue", "Cable fault", "App not connecting"],
  solar: ["Not charging batteries", "Low power output", "Inverter alarm", "Panel cleaning needed", "Grid not syncing"],
};

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [issue, setIssue] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const issues = deviceType ? COMMON_ISSUES[deviceType] : [];

  async function submit() {
    if (!deviceType || !issue.trim() || !name.trim() || !phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          deviceType,
          deviceBrand: brand.trim() || undefined,
          deviceModel: model.trim() || undefined,
          issueDescription: issue.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      track("booking_completed", { deviceType, reference: data.data.reference });
      router.push(`/book/success?ref=${data.data.reference}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LocalTechNav />
      <div className="pt-28 pb-20 px-4 max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition">← Back to home</Link>
          <h1 className="text-3xl font-bold mt-4 text-gray-900" style={jk}>Book a Repair</h1>
          <p className="text-gray-500 mt-2">No account needed. Tell us what&apos;s broken and we&apos;ll connect you with a technician.</p>
        </div>

        {/* Step 0: Device type */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg mb-5" style={jk}>What needs fixing?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DEVICE_TYPES.map((d) => (
                <button
                  key={d.type}
                  onClick={() => { setDeviceType(d.type); setStep(1); track("booking_started", { deviceType: d.type }); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 hover:border-green-400 hover:bg-green-50 transition group"
                >
                  <span className="text-3xl">{d.icon}</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">{d.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Describe problem */}
        {step === 1 && deviceType && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg" style={jk}>Describe the problem</h2>
              <button onClick={() => { setStep(0); setIssue(""); setBrand(""); setModel(""); }} className="text-sm text-gray-400 hover:text-gray-600">Change device</button>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 text-green-700 text-sm font-medium">
              {DEVICE_TYPES.find(d => d.type === deviceType)?.icon} {DEVICE_TYPES.find(d => d.type === deviceType)?.label}
            </div>

            {deviceType === "mobile" && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {MOBILE_BRANDS.map((b) => (
                  <button key={b} onClick={() => setBrand(b)} className={`py-2 px-2 rounded-xl text-xs font-medium border transition ${brand === b ? "bg-green-500 border-green-500 text-white" : "border-gray-200 text-gray-600 hover:border-green-300"}`}>{b}</button>
                ))}
              </div>
            )}

            {(deviceType === "mobile" || deviceType === "laptop" || deviceType === "tv") && (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model (e.g. Samsung Galaxy S23, iPhone 14) — optional"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-gray-50"
              />
            )}

            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Common issues</p>
              <div className="flex flex-wrap gap-2">
                {issues.map((i) => (
                  <button key={i} onClick={() => setIssue(i)} className={`text-xs px-3 py-1.5 rounded-full border transition ${issue === i ? "bg-green-500 border-green-500 text-white" : "border-gray-200 text-gray-600 hover:border-green-300"}`}>{i}</button>
                ))}
              </div>
            </div>

            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Describe the issue in more detail..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 resize-none bg-gray-50"
            />

            <button
              onClick={() => { if (issue.trim().length >= 3) setStep(2); }}
              disabled={issue.trim().length < 3}
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition disabled:opacity-40"
            >
              Next — Add Contact Info →
            </button>
          </div>
        )}

        {/* Step 2: Contact details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg" style={jk}>Your contact details</h2>
              <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
            </div>
            <p className="text-sm text-gray-500">We&apos;ll connect you with a technician and confirm via phone or WhatsApp.</p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name *"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-gray-50"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone / WhatsApp number *"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-gray-50"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-gray-50"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 bg-gray-50"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={submit}
              disabled={submitting || !name.trim() || !phone.trim()}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition disabled:opacity-40 text-base"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Booking…
                </span>
              ) : "Confirm Booking"}
            </button>
            <p className="text-xs text-gray-400 text-center">No payment required · We&apos;ll call you to confirm the appointment</p>
          </div>
        )}
      </div>
    </div>
  );
}
