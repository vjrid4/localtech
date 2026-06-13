"use client";

/**
 * /review/[token] — one-tap star rating from WhatsApp link (T18).
 * No login required. Token is a signed JWT (7d expiry) containing jobId.
 * Designed for mobile-first, fast on 3G, one-handed use.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

type JobInfo = {
  reference: string;
  status: string;
  completedAt: string | null;
  alreadyReviewed: boolean;
  existingRating: number | null;
  technician: {
    name: string;
    photoUrl: string | null;
    trustScore: number;
    totalCompleted: number;
  };
};

type Phase = "loading" | "error" | "rate" | "done" | "already";

export default function ReviewPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";

  const [phase, setPhase] = useState<Phase>("loading");
  const [job, setJob] = useState<JobInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/review/${token}`)
      .then(async (r) => {
        const j = await r.json();
        if (!j.success) throw new Error(j.message);
        setJob(j.data);
        if (j.data.alreadyReviewed) setPhase("already");
        else if (j.data.status !== "COMPLETED") setPhase("error"), setErrorMsg("This repair isn't completed yet — check back later.");
        else setPhase("rate");
      })
      .catch((e) => {
        setPhase("error");
        setErrorMsg(e.message || "Something went wrong. Please try again.");
      });
  }, [token]);

  async function submit() {
    if (stars === 0 || submitting) return;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/review/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars, text: text.trim() || undefined }),
      });
      const j = await r.json();
      if (j.success) {
        setPhase("done");
      } else {
        setErrorMsg(j.message);
        setPhase("error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const display = hovered || stars;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Logo strip */}
      <Link href="/" className="mb-8 flex items-center gap-2" style={jk}>
        <span className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white font-black text-sm">L</span>
        <span className="font-bold text-gray-900 text-lg tracking-tight">LocalTech</span>
      </Link>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Loading */}
        {phase === "loading" && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">😕</div>
            <p className="font-semibold text-gray-800 mb-2" style={jk}>{errorMsg}</p>
            <Link href="/" className="text-sm text-green-600 hover:underline">Go to LocalTech</Link>
          </div>
        )}

        {/* Already reviewed */}
        {phase === "already" && (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">
              {job?.existingRating ? "★".repeat(job.existingRating) : "⭐"}
            </div>
            <p className="font-bold text-gray-800 mb-1" style={jk}>You&apos;ve already rated this repair</p>
            <p className="text-sm text-gray-500 mb-6">Thanks for the feedback — it helps the community.</p>
            <Link href={`/track/${job?.reference}`}
              className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl">
              View booking
            </Link>
          </div>
        )}

        {/* Rate */}
        {phase === "rate" && job && (
          <div className="p-6">
            {/* Technician card */}
            <div className="flex items-center gap-3 mb-6">
              {job.technician.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.technician.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold shrink-0" style={jk}>
                  {job.technician.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate" style={jk}>{job.technician.name}</p>
                <p className="text-xs text-gray-500">{job.technician.totalCompleted} repairs completed</p>
                {job.completedAt && (
                  <p className="text-xs text-gray-400">
                    {new Date(job.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            </div>

            <p className="text-center font-bold text-gray-800 mb-1" style={jk}>
              How was your repair?
            </p>
            <p className="text-center text-sm text-gray-500 mb-5">
              Tap a star to rate {job.technician.name.split(" ")[0]}&apos;s service
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-1.5 mb-5" onMouseLeave={() => setHovered(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setStars(n)}
                  onMouseEnter={() => setHovered(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className={`text-4xl transition-all duration-100 active:scale-90 select-none ${
                    n <= display ? "opacity-100 scale-110" : "opacity-30"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>

            {/* Rating label */}
            {display > 0 && (
              <p className="text-center text-sm font-semibold text-gray-600 mb-4" style={jk}>
                {display === 1 ? "Very poor"
                  : display === 2 ? "Poor"
                  : display === 3 ? "Okay"
                  : display === 4 ? "Good"
                  : "Excellent!"}
              </p>
            )}

            {/* Text box — always show once star is chosen */}
            {stars > 0 && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder={
                  stars <= 2
                    ? "What went wrong? We'll make it right."
                    : "Anything to share? (optional)"
                }
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:outline-none text-sm mb-4 resize-none"
              />
            )}

            <button
              onClick={submit}
              disabled={stars === 0 || submitting}
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold rounded-xl transition text-sm"
              style={jk}
            >
              {submitting ? "Submitting…" : stars === 0 ? "Tap a star to rate" : "Submit Rating"}
            </button>
          </div>
        )}

        {/* Done */}
        {phase === "done" && (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">
              {"⭐".repeat(stars)}
            </div>
            <p className="font-bold text-lg text-gray-800 mb-1" style={jk}>
              {stars >= 4 ? "Thank you!" : "Thanks for the feedback"}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              {stars >= 4
                ? `You helped ${job?.technician.name.split(" ")[0]} build their reputation.`
                : "We've noted your feedback and will follow up."}
            </p>
            {stars <= 2 && (
              <p className="text-xs text-gray-400 mb-5">
                Someone from LocalTech will call you today.
              </p>
            )}
            <div className="flex flex-col gap-2 mt-6">
              {job?.reference && (
                <Link href={`/track/${job.reference}`}
                  className="block py-2.5 px-5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
                  View your booking
                </Link>
              )}
              <Link href="/book"
                className="block py-2.5 px-5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition">
                Book another repair
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        LocalTech · Verified repairs, 30-day warranty
      </p>
    </div>
  );
}
