"use client";

/**
 * /dashboard/technician/onboarding — five-step funnel.
 *   1. Applied       — account created
 *   2. Admin screen  — experience + area review
 *   3. KYC           — Aadhaar OTP → PAN → Selfie face match
 *   4. Quiz          — 15 mobile repair scenario questions, 70% pass gate
 *   5. Go live       — admin flips isActive
 */

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/auth/client";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

type KycStatus = "NOT_STARTED" | "PENDING" | "PASSED" | "FAILED" | "MANUAL_REVIEW";
type QuizStatus = "NOT_STARTED" | "PASSED" | "FAILED";

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
  quizStatus: QuizStatus;
  quizScore: number | null;
  quizTotal: number | null;
  quizAttempts: number;
  quizLastAttemptAt: string | null;
  quizRetryEligibleAt: string | null;
};

// ── KYC Sub-step types ────────────────────────────────────────────────────

type SubStep = "aadhaar" | "otp" | "pan" | "selfie" | "done";

function currentSubStep(data: OnboardingData): SubStep {
  if (data.kycStatus === "PASSED") return "done";
  if (!data.subSteps.aadhaarVerified) return "aadhaar";
  if (!data.subSteps.panVerified) return "pan";
  return "selfie";
}

// ── Checklist definition ─────────────────────────────────────────────────

const CHECKLIST = [
  { key: "applied",  label: "Application submitted",    desc: "Your account has been created" },
  { key: "screened", label: "Admin review",             desc: "We review your experience and area" },
  { key: "kyc",      label: "Identity verification",    desc: "Aadhaar + PAN + selfie" },
  { key: "quiz",     label: "Skills quiz",              desc: "15 repair scenario questions — score ≥70% to pass" },
  { key: "active",   label: "Go live",                  desc: "Admin activates your profile" },
];

function stepStatus(key: string, data: OnboardingData): "done" | "current" | "locked" {
  switch (key) {
    case "applied":  return "done";
    case "screened": return data.kycStatus === "NOT_STARTED" ? "current" : "done";
    case "kyc":
      if (data.kycStatus === "PASSED") return "done";
      return "current";
    case "quiz":
      if (data.quizStatus === "PASSED") return "done";
      if (data.kycStatus !== "PASSED") return "locked";
      return "current";
    case "active":   return data.isActive ? "done" : "locked";
    default:         return "locked";
  }
}

// ── KYC Wizard ───────────────────────────────────────────────────────────

function KYCWizard({ data, onComplete }: { data: OnboardingData; onComplete: () => void }) {
  const [subStep, setSubStep] = useState<SubStep>(() => currentSubStep(data) === "done" ? "aadhaar" : currentSubStep(data));
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [pan, setPan] = useState("");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aadhaarResult, setAadhaarResult] = useState<{ name: string; maskedAadhaar: string } | null>(
    data.aadhaarName ? { name: data.aadhaarName, maskedAadhaar: data.maskedAadhaar ?? "" } : null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  async function sendOTP() {
    setError(""); setLoading(true);
    try {
      await apiPost("/api/kyc/aadhaar", { aadhaarNumber: aadhaar.replace(/\s/g, "") });
      setSubStep("otp");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to send OTP"); }
    finally { setLoading(false); }
  }

  async function verifyOTP() {
    setError(""); setLoading(true);
    try {
      const res = await apiPost<{ success: boolean; data: { name: string; maskedAadhaar: string } }>("/api/kyc/aadhaar/verify", { otp });
      setAadhaarResult(res.data);
      setSubStep("pan");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "OTP verification failed"); }
    finally { setLoading(false); }
  }

  async function verifyPAN() {
    setError(""); setLoading(true);
    try {
      await apiPost("/api/kyc/pan", { panNumber: pan.toUpperCase() });
      setSubStep("selfie");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "PAN verification failed"); }
    finally { setLoading(false); }
  }

  async function submitSelfie() {
    if (!selfieBase64) return;
    setError(""); setLoading(true);
    try {
      await apiPost("/api/kyc/selfie", { selfieBase64 });
      onComplete();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Selfie verification failed"); }
    finally { setLoading(false); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setSelfiePreview(result);
      setSelfieBase64(result.split(",")[1] ?? result);
    };
    reader.readAsDataURL(file);
  }

  function formatAadhaar(v: string) {
    return v.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  const input = "w-full px-4 py-3 rounded-xl bg-graphite-800 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/60 text-sm font-mono tracking-wider";
  const SUB_STEPS = [{ key: "aadhaar", label: "Aadhaar" }, { key: "pan", label: "PAN" }, { key: "selfie", label: "Selfie" }, { key: "done", label: "Done" }];
  const subIdx = SUB_STEPS.findIndex(s => s.key === (subStep === "otp" ? "aadhaar" : subStep));

  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-1">
        {SUB_STEPS.map((s, i) => (
          <div key={s.key} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= subIdx ? "bg-accent-500" : "bg-white/10"}`} />
        ))}
      </div>
      <div className="flex justify-between text-xs text-graphite-500">
        {SUB_STEPS.map(s => <span key={s.key}>{s.label}</span>)}
      </div>

      {subStep === "aadhaar" && (
        <div className="space-y-3">
          <p className="text-sm text-graphite-300">Enter your 12-digit Aadhaar number. An OTP will be sent to your Aadhaar-linked mobile.</p>
          <input type="tel" inputMode="numeric" maxLength={14} value={formatAadhaar(aadhaar)}
            onChange={e => setAadhaar(e.target.value.replace(/\D/g, ""))} placeholder="1234 5678 9012" className={input} />
          <p className="text-xs text-graphite-600">🔒 Sent securely to Surepass KYC — never stored by LocalTech.</p>
          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={sendOTP} disabled={loading || aadhaar.length < 12}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-graphite-950 font-bold rounded-xl transition text-sm">
            {loading ? "Sending OTP…" : "Send OTP →"}
          </button>
        </div>
      )}

      {subStep === "otp" && (
        <div className="space-y-3">
          <p className="text-sm text-graphite-300">Enter the 6-digit OTP sent to your Aadhaar-linked mobile.</p>
          <input type="tel" inputMode="numeric" maxLength={6} value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="• • • • • •" className={input + " text-center text-xl tracking-[0.5em]"} />
          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={verifyOTP} disabled={loading || otp.length < 6}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-graphite-950 font-bold rounded-xl transition text-sm">
            {loading ? "Verifying…" : "Verify OTP →"}
          </button>
          <button onClick={() => { setSubStep("aadhaar"); setOtp(""); setError(""); }}
            className="w-full py-2 text-xs text-graphite-500 hover:text-white transition">← Re-enter Aadhaar</button>
        </div>
      )}

      {subStep === "pan" && (
        <div className="space-y-3">
          {aadhaarResult && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-xs text-green-400 font-semibold">✓ Aadhaar verified</p>
              <p className="text-sm text-white">{aadhaarResult.name}</p>
              <p className="text-xs text-graphite-400">{aadhaarResult.maskedAadhaar}</p>
            </div>
          )}
          <p className="text-sm text-graphite-300">Enter your PAN. We verify name matches Aadhaar.</p>
          <input type="text" maxLength={10} value={pan}
            onChange={e => setPan(e.target.value.toUpperCase().slice(0, 10))}
            placeholder="ABCDE1234F" className={input + " uppercase"} />
          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={verifyPAN} disabled={loading || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-graphite-950 font-bold rounded-xl transition text-sm">
            {loading ? "Verifying PAN…" : "Verify PAN →"}
          </button>
        </div>
      )}

      {subStep === "selfie" && (
        <div className="space-y-3">
          <p className="text-sm text-graphite-300">Take a clear selfie in good light — matched against your Aadhaar photo.</p>
          <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />
          {selfiePreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selfiePreview} alt="Selfie" className="w-full max-h-64 object-cover rounded-xl border border-white/10" />
              <button onClick={() => { setSelfiePreview(null); setSelfieBase64(null); }}
                className="absolute top-2 right-2 bg-graphite-900/80 text-white text-xs px-2 py-1 rounded-lg">Retake</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-white/20 rounded-xl text-graphite-400 hover:border-accent-500/50 hover:text-accent-400 transition flex flex-col items-center gap-2">
              <span className="text-3xl">📷</span>
              <span className="text-sm font-medium">Take selfie or upload photo</span>
              <span className="text-xs">Front camera · Good lighting · No glasses</span>
            </button>
          )}
          <p className="text-xs text-graphite-600">🔒 Not stored after verification.</p>
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

// ── Quiz Wizard ──────────────────────────────────────────────────────────

type QuizQuestion = { pos: number; category: string; question: string; options: string[] };
type QuizResult = {
  score: number; total: number; passed: boolean; passScore: number; attempts: number;
  retryEligibleAt: string | null;
  breakdown: { pos: number; yourAnswer: number; correct: number; passed: boolean }[];
};

function QuizWizard({ data, onComplete }: { data: OnboardingData; onComplete: () => void }) {
  const [phase, setPhase] = useState<"intro" | "active" | "result">("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // Countdown timer once quiz is active
  useEffect(() => {
    if (phase !== "active" || !expiresAt) return;
    const update = () => setTimeLeft(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [phase, expiresAt]);

  async function start() {
    setError(""); setLoading(true);
    try {
      const res = await apiPost<{ success: boolean; data: { questions: QuizQuestion[]; total: number; expiresAt: string }; message?: string }>(
        "/api/quiz/start", {},
      );
      setQuestions(res.data.questions);
      setAnswers(new Array(res.data.total).fill(null));
      setExpiresAt(res.data.expiresAt);
      setCurrent(0);
      setPhase("active");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to start quiz"); }
    finally { setLoading(false); }
  }

  async function submit() {
    if (answers.some(a => a === null)) {
      setError("Answer all questions before submitting");
      return;
    }
    setError(""); setLoading(true);
    try {
      const res = await apiPost<{ success: boolean; data: QuizResult }>("/api/quiz/submit", { answers });
      setResult(res.data);
      setPhase("result");
      if (res.data.passed) onComplete();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Submission failed"); }
    finally { setLoading(false); }
  }

  const answered = answers.filter(a => a !== null).length;
  const total = questions.length || 15;
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const canRetry = data.quizRetryEligibleAt ? Date.now() >= new Date(data.quizRetryEligibleAt).getTime() : true;

  // ── Intro phase ───────────────────────────────────────────────────────────
  if (phase === "intro") {
    if (data.quizStatus === "FAILED" && !canRetry) {
      const retryDate = data.quizRetryEligibleAt
        ? new Date(data.quizRetryEligibleAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : "soon";
      return (
        <div className="mt-4 space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-4 text-sm">
            <p className="text-amber-300 font-semibold mb-1">Score: {data.quizScore}/{data.quizTotal} — not passed</p>
            <p className="text-graphite-300">You need ≥11/15 correct. Retry opens on <strong className="text-white">{retryDate}</strong>.</p>
            <p className="text-graphite-400 text-xs mt-2">
              Review mobile repair topics: display faults, charging ICs, software recovery, water damage, customer handling.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-4">
        {data.quizStatus === "FAILED" && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
            Previous score: {data.quizScore}/{data.quizTotal}. You need ≥11/15. Give it another go!
          </div>
        )}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 space-y-2 text-sm">
          <p className="text-white font-semibold">About the quiz</p>
          <ul className="text-graphite-400 space-y-1 text-xs">
            <li>· 15 multiple-choice questions drawn from a 60-question bank</li>
            <li>· Topics: display, battery, camera, software, network, audio, water damage, customer service</li>
            <li>· Pass mark: 11 out of 15 (≥70%)</li>
            <li>· Time limit: 60 minutes</li>
            <li>· Failed? Retry in 7 days — review your weak areas in the meantime</li>
          </ul>
        </div>
        {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
        <button onClick={start} disabled={loading}
          className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-graphite-950 font-bold rounded-xl transition text-sm">
          {loading ? "Preparing questions…" : data.quizAttempts > 0 ? "Retry Quiz →" : "Start Quiz →"}
        </button>
      </div>
    );
  }

  // ── Active quiz ───────────────────────────────────────────────────────────
  if (phase === "active" && questions.length > 0) {
    const q = questions[current];
    const progressPct = (answered / total) * 100;

    return (
      <div className="mt-4 space-y-4">
        {/* Progress bar + timer */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-accent-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-graphite-500 mt-1">{answered}/{total} answered</p>
          </div>
          <span className={`font-mono text-xs shrink-0 ${timeLeft < 300000 ? "text-red-400" : "text-graphite-400"}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} left
          </span>
        </div>

        {/* Question navigation dots */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                i === current ? "bg-accent-500 text-graphite-950"
                : answers[i] !== null ? "bg-accent-500/20 text-accent-400"
                : "bg-white/5 text-graphite-500 hover:bg-white/10"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current question */}
        <div className="glass rounded-xl border border-white/10 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-xs text-accent-400 shrink-0 mt-0.5 font-mono">Q{current + 1}</span>
            <div>
              <span className="text-xs text-graphite-500 uppercase tracking-wide">{q.category}</span>
              <p className="text-sm text-white mt-1 leading-relaxed">{q.question}</p>
            </div>
          </div>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[current] === oi;
              return (
                <button key={oi} onClick={() => {
                  const updated = [...answers];
                  updated[current] = oi;
                  setAnswers(updated);
                }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition border ${
                    selected
                      ? "bg-accent-500/20 border-accent-500/50 text-accent-300"
                      : "bg-white/[0.03] border-white/10 text-graphite-300 hover:bg-white/5 hover:text-white"
                  }`}>
                  <span className="font-bold mr-2 text-xs">{["A", "B", "C", "D"][oi]}.</span>{opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-graphite-400 text-sm disabled:opacity-30 hover:text-white transition">
            ← Prev
          </button>
          <div className="flex-1" />
          {current < total - 1 ? (
            <button onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition">
              Next →
            </button>
          ) : (
            <button onClick={submit} disabled={loading || answered < total}
              className="px-6 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-graphite-950 font-bold text-sm transition">
              {loading ? "Grading…" : `Submit (${answered}/${total})`}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
      </div>
    );
  }

  // ── Result phase ──────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const retryDate = result.retryEligibleAt
      ? new Date(result.retryEligibleAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : null;

    return (
      <div className="mt-4 space-y-4">
        <div className={`rounded-xl border px-5 py-5 text-center ${result.passed
          ? "bg-green-500/10 border-green-500/30"
          : "bg-red-500/10 border-red-500/20"
        }`}>
          <p className="text-4xl mb-2">{result.passed ? "🎉" : "📚"}</p>
          <p className="text-xl font-bold text-white" style={jk}>
            {result.passed ? "Quiz passed!" : "Not quite — keep practising"}
          </p>
          <p className={`text-3xl font-bold mt-2 ${result.passed ? "text-green-400" : "text-red-400"}`}>
            {result.score}/{result.total}
          </p>
          <p className="text-xs text-graphite-400 mt-1">Pass mark: {result.passScore}/{result.total}</p>
          {!result.passed && retryDate && (
            <p className="text-sm text-amber-300 mt-3">Next attempt available: {retryDate}</p>
          )}
        </div>

        {/* Per-question breakdown */}
        <div className="glass rounded-xl border border-white/10 overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-widest text-graphite-400 px-4 py-3 border-b border-white/5">
            Question breakdown
          </p>
          <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
            {result.breakdown.map((b) => (
              <div key={b.pos} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${b.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {b.passed ? "✓" : "✗"}
                </span>
                <span className="text-xs text-graphite-400 flex-1">{questions[b.pos]?.question?.slice(0, 60)}…</span>
                {!b.passed && (
                  <span className="text-xs text-graphite-500 shrink-0">
                    Correct: {["A", "B", "C", "D"][b.correct]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {result.passed && (
          <div className="bg-accent-500/10 border border-accent-500/30 rounded-xl px-4 py-3 text-sm text-accent-300">
            ✓ Skills quiz complete. Waiting for admin to activate your profile — you&apos;ll receive a WhatsApp notification when you go live.
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [error, setError] = useState("");
  const [kycExpanded, setKycExpanded] = useState(false);
  const [quizExpanded, setQuizExpanded] = useState(false);

  function load() {
    apiGet<{ success: boolean; data: OnboardingData }>("/api/kyc/status")
      .then(res => {
        setData(res.data);
        if (res.data.kycStatus !== "PASSED") setKycExpanded(true);
        else if (res.data.quizStatus !== "PASSED") setQuizExpanded(true);
      })
      .catch(e => setError(e.message));
  }

  useEffect(() => { load(); }, []);

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={jk}>Welcome, {data.name.split(" ")[0]} 👋</h1>
        <p className="text-graphite-400 text-sm mt-1">Complete these steps to start receiving jobs on LocalTech.</p>
      </div>

      {!process.env.NEXT_PUBLIC_KYC_MOCK && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-300">
          <span className="font-bold">Dev mode:</span> KYC running in mock mode. Set <code>KYC_API_TOKEN</code> in .env for real Surepass verification.
        </div>
      )}

      {/* Checklist */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {CHECKLIST.map((step, i) => {
          const status = stepStatus(step.key, data);
          const isKyc  = step.key === "kyc";
          const isQuiz = step.key === "quiz";
          const manualReview = isKyc && data.kycStatus === "MANUAL_REVIEW";
          const expanded = isKyc ? kycExpanded : isQuiz ? quizExpanded : false;
          const toggleable = (isKyc || isQuiz) && status !== "locked";

          return (
            <div key={step.key} className={`border-b border-white/5 last:border-0 ${status === "locked" ? "opacity-40" : ""}`}>
              <div
                className={`flex items-start gap-4 px-5 py-4 ${toggleable ? "cursor-pointer hover:bg-white/[0.02] transition" : ""}`}
                onClick={() => {
                  if (isKyc && toggleable) setKycExpanded(v => !v);
                  if (isQuiz && toggleable) setQuizExpanded(v => !v);
                }}
              >
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
                    {isKyc && data.kycStatus === "PASSED" && <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">ID Verified ✓</span>}
                    {manualReview && <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">Under review</span>}
                    {isKyc && data.kycStatus === "PENDING" && <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">In progress</span>}
                    {isQuiz && data.quizStatus === "PASSED" && <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">{data.quizScore}/{data.quizTotal} ✓</span>}
                    {isQuiz && data.quizStatus === "FAILED" && <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">{data.quizScore}/{data.quizTotal} — retry</span>}
                  </div>
                  <p className="text-xs text-graphite-500 mt-0.5">{step.desc}</p>

                  {isKyc && data.kycStatus === "PASSED" && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-graphite-400">
                      {data.maskedAadhaar && <span>Aadhaar: {data.maskedAadhaar}</span>}
                      {data.panNumber && <span>PAN: {data.panNumber}</span>}
                      {data.faceMatchScore && <span>Face: {data.faceMatchScore}%</span>}
                    </div>
                  )}
                  {manualReview && (
                    <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-300">
                      Our team is reviewing your KYC manually — we'll contact you within 24 hours. No action needed.
                    </div>
                  )}
                </div>

                {toggleable && status !== "done" && (
                  <span className={`text-graphite-500 text-sm transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▾</span>
                )}
              </div>

              {/* KYC wizard inline */}
              {isKyc && expanded && data.kycStatus !== "PASSED" && !manualReview && (
                <div className="px-5 pb-5">
                  <KYCWizard data={data} onComplete={() => { load(); setKycExpanded(false); }} />
                </div>
              )}

              {/* Quiz wizard inline */}
              {isQuiz && expanded && data.quizStatus !== "PASSED" && (
                <div className="px-5 pb-5">
                  <QuizWizard data={data} onComplete={() => { load(); setQuizExpanded(false); }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help */}
      <div className="glass rounded-xl border border-white/10 px-5 py-4">
        <p className="text-sm font-semibold text-white mb-1" style={jk}>Need help?</p>
        <p className="text-xs text-graphite-400 mb-3">
          For KYC issues (OTP not arriving, name mismatch), contact support with your original documents.
          For quiz questions, brush up on display, battery, charging IC, Android recovery, and customer handling topics.
        </p>
        <a href="https://wa.me/?text=Hi%2C+I+need+help+with+my+LocalTech+onboarding"
          className="inline-block text-xs px-4 py-2 bg-green-500/15 hover:bg-green-500/25 text-green-400 rounded-lg transition">
          Chat on WhatsApp →
        </a>
      </div>

      {/* Active celebration */}
      {data.isActive && (
        <div className="glass rounded-2xl border border-accent-500/30 px-6 py-5 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-lg font-bold text-white" style={jk}>You&apos;re live on LocalTech!</p>
          <p className="text-sm text-graphite-400 mt-1 mb-4">Job offers will start arriving via WhatsApp.</p>
          <a href="/dashboard/technician/jobs"
            className="inline-block px-6 py-3 bg-accent-500 hover:bg-accent-600 text-graphite-950 font-bold rounded-xl transition text-sm">
            View My Job Inbox →
          </a>
        </div>
      )}
    </div>
  );
}
