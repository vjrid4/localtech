"use client";

import { useState } from "react";
import { apiPost } from "@/lib/auth/client";

type Props = {
  repairId: string;
  issue: string;
  currentStatus: string;
  onCreated: () => void;
};

const ALLOWED_STATUSES = ["RECEIVED", "DIAGNOSED", "QUOTED"];

export default function EstimateDrawer({ repairId, issue, currentStatus, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [issueDesc, setIssueDesc] = useState(issue);
  const [diagnosis, setDiagnosis] = useState("");
  const [laborCharge, setLaborCharge] = useState("");
  const [partsCharge, setPartsCharge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!ALLOWED_STATUSES.includes(currentStatus)) return null;
  if (done) return <span className="text-xs text-accent-400 font-medium">✓ Estimate sent</span>;

  const labor = parseFloat(laborCharge) || 0;
  const parts = parseFloat(partsCharge) || 0;
  const total = labor + parts;

  async function submit() {
    if (total <= 0) { setError("Enter at least one charge."); return; }
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/api/estimates", {
        repairId,
        issueDescription: issueDesc.trim(),
        diagnosis: diagnosis.trim() || undefined,
        laborCharge: labor,
        partsCharge: parts,
        estimatedCost: total,
      });
      setDone(true);
      setOpen(false);
      onCreated();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2.5 py-1 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition"
      >
        Send Estimate
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md glass rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Create Estimate</h3>
              <button onClick={() => setOpen(false)} className="text-graphite-500 hover:text-white transition text-lg leading-none">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Issue Description</label>
                <textarea
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accent-500/50 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Diagnosis (optional)</label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={2}
                  placeholder="Technical findings, root cause..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 text-sm focus:outline-none focus:border-accent-500/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Labour (₹)</label>
                  <input
                    type="number"
                    value={laborCharge}
                    onChange={(e) => setLaborCharge(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 text-sm focus:outline-none focus:border-accent-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1.5">Parts (₹)</label>
                  <input
                    type="number"
                    value={partsCharge}
                    onChange={(e) => setPartsCharge(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-600 text-sm focus:outline-none focus:border-accent-500/50"
                  />
                </div>
              </div>

              {total > 0 && (
                <div className="glass rounded-xl p-4 border border-accent-500/20">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-graphite-400">Labour</span>
                    <span>₹{labor.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-graphite-400">Parts</span>
                    <span>₹{parts.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                    <span>Total</span>
                    <span className="text-accent-400">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-graphite-400 hover:text-white transition text-sm">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting || total <= 0}
                className="flex-1 py-2.5 rounded-xl bg-accent-500 text-graphite-950 font-bold hover:bg-accent-400 transition disabled:opacity-40 text-sm"
              >
                {submitting ? "Sending…" : "Send Estimate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
