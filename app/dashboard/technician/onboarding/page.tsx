"use client";

/**
 * /dashboard/technician/onboarding — KYC checklist (T8).
 *
 * Five-step funnel: Apply → Admin screen → KYC → Quiz → Active.
 * The KYC step expands into a 4-sub-step wizard (Aadhaar OTP → verify → PAN → Selfie).
 * Max 3 retries per sub-step; third failure routes to MANUAL_REVIEW automatically.
 * Aadhaar/selfie data never stored raw — masked form only.
 */

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/auth/client";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

type KycStatus = "NOT_STARTED" | "PENDING" | "PASSED" | "FAILED" | "MANUAL_REVIEW";

type OnboardingData = {
  name: string;
  kycStatus: KycStatus;
  verificationLevel: string;
  isActive: boolean;
  categories: string[];
  subSteps: { aadhaarVerified: boolean; panVerified: boolean; selfieVerified: boolean };
  maskedAadhaar: string | null;
  aadhaarName: string | null;
  panNumber: string | null;
  faceMatchScore: number | null;
};

// ── Sub-step state types ──────────────────────────────────────────────────

type SubStep = "aadhaar" | "otp" | "pan" | "selfie" | "done";

function currentSubStep(data: OnboardingData): SubStep {
  if (data.kycStatus === "PASSED") return "done";
  if (!data.subSteps.aadhaarVerified) return "aadhaar";
  if (!data.subSteps.panVerified) return "pan";
  return "selfie";
}

// ── Step indicator ────────────────────────────────────────────────────────

const CHECKLIST = [
  { key: "applied", label: "Application submitted", desc: "Your account has been created" },
  { key: "screened", label: "Admin review", desc: "We review your experience and area" },
  { key: "kyc", label: "Identity verification", desc: "Aadhaar + PAN + selfie verification" },
  { key: "quiz", label: "Skills quiz", desc: "15 repair scenario questions (coming soon)" },
  { key: "active", label: "Go live", desc: "Admin activates your profile — you start receiving jobs" },
];

function stepStatus(key: string, data: OnboardingData): "done" | "current" | "locked" {
  switch (key) {
    case "applied": return "done";
    case "screened": return data.kycStatus === "NOT_STARTED" ? "current" : "done";
    case "kyc":
      if (data.kycStatus === "PASSED") return "done";
      if (data.kycStatus === "MANUAL_REVIEW") return "current";
      return "current";
    case "quiz": return data.kycStatus === "PASSED" ? "current" : "locked";
    case "active": return data.isActive ? "done" : "locked";
    default: return "locked";
  }
}

// ── KYC sub-step wizard ───────────────────────────────────────────────────

function KYCWizard({ data, onComplete }: { data: OnboardingData; onComplete: () => void }) {
  const [subStep, setSubStep] = useState<SubStep>(() => {
    const s = currentSubStep(data);
    if (s === "aadhaar") return "aadhaar";
    return s;
  });
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [pan, setPan] = useState("");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aadhaarResult, setAadhaarResult] = useState<{ name: string; maskedAadhaar: string } | null>(
    data.aadhaarName ? { name: data.aadhaarName, maskedAadhaar: data.maskedAadhaar ?? "" } : null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  async function sendOTP() {
    setError(""); setLoading(true);
    try {
      await apiPost("/api/kyc/aadhaar", { aadhaarNumber: aadhaar.replace(/\s/g, "") });
      setSubStep("otp");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally { setLoading(false); }
  }

  async function verifyOTP() {
    setError(""); setLoading(true);
    try {
      const res = await apiPost<{ success: boolean; data: { name: string; maskedAadhaar: string } }>(
        "/api/kyc/aadhaar/verify",
        { otp }
      );
      setAadhaarResult(res.data);
      setSubStep("pan");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "OTP verification failed");
    } finally { setLoading(false); }
  }

  async function verifyPAN() {
    setError(""); setLoading(true);
    try {
      await apiPost("/api/kyc/pan", { panNumber: pan.toUpperCase() });
      setSubStep("selfie");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "PAN verification failed");
    } finally { setLoading(false); }
  }

  async function submitSelfie() {
    if (!selfieBase64) return;
    setError(""); setLoading(true);
    try {
      await apiPost("/api/kyc/selfie", { selfieBase64 });
      onComplete();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Selfie verification failed");
    } finally { setLoading(false); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setSelfiePreview(result);
      // Strip data:image/...;base64, prefix for API
      setSelfieBase64(result.split(",")[1] ?? result);
    };
    reader.readAsDataURL(file);
  }

  function formatAadhaar(value: string) {
    return value.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  const inputCls = "w-full px-4 py-3 rounded-xl bg-graphite-800 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/60 text-sm font-mono tracking-wider";

  // Progress dots
  const SUB_STEPS: { key: SubStep; label: string }[] = [
    { key: "aadhaar", label: "Aadhaar" },
    { key: "pan", label: "PAN" },
    { key: "selfie", label: "Selfie" },
    { key: "done", label: "Done" },
  ];
  const subIdx = SUB_STEPS.findIndex(s => s.key === (subStep === "otp" ? "aadhaar" : subStep));

  return (
    <div className="mt-4 space-y-4">
      {/* Sub-step progress */}
      <div className="flex items-center gap-1">
        {SUB_STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${i <= subIdx ? "bg-accent-500" : "bg-white/10"}`} />
            {i < SUB_STEPS.length - 1 && null}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-graphite-500 px-0.5">
        {SUB_STEPS.map(s => <span key={s.key}>{s.label}</span>)}
      </div>

      {/* ── Step 1: Aadhaar number ── */}
      {subStep === "aadhaar" && (
        <div className="space-y-3">
          <p className="text-sm text-graphite-300">Enter your 12-digit Aadhaar number. An OTP will be sent to your Aadhaar-linked mobile.</p>
          <input
            type="tel" inputMode="numeric" maxLength={14}
            value={formatAadhaar(aadhaar)}
            onChange={e => setAadhaar(e.target.value.replace(/\D/g, ""))}
            placeholder="1234 5678 9012"
            className={inputCls}
          />
          <p className="text-xs text-graphite-600">🔒 Your Aadhaar number is sent securely to Surepass KYC and is never stored by LocalTech.</p>
          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={sendOTP} disabled={loading || aadhaar.length < 12}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-graphite-950 font-bold rounded-xl transition text-sm">
            {loading ? "Sending OTP…" : "Send OTP →"}
          </button>
        </div>
      )}

      {/* ── Step 2: OTP ── */}
      {subStep === "otp" && (
        <div className="space-y-3">
          <p className="text-sm text-graphite-300">Enter the 6-digit OTP sent to your Aadhaar-linked mobile number.</p>
          <input
            type="tel" inputMode="numeric" maxLength={6}
            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="• • • • • •"
            className={inputCls + " text-center text-xl tracking-[0.5em]"}
          />
          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={verifyOTP} disabled={loading || otp.length < 6}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-graphite-950 font-bold rounded-xl transition text-sm">
            {loading ? "Verifying…" : "Verify OTP →"}
          </button>
          <button onClick={() => { setSubStep("aadhaar"); setOtp(""); setError(""); }}
            className="w-full py-2 text-xs text-graphite-500 hover:text-white transition">
            ← Re-enter Aadhaar number
          </button>
        </div>
      )}

      {/* ── Step 3: PAN ── */}
      {subStep === "pan" && (
        <div className="space-y-3">
          {aadhaarResult && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-xs text-green-400 font-semibold">✓ Aadhaar verified</p>
              <p className="text-sm text-white mt-0.5">{aadhaarResult.name}</p>
              <p className="text-xs text-graphite-400">{aadhaarResult.maskedAadhaar}</p>
            </div>
          )}
          <p className="text-sm text-graphite-300">Enter your PAN number. We verify that the name on your PAN matches your Aadhaar.</p>
          <input
            type="text" maxLength={10}
            value={pan} onChange={e => setPan(e.target.value.toUpperCase().slice(0, 10))}
            placeholder="ABCDE1234F"
            className={inputCls + " uppercase"}
          />
          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={verifyPAN} disabled={loading || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-graphite-950 font-bold rounded-xl transition text-sm">
            {loading ? "Verifying PAN…" : "Verify PAN →"}
          </button>
        </div>
      )}

      {/* ── Step 4: Selfie ── */}
      {subStep === "selfie" && (
        <div className="space-y-3">
          <p className="text-sm text-graphite-300">
            Take a clear selfie in good lighting. We'll match it against your Aadhaar photo to complete identity verification.
          </p>
          <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />
          {selfiePreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selfiePreview} alt="Selfie preview" className="w-full max-h-64 object-cover rounded-xl border border-white/10" />
              <button onClick={() => { setSelfiePreview(null); setSelfieBase64(null); }}
                className="absolute top-2 right-2 bg-graphite-900/80 text-white text-xs px-2 py-1 rounded-lg">
                Retake
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-white/20 rounded-xl text-graphite-400 hover:border-accent-500/50 hover:text-accent-400 transition flex flex-col items-center gap-2">
              <span className="text-3xl">📷</span>
              <span className="text-sm font-medium">Take selfie or upload photo</span>
              <span className="text-xs">Use front camera · Good lighting · No glasses</span>
            </button>
          )}
          <p className="text-xs text-graphite-600">🔒 Your selfie is used only for face match and is not stored after verification.</p>
          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={submitSelfie} disabled={loading || !selfieBase64}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-graphite-950 font-bold rounded-xl transition text-sm">
            {loading ? "Verifying face match…" : "Complete Verification →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [error, setError] = useState("");
  const [kycExpanded, setKycExpanded] = useState(false);

  function load() {
    apiGet<{ success: boolean; data: OnboardingData }>("/api/kyc/status")
      .then(res => {
        setData(res.data);
        // Auto-expand KYC section if it's the current step
        if (res.data.kycStatus !== "PASSED" && res.data.kycStatus !== "MANUAL_REVIEW") {
          setKycExpanded(true);
        }
      })
      .catch(e => setError(e.message));
  }

  useEffect(() => { load(); }, []);

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>;

  const isMock = !process.env.KYC_API_TOKEN;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={jk}>Welcome, {data.name.split(" ")[0]} 👋</h1>
        <p className="text-graphite-400 text-sm mt-1">Complete these steps to start receiving jobs on LocalTech.</p>
      </div>

      {/* Dev mode banner */}
      {!process.env.KYC_API_TOKEN && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-300">
          <span className="font-bold">Dev mode:</span> No KYC_API_TOKEN set — all verifications return mock responses. Set the env var to enable real Surepass KYC.
        </div>
      )}

      {/* Checklist */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {CHECKLIST.map((step, i) => {
          const status = stepStatus(step.key, data);
          const isKyc = step.key === "kyc";
          const manualReview = isKyc && data.kycStatus === "MANUAL_REVIEW";

          return (
            <div key={step.key} className={`border-b border-white/5 last:border-0 ${status === "locked" ? "opacity-50" : ""}`}>
              <div
                className={`flex items-start gap-4 px-5 py-4 ${isKyc && status !== "locked" ? "cursor-pointer hover:bg-white/3 transition" : ""}`}
                onClick={() => isKyc && status !== "locked" && setKycExpanded(v => !v)}
              >
                {/* Status icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold mt-0.5 ${
                  status === "done" ? "bg-green-500 text-white"
                  : status === "current" ? "bg-accent-500/20 text-accent-400 ring-2 ring-accent-500/50"
                  : "bg-white/5 text-graphite-600"
                }`}>
                  {status === "done" ? "✓" : i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${status === "done" ? "text-white" : status === "current" ? "text-accent-400" : "text-graphite-500"}`}>
                      {step.label}
                    </p>
                    {isKyc && data.kycStatus === "PASSED" && (
                      <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">ID Verified ✓</span>
                    )}
                    {manualReview && (
                      <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">Under review</span>
                    )}
                    {isKyc && data.kycStatus === "PENDING" && (
                      <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">In progress</span>
                    )}
                  </div>
                  <p className="text-xs text-graphite-500 mt-0.5">{step.desc}</p>

                  {/* Verified data summary */}
                  {isKyc && data.kycStatus === "PASSED" && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-graphite-400">
                      {data.maskedAadhaar && <span>Aadhaar: {data.maskedAadhaar}</span>}
                      {data.panNumber && <span>PAN: {data.panNumber}</span>}
                      {data.faceMatchScore && <span>Face match: {data.faceMatchScore}%</span>}
                    </div>
                  )}

                  {/* Manual review state */}
                  {manualReview && (
                    <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-300">
                      Our team is reviewing your KYC manually and will contact you within 24 hours. No action needed from your side.
                    </div>
                  )}
                </div>

                {/* Chevron for KYC step */}
                {isKyc && status !== "locked" && data.kycStatus !== "PASSED" && !manualReview && (
                  <span className={`text-graphite-500 text-sm transition-transform ${kycExpanded ? "rotate-180" : ""}`}>▾</span>
                )}
              </div>

              {/* KYC wizard inline */}
              {isKyc && kycExpanded && data.kycStatus !== "PASSED" && !manualReview && (
                <div className="px-5 pb-5">
                  <KYCWizard data={data} onComplete={() => { load(); setKycExpanded(false); }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom help */}
      <div className="glass rounded-xl border border-white/10 px-5 py-4">
        <p className="text-sm font-semibold text-white mb-1" style={jk}>Need help?</p>
        <p className="text-xs text-graphite-400 mb-3">
          If your Aadhaar OTP isn't arriving, ensure your Aadhaar is linked to your active mobile number.
          For name mismatches, contact support with your original documents.
        </p>
        <a href="https://wa.me/?text=Hi%2C+I+need+help+with+my+LocalTech+KYC+verification"
          className="inline-block text-xs px-4 py-2 bg-green-500/15 hover:bg-green-500/25 text-green-400 rounded-lg transition">
          Chat on WhatsApp →
        </a>
      </div>

      {/* Active — celebration */}
      {data.isActive && (
        <div className="glass rounded-2xl border border-accent-500/30 px-6 py-5 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-lg font-bold text-white" style={jk}>You&apos;re live on LocalTech!</p>
          <p className="text-sm text-graphite-400 mt-1 mb-4">Your profile is active. Job offers will start coming in via WhatsApp.</p>
          <a href="/dashboard/technician/jobs"
            className="inline-block px-6 py-3 bg-accent-500 hover:bg-accent-600 text-graphite-950 font-bold rounded-xl transition text-sm">
            View My Job Inbox →
          </a>
        </div>
      )}
    </div>
  );
}
