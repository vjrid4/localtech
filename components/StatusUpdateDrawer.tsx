"use client";

import { useState } from "react";
import { apiPatch } from "@/lib/auth/client";

// Valid next statuses per current status, with what each role can do
const TRANSITIONS: Record<string, string[]> = {
  RECEIVED:    ["DIAGNOSED", "CANCELLED"],
  DIAGNOSED:   ["QUOTED", "IN_PROGRESS", "CANCELLED"],
  QUOTED:      ["APPROVED", "IN_PROGRESS", "CANCELLED"],
  APPROVED:    ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED:   ["DELIVERED"],
  DELIVERED:   [],
  CANCELLED:   [],
};

// Fields required or shown per target status
const FIELDS: Record<string, { diagnosis?: boolean; estimatedCost?: boolean; finalCost?: boolean; solution?: boolean; note?: boolean }> = {
  DIAGNOSED:   { diagnosis: true },
  QUOTED:      { estimatedCost: true },
  IN_PROGRESS: {},
  APPROVED:    {},
  COMPLETED:   { finalCost: true, solution: true },
  DELIVERED:   {},
  CANCELLED:   { note: true },
};

const STATUS_META: Record<string, { label: string; color: string; icon: string; desc: string }> = {
  DIAGNOSED:   { label: "Diagnosed",   color: "#8b5cf6", icon: "🔬", desc: "Issue identified" },
  QUOTED:      { label: "Quoted",      color: "#f59e0b", icon: "💬", desc: "Cost estimate ready" },
  APPROVED:    { label: "Approved",    color: "#06b6d4", icon: "✅", desc: "Customer approved" },
  IN_PROGRESS: { label: "In Progress", color: "#3b82f6", icon: "🔧", desc: "Repair started" },
  COMPLETED:   { label: "Completed",   color: "#22c55e", icon: "✓",  desc: "Repair done" },
  DELIVERED:   { label: "Delivered",   color: "#10b981", icon: "📦", desc: "Returned to customer" },
  CANCELLED:   { label: "Cancelled",   color: "#ef4444", icon: "✕",  desc: "Job cancelled" },
};

export type StatusUpdateDrawerProps = {
  repairId: string;
  currentStatus: string;
  currentDiagnosis?: string | null;
  currentEstimatedCost?: number | null;
  onUpdated: (newStatus: string, fields: Record<string, any>) => void;
};

export default function StatusUpdateDrawer({
  repairId,
  currentStatus,
  currentDiagnosis,
  currentEstimatedCost,
  onUpdated,
}: StatusUpdateDrawerProps) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState(currentDiagnosis ?? "");
  const [estimatedCost, setEstimatedCost] = useState(currentEstimatedCost ? String(currentEstimatedCost) : "");
  const [finalCost, setFinalCost] = useState("");
  const [solution, setSolution] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const next = TRANSITIONS[currentStatus] ?? [];
  if (next.length === 0) return null;

  const requiredFields = target ? FIELDS[target] ?? {} : {};

  const canSubmit =
    target &&
    (!requiredFields.diagnosis || diagnosis.trim().length > 2) &&
    (!requiredFields.estimatedCost || parseFloat(estimatedCost) > 0) &&
    (!requiredFields.finalCost || parseFloat(finalCost) > 0);

  async function submit() {
    if (!target || !canSubmit) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, any> = { status: target };
      if (requiredFields.diagnosis && diagnosis.trim()) payload.diagnosis = diagnosis.trim();
      if (requiredFields.estimatedCost && estimatedCost) payload.estimatedCost = parseFloat(estimatedCost);
      if (requiredFields.finalCost && finalCost) payload.finalCost = parseFloat(finalCost);
      if (requiredFields.solution && solution.trim()) payload.solution = solution.trim();

      await apiPatch(`/api/repairs/${repairId}`, payload);
      onUpdated(target, payload);
      setOpen(false);
      setTarget(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-graphite-400 hover:text-white hover:bg-white/5 transition"
      >
        Update Status
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* drawer */}
          <div className="absolute right-0 top-8 z-50 w-80 glass rounded-xl border border-white/10 shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Update Status</p>
              <button onClick={() => setOpen(false)} className="text-graphite-500 hover:text-white text-lg leading-none">×</button>
            </div>

            {/* Target status selection */}
            <div className="space-y-2">
              <p className="text-xs text-graphite-500 uppercase tracking-widest">Move to</p>
              {next.map((s) => {
                const m = STATUS_META[s];
                return (
                  <button
                    key={s}
                    onClick={() => setTarget(s)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition text-left ${
                      target === s
                        ? "border-2"
                        : "border border-white/5 hover:bg-white/5"
                    }`}
                    style={target === s ? { background: m.color + "18", borderColor: m.color } : {}}
                  >
                    <span className="text-lg w-6 text-center">{m.icon}</span>
                    <div>
                      <p className="text-sm font-medium" style={target === s ? { color: m.color } : {}}>{m.label}</p>
                      <p className="text-xs text-graphite-500">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Contextual fields */}
            {target && (
              <div className="space-y-3 border-t border-white/5 pt-3">
                {requiredFields.diagnosis && (
                  <div>
                    <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1">
                      Diagnosis <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="What did you find?"
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 resize-none"
                    />
                  </div>
                )}
                {requiredFields.estimatedCost && (
                  <div>
                    <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1">
                      Estimated Cost (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50"
                    />
                  </div>
                )}
                {requiredFields.finalCost && (
                  <div>
                    <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1">
                      Final Cost (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={finalCost}
                      onChange={(e) => setFinalCost(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50"
                    />
                  </div>
                )}
                {requiredFields.solution && (
                  <div>
                    <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1">Solution / Notes</label>
                    <textarea
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      placeholder="What was done to fix it?"
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50 resize-none"
                    />
                  </div>
                )}
                {requiredFields.note && (
                  <div>
                    <label className="text-xs text-graphite-400 uppercase tracking-widest block mb-1">Reason</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Why is this being cancelled?"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-graphite-600 focus:outline-none focus:border-accent-500/50"
                    />
                  </div>
                )}

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  onClick={submit}
                  disabled={!canSubmit || saving}
                  className="w-full py-2.5 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition disabled:opacity-40 text-sm"
                >
                  {saving ? "Saving…" : `Mark as ${STATUS_META[target]?.label}`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
