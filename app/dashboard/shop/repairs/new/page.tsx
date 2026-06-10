"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/auth/client";

// ─── Types ───────────────────────────────────────────────────────────────────

type ShopContext = {
  shop: { id: string; name: string };
  branches: { id: string; name: string; city: string }[];
  technicians: { id: string; name: string; rating: number }[];
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  devices: Device[];
};

type Device = {
  id: string;
  brand: string;
  model: string;
  color: string | null;
};

type AiIssue = {
  issue: string;
  probability: number;
  solution: string;
  estimatedCost: number;
  requiredParts?: string[];
};

type AiResult = {
  confidence: number;
  possibleIssues: AiIssue[];
  recommendedActions: string[];
  estimatedTimeToRepair: number;
};

type FormState = {
  customer: Customer | null;
  device: Device | null;
  issue: string;
  priority: string;
  technicianId: string;
  estimatedCost: string;
  branchId: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = ["Customer", "Device", "Repair Details", "Review"];

const POPULAR_BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Oppo", "Vivo", "Google"];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", color: "#6b7280", desc: "No rush" },
  { value: "MEDIUM", label: "Medium", color: "#3b82f6", desc: "Normal queue" },
  { value: "HIGH", label: "High", color: "#f59e0b", desc: "Prioritize" },
  { value: "URGENT", label: "Urgent", color: "#ef4444", desc: "Same day" },
];

const COMMON_ISSUES = [
  "Screen cracked / shattered",
  "Battery drains quickly",
  "Charging port not working",
  "Water damage",
  "Speaker not working",
  "Camera not working",
  "Phone not turning on",
  "Touch screen unresponsive",
  "Back glass broken",
  "Software issue / hang",
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < current
                  ? "bg-accent-500 text-graphite-950"
                  : i === current
                  ? "bg-accent-500/20 border-2 border-accent-500 text-accent-400"
                  : "bg-white/5 text-graphite-600"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i === current ? "text-white" : i < current ? "text-accent-500" : "text-graphite-600"
              }`}
            >
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-3 transition-all duration-500 ${i < current ? "bg-accent-500" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Customer ─────────────────────────────────────────────────────────

function CustomerStep({
  value,
  onSelect,
}: {
  value: Customer | null;
  onSelect: (c: Customer) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState<"search" | "new">("search");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const r = await apiGet<{ success: boolean; data: Customer[] }>(`/api/customers?q=${encodeURIComponent(q)}`);
      setResults(r.data);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  async function createCustomer() {
    if (!newName.trim() || !newPhone.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const r = await apiPost<{ success: boolean; data: any }>("/api/customers", {
        name: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
      });
      const d = r.data;
      onSelect({ id: d.id, name: d.user.name, email: d.user.email, phone: d.user.phone, devices: d.devices ?? [] });
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-1">Select Customer</h2>
        <p className="text-graphite-400 text-sm">Search by name or phone, or add a new customer</p>
      </div>

      {value ? (
        <div className="glass rounded-xl p-4 border border-accent-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-500 font-bold">
              {value.name[0]}
            </div>
            <div>
              <p className="font-semibold">{value.name}</p>
              <p className="text-xs text-graphite-400">{value.phone ?? value.email}</p>
            </div>
          </div>
          <button onClick={() => { setQuery(""); setResults([]); (onSelect as any)(null); }} className="text-xs text-graphite-500 hover:text-white transition px-3 py-1 rounded-lg hover:bg-white/5">
            Change
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <button onClick={() => setMode("search")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${mode === "search" ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}>
              Search Existing
            </button>
            <button onClick={() => setMode("new")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${mode === "new" ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}>
              + New Customer
            </button>
          </div>

          {mode === "search" ? (
            <div className="space-y-3">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type name or phone number..." autoFocus className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm" />
              {searching && (
                <div className="flex items-center gap-2 text-graphite-500 text-sm px-1">
                  <div className="w-3 h-3 border border-graphite-500 border-t-transparent rounded-full animate-spin" />
                  Searching…
                </div>
              )}
              {results.length > 0 && (
                <div className="space-y-2">
                  {results.map((c) => (
                    <button key={c.id} onClick={() => onSelect(c)} className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:border-accent-500/30 border border-transparent text-left transition">
                      <div className="w-9 h-9 rounded-full bg-graphite-700 flex items-center justify-center text-sm font-bold shrink-0">{c.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-graphite-500">{c.phone ?? c.email} · {c.devices.length} devices</p>
                      </div>
                      <span className="text-accent-500 text-xs shrink-0">Select →</span>
                    </button>
                  ))}
                </div>
              )}
              {query.length > 1 && !searching && results.length === 0 && (
                <p className="text-graphite-500 text-sm px-1">No customers found. <button onClick={() => setMode("new")} className="text-accent-400 underline">Create new</button></p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name *" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm" />
              <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone number *" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm" />
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email (optional)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm" />
              {createError && <p className="text-red-400 text-sm">{createError}</p>}
              <button onClick={createCustomer} disabled={!newName.trim() || !newPhone.trim() || creating} className="w-full py-3 bg-accent-500 text-graphite-950 font-bold rounded-xl hover:bg-accent-400 transition disabled:opacity-40">
                {creating ? "Creating…" : "Create Customer"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Step 2: Device ───────────────────────────────────────────────────────────

function DeviceStep({ customer, value, onSelect }: { customer: Customer; value: Device | null; onSelect: (d: Device) => void }) {
  const [devices, setDevices] = useState<Device[]>(customer.devices);
  const [mode, setMode] = useState<"pick" | "new">(customer.devices.length === 0 ? "new" : "pick");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [imei, setImei] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function createDevice() {
    const b = brand === "Other" ? customBrand : brand;
    if (!b.trim() || !model.trim()) return;
    setCreating(true);
    setError("");
    try {
      const r = await apiPost<{ success: boolean; data: Device }>("/api/devices", {
        customerId: customer.id,
        brand: b.trim(),
        model: model.trim(),
        color: color.trim() || undefined,
        imei: imei.trim() || undefined,
      });
      setDevices((prev) => [r.data, ...prev]);
      onSelect(r.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-1">Select Device</h2>
        <p className="text-graphite-400 text-sm">Pick from {customer.name}&apos;s devices or register a new one</p>
      </div>

      {value ? (
        <div className="glass rounded-xl p-4 border border-accent-500/30 flex items-center justify-between">
          <div>
            <p className="font-semibold">{value.brand} {value.model}</p>
            {value.color && <p className="text-xs text-graphite-400 capitalize">{value.color}</p>}
          </div>
          <button onClick={() => onSelect(null as any)} className="text-xs text-graphite-500 hover:text-white transition px-3 py-1 rounded-lg hover:bg-white/5">Change</button>
        </div>
      ) : (
        <>
          {devices.length > 0 && (
            <div className="flex gap-2 mb-1">
              <button onClick={() => setMode("pick")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${mode === "pick" ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}>Existing Devices</button>
              <button onClick={() => setMode("new")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${mode === "new" ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}>+ New Device</button>
            </div>
          )}
          {mode === "pick" && (
            <div className="space-y-2">
              {devices.map((d) => (
                <button key={d.id} onClick={() => onSelect(d)} className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:border-accent-500/30 border border-transparent text-left transition">
                  <div className="w-9 h-9 rounded-lg bg-graphite-700 flex items-center justify-center text-lg shrink-0">📱</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{d.brand} {d.model}</p>
                    {d.color && <p className="text-xs text-graphite-500 capitalize">{d.color}</p>}
                  </div>
                  <span className="text-accent-500 text-xs">Select →</span>
                </button>
              ))}
            </div>
          )}
          {mode === "new" && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-graphite-400 mb-2 uppercase tracking-widest">Brand</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {POPULAR_BRANDS.map((b) => (
                    <button key={b} onClick={() => setBrand(b)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${brand === b ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}>{b}</button>
                  ))}
                  <button onClick={() => setBrand("Other")} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${brand === "Other" ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}>Other</button>
                </div>
                {brand === "Other" && <input type="text" value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} placeholder="Brand name" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm" />}
              </div>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model (e.g. iPhone 14 Pro, Galaxy S23) *" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Color (optional)" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm" />
                <input type="text" value={imei} onChange={(e) => setImei(e.target.value)} placeholder="IMEI (optional)" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button onClick={createDevice} disabled={!(brand === "Other" ? customBrand : brand).trim() || !model.trim() || creating} className="w-full py-3 bg-accent-500 text-graphite-950 font-bold rounded-xl hover:bg-accent-400 transition disabled:opacity-40">
                {creating ? "Adding…" : "Add Device"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── AI Diagnosis Panel ───────────────────────────────────────────────────────

function AiDiagnosisPanel({
  device,
  issue,
  onApplyCost,
}: {
  device: Device;
  issue: string;
  onApplyCost: (cost: string) => void;
}) {
  const [diagnosing, setDiagnosing] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  async function runDiagnosis() {
    setDiagnosing(true);
    setError("");
    setResult(null);
    setApplied(false);
    try {
      const r = await apiPost<{ success: boolean; data: AiResult }>("/api/ai/diagnose", {
        deviceBrand: device.brand,
        deviceModel: device.model,
        issueDescription: issue,
        deviceId: device.id,
      });
      setResult(r.data);
    } catch (e: any) {
      setError("AI diagnosis unavailable. You can still enter the cost manually.");
    } finally {
      setDiagnosing(false);
    }
  }

  const top = result?.possibleIssues[0];

  return (
    <div className="mt-1">
      {!result && !diagnosing && (
        <button
          onClick={runDiagnosis}
          disabled={issue.trim().length < 10}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-accent-500/30 text-accent-400 text-xs font-medium hover:bg-accent-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          Analyze with AI
        </button>
      )}

      {diagnosing && (
        <div className="flex items-center gap-2 text-xs text-graphite-400 px-1">
          <div className="w-3.5 h-3.5 border border-accent-500 border-t-transparent rounded-full animate-spin" />
          Analyzing {device.brand} {device.model}…
        </div>
      )}

      {error && <p className="text-xs text-amber-400">{error}</p>}

      {result && top && (
        <div className="glass rounded-xl p-4 border border-accent-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-accent-400">AI Diagnosis</span>
              <span className="text-xs text-graphite-500">{Math.round(result.confidence * 100)}% confidence</span>
            </div>
            <button onClick={() => setResult(null)} className="text-graphite-600 hover:text-graphite-400 text-xs">✕</button>
          </div>

          <div className="space-y-2">
            {result.possibleIssues.slice(0, 3).map((issue, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0 mt-0.5" style={{ opacity: 1 - i * 0.25 }} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white font-medium">{issue.issue}</span>
                  <span className="text-xs text-graphite-500 ml-2">{Math.round(issue.probability * 100)}%</span>
                </div>
                <span className="text-xs text-graphite-400 shrink-0">₹{issue.estimatedCost.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          {result.recommendedActions.length > 0 && (
            <div className="border-t border-white/5 pt-3">
              <p className="text-xs text-graphite-500 mb-1.5">Recommended actions</p>
              <div className="flex flex-wrap gap-1.5">
                {result.recommendedActions.map((a, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-graphite-400">{a}</span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/5 pt-3 flex items-center justify-between">
            <span className="text-xs text-graphite-500">Est. repair time: {result.estimatedTimeToRepair} min</span>
            <button
              onClick={() => {
                onApplyCost(String(top.estimatedCost));
                setApplied(true);
              }}
              disabled={applied}
              className="text-xs px-3 py-1.5 rounded-lg bg-accent-500/15 border border-accent-500/30 text-accent-400 hover:bg-accent-500/25 transition disabled:opacity-50"
            >
              {applied ? "✓ Applied" : `Apply ₹${top.estimatedCost.toLocaleString("en-IN")} estimate`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Repair Details ───────────────────────────────────────────────────

function DetailsStep({
  form,
  device,
  onChange,
  context,
}: {
  form: Omit<FormState, "customer" | "device">;
  device: Device | null;
  onChange: (key: string, val: string) => void;
  context: ShopContext;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Repair Details</h2>
        <p className="text-graphite-400 text-sm">Describe the issue and set job parameters</p>
      </div>

      {/* Common issues quick-pick */}
      <div>
        <p className="text-xs text-graphite-400 mb-2 uppercase tracking-widest">Common Issues</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_ISSUES.map((issue) => (
            <button
              key={issue}
              onClick={() => onChange("issue", issue)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${form.issue === issue ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}
            >
              {issue}
            </button>
          ))}
        </div>
      </div>

      {/* Issue textarea */}
      <textarea
        value={form.issue}
        onChange={(e) => onChange("issue", e.target.value)}
        placeholder="Describe the issue in detail..."
        rows={3}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm resize-none"
      />

      {/* AI Diagnosis — only shown if device is available */}
      {device && (
        <AiDiagnosisPanel
          device={device}
          issue={form.issue}
          onApplyCost={(cost) => onChange("estimatedCost", cost)}
        />
      )}

      {/* Priority */}
      <div>
        <p className="text-xs text-graphite-400 mb-2 uppercase tracking-widest">Priority</p>
        <div className="grid grid-cols-4 gap-2">
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => onChange("priority", p.value)}
              className={`py-3 rounded-xl border text-center transition ${form.priority === p.value ? "border-2" : "border"}`}
              style={form.priority === p.value ? { background: p.color + "22", borderColor: p.color, color: p.color } : { borderColor: "rgba(255,255,255,0.1)", color: "#808080" }}
            >
              <p className="text-xs font-bold">{p.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Technician + Estimated cost */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-graphite-400 mb-2 uppercase tracking-widest">Assign Technician</p>
          <select
            value={form.technicianId}
            onChange={(e) => onChange("technicianId", e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-graphite-900 border border-white/10 text-white focus:outline-none focus:border-accent-500/50 text-sm"
          >
            <option value="">Unassigned</option>
            {context.technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.name} (⭐{t.rating})</option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-xs text-graphite-400 mb-2 uppercase tracking-widest">Estimated Cost (₹)</p>
          <input
            type="number"
            value={form.estimatedCost}
            onChange={(e) => onChange("estimatedCost", e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50 text-sm"
          />
        </div>
      </div>

      {/* Branch */}
      {context.branches.length > 1 && (
        <div>
          <p className="text-xs text-graphite-400 mb-2 uppercase tracking-widest">Branch</p>
          <div className="flex flex-wrap gap-2">
            {context.branches.map((b) => (
              <button
                key={b.id}
                onClick={() => onChange("branchId", b.id)}
                className={`px-4 py-2 rounded-lg text-sm border transition ${form.branchId === b.id ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}
              >
                {b.name} · {b.city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────

function ReviewStep({ form, context, submitting, error, onSubmit }: { form: FormState; context: ShopContext; submitting: boolean; error: string; onSubmit: () => void }) {
  const tech = context.technicians.find((t) => t.id === form.technicianId);
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-graphite-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-medium text-right max-w-56">{value}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Review & Confirm</h2>
        <p className="text-graphite-400 text-sm">Double-check the details before creating the repair job</p>
      </div>
      <div className="glass rounded-xl p-5 space-y-0">
        <Row label="Customer" value={form.customer!.name} />
        <Row label="Phone" value={form.customer!.phone ?? "—"} />
        <Row label="Device" value={`${form.device!.brand} ${form.device!.model}`} />
        {form.device!.color && <Row label="Color" value={form.device!.color} />}
        <Row label="Issue" value={form.issue} />
        <Row label="Priority" value={form.priority} />
        <Row label="Technician" value={tech?.name ?? "Unassigned"} />
        {form.estimatedCost && <Row label="Estimated Cost" value={`₹${parseInt(form.estimatedCost).toLocaleString("en-IN")}`} />}
        <Row label="Shop" value={context.shop.name} />
      </div>
      {error && <div className="glass rounded-xl p-4 border border-red-500/30 text-red-400 text-sm">{error}</div>}
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full py-4 bg-accent-500 text-graphite-950 font-bold rounded-xl hover:bg-accent-400 transition disabled:opacity-50 text-base"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-graphite-950 border-t-transparent rounded-full animate-spin" />
            Creating Repair…
          </span>
        ) : "Create Repair Job"}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewRepairPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [context, setContext] = useState<ShopContext | null>(null);
  const [loadingCtx, setLoadingCtx] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState<FormState>({
    customer: null,
    device: null,
    issue: "",
    priority: "MEDIUM",
    technicianId: "",
    estimatedCost: "",
    branchId: "",
  });

  useEffect(() => {
    apiGet<{ success: boolean; data: ShopContext }>("/api/shop/context")
      .then((r) => {
        setContext(r.data);
        if (r.data.branches.length > 0) setForm((f) => ({ ...f, branchId: r.data.branches[0].id }));
      })
      .finally(() => setLoadingCtx(false));
  }, []);

  function updateForm(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const canNext = [!!form.customer, !!form.device, form.issue.trim().length > 3 && !!form.branchId, true][step];

  async function submit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      await apiPost("/api/repairs", {
        customerId: form.customer!.id,
        deviceId: form.device!.id,
        repairShopId: context!.shop.id,
        branchId: form.branchId,
        issue: form.issue.trim(),
        priority: form.priority,
        technicianId: form.technicianId || undefined,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : undefined,
      });
      router.push("/dashboard/shop/repairs?created=1");
    } catch (e: any) {
      setSubmitError(e.message);
      setSubmitting(false);
    }
  }

  if (loadingCtx || !context) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/dashboard/shop/repairs")} className="text-graphite-500 hover:text-white transition text-sm">← Back</button>
        <h1 className="text-xl font-bold">New Repair Job</h1>
      </div>

      <StepBar current={step} />

      <div className="glass rounded-2xl p-6 min-h-64">
        {step === 0 && (
          <CustomerStep
            value={form.customer}
            onSelect={(c) => setForm((f) => ({ ...f, customer: c ?? null }))}
          />
        )}
        {step === 1 && form.customer && (
          <DeviceStep
            customer={form.customer}
            value={form.device}
            onSelect={(d) => setForm((f) => ({ ...f, device: d ?? null }))}
          />
        )}
        {step === 2 && (
          <DetailsStep
            form={{ issue: form.issue, priority: form.priority, technicianId: form.technicianId, estimatedCost: form.estimatedCost, branchId: form.branchId }}
            device={form.device}
            onChange={updateForm}
            context={context}
          />
        )}
        {step === 3 && (
          <ReviewStep
            form={form}
            context={context}
            submitting={submitting}
            error={submitError}
            onSubmit={submit}
          />
        )}
      </div>

      {step < 3 && (
        <div className="flex justify-between mt-4">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="px-5 py-2.5 rounded-xl border border-white/10 text-graphite-400 hover:text-white hover:bg-white/5 transition disabled:opacity-30 text-sm">
            Back
          </button>
          <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="px-6 py-2.5 rounded-xl bg-accent-500 text-graphite-950 font-bold hover:bg-accent-400 transition disabled:opacity-40 text-sm">
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
