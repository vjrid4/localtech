"use client";

import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import { apiGet } from "@/lib/auth/client";
import StatusUpdateDrawer from "@/components/StatusUpdateDrawer";

type Job = {
  id: string;
  priority: string;
  issue: string;
  status: string;
  diagnosis: string | null;
  solution: string | null;
  createdAt: string;
  estimatedCost: number | null;
  finalCost: number | null;
  device: { id: string; brand: string; model: string; color: string | null } | null;
  customerName: string | null;
  customerPhone: string | null;
};

type TechDashboard = {
  metrics: {
    todaysJobs: number;
    totalRepairs: number;
    successRate: string | number;
    avgRating: string | number;
    certifications: number;
  };
  jobQueue: Job[];
  specializations: string[];
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444", HIGH: "#f59e0b", NORMAL: "#3b82f6",
  LOW: "#6b7280", MEDIUM: "#3b82f6", URGENT: "#ef4444",
};
const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "#6366f1", DIAGNOSED: "#8b5cf6", QUOTED: "#f59e0b",
  APPROVED: "#06b6d4", IN_PROGRESS: "#3b82f6", COMPLETED: "#22c55e",
  DELIVERED: "#10b981", CANCELLED: "#ef4444",
};
const tooltipStyle = {
  backgroundColor: "#202020", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", color: "#fff", fontSize: "12px",
};

function StatCard({ label, value, sub, color = "text-white" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-xs text-graphite-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-graphite-500 mt-1">{sub}</p>}
    </div>
  );
}

function JobCard({ job, onUpdated }: { job: Job; onUpdated: (id: string, status: string, fields: Record<string, any>) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`glass rounded-xl border transition-all duration-200 ${
      job.priority === "URGENT" || job.priority === "CRITICAL" ? "border-red-500/20" :
      job.priority === "HIGH" ? "border-amber-500/15" : "border-transparent"
    }`}>
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
            style={{ background: PRIORITY_COLORS[job.priority] ?? "#666" }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {job.device ? `${job.device.brand} ${job.device.model}` : "Unknown device"}
                </p>
                <p className="text-sm text-graphite-400 mt-0.5 truncate">{job.issue}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: (STATUS_COLORS[job.status] ?? "#666") + "22", color: STATUS_COLORS[job.status] ?? "#aaa" }}
                >
                  {job.status.replace("_", " ")}
                </span>
                <StatusUpdateDrawer
                  repairId={job.id}
                  currentStatus={job.status}
                  currentDiagnosis={job.diagnosis}
                  currentEstimatedCost={job.estimatedCost}
                  onUpdated={(newStatus, fields) => onUpdated(job.id, newStatus, fields)}
                />
              </div>
            </div>

            {/* Quick meta */}
            <div className="flex items-center gap-3 mt-2 text-xs text-graphite-500">
              {job.customerName && <span>{job.customerName}</span>}
              {job.customerPhone && <span>{job.customerPhone}</span>}
              {job.estimatedCost && <span>Est. ₹{job.estimatedCost.toLocaleString("en-IN")}</span>}
              <span>{new Date(job.createdAt).toLocaleDateString("en-IN")}</span>
              <button
                onClick={() => setExpanded((e) => !e)}
                className="ml-auto text-graphite-600 hover:text-graphite-300 transition"
              >
                {expanded ? "▲ less" : "▼ more"}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2 text-sm">
            {job.device?.color && (
              <div className="flex gap-2">
                <span className="text-graphite-500 w-24 shrink-0">Color</span>
                <span className="capitalize">{job.device.color}</span>
              </div>
            )}
            {job.diagnosis && (
              <div className="flex gap-2">
                <span className="text-graphite-500 w-24 shrink-0">Diagnosis</span>
                <span className="text-graphite-200">{job.diagnosis}</span>
              </div>
            )}
            {job.solution && (
              <div className="flex gap-2">
                <span className="text-graphite-500 w-24 shrink-0">Solution</span>
                <span className="text-graphite-200">{job.solution}</span>
              </div>
            )}
            {job.finalCost && (
              <div className="flex gap-2">
                <span className="text-graphite-500 w-24 shrink-0">Final Cost</span>
                <span className="text-accent-400 font-semibold">₹{job.finalCost.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-graphite-500 w-24 shrink-0">Priority</span>
              <span className="font-bold" style={{ color: PRIORITY_COLORS[job.priority] }}>{job.priority}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TechnicianDashboard() {
  const [data, setData] = useState<TechDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<{ success: boolean; data: TechDashboard }>("/api/dashboard/technician")
      .then((r) => setData(r.data))
      .catch((e) => {
        // Marketplace-only technicians have a TechnicianProfile but no
        // shop-bound Technician row — their world is the Marketplace Jobs
        // inbox, not the shop CRM queue. Send them there.
        if (String(e.message).includes("Technician profile not found")) {
          window.location.replace("/dashboard/technician/jobs");
          return;
        }
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleJobUpdated(id: string, newStatus: string, fields: Record<string, any>) {
    setData((d) => {
      if (!d) return d;
      const terminal = ["COMPLETED", "DELIVERED", "CANCELLED"];
      return {
        ...d,
        jobQueue: terminal.includes(newStatus)
          ? d.jobQueue.filter((j) => j.id !== id)
          : d.jobQueue.map((j) =>
              j.id === id ? { ...j, status: newStatus, ...fields } : j
            ),
        metrics: {
          ...d.metrics,
          todaysJobs: terminal.includes(newStatus)
            ? Math.max(0, d.metrics.todaysJobs - 1)
            : d.metrics.todaysJobs,
        },
      };
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="glass rounded-xl p-8 text-center text-red-400">{error}</div>;
  if (!data) return null;

  const successNum = parseFloat(String(data.metrics.successRate));
  const radialData = [{ name: "Success", value: successNum, fill: "#22c55e" }];

  const byPriority = ["URGENT", "HIGH", "MEDIUM", "LOW", "NORMAL"].reduce<Record<string, Job[]>>((acc, p) => {
    const jobs = data.jobQueue.filter((j) => j.priority === p);
    if (jobs.length) acc[p] = jobs;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Workbench</h1>
        <p className="text-graphite-400 mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          {" · "}{data.jobQueue.length} active jobs
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Jobs" value={data.metrics.todaysJobs} sub="In queue now" color="text-accent-500" />
        <StatCard label="Total Repairs" value={data.metrics.totalRepairs} sub="All time" />
        <StatCard label="Avg Rating" value={data.metrics.avgRating} sub="Customer reviews" />
        <StatCard label="Certifications" value={data.metrics.certifications} sub="Verified skills" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Success rate gauge */}
        <div className="glass rounded-xl p-5 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest mb-4">Success Rate</h3>
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart cx={90} cy={90} innerRadius={60} outerRadius={85}
                startAngle={90} endAngle={90 - (successNum / 100) * 360} data={radialData}>
                <RadialBar dataKey="value" cornerRadius={6} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Success Rate"]} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent-500">{data.metrics.successRate}%</p>
                <p className="text-xs text-graphite-500">completion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest mb-4">Specializations</h3>
          {data.specializations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.specializations.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent-500/10 text-accent-400 border border-accent-500/20">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-graphite-500 text-sm">No specializations listed</p>
          )}
        </div>

        {/* Priority breakdown */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest mb-4">By Priority</h3>
          {data.jobQueue.length > 0 ? (
            <div className="space-y-2">
              {Object.entries(byPriority).map(([p, jobs]) => (
                <div key={p} className="flex items-center gap-2">
                  <span className="text-xs font-bold w-16 shrink-0" style={{ color: PRIORITY_COLORS[p] }}>{p}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(jobs.length / data.jobQueue.length) * 100}%`, background: PRIORITY_COLORS[p] }} />
                  </div>
                  <span className="text-xs text-graphite-400 w-4 text-right">{jobs.length}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-graphite-500 text-sm">Queue is clear</p>
          )}
        </div>
      </div>

      {/* Job queue */}
      <div>
        <h3 className="text-sm font-semibold text-graphite-300 uppercase tracking-widest mb-3">
          Job Queue
          {data.jobQueue.length > 0 && (
            <span className="ml-2 text-xs text-graphite-600 normal-case font-normal">
              — click "Update Status" to advance a job
            </span>
          )}
        </h3>
        {data.jobQueue.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center text-graphite-500 text-sm">
            All clear! No pending jobs.
          </div>
        ) : (
          <div className="space-y-3">
            {data.jobQueue.map((job) => (
              <JobCard key={job.id} job={job} onUpdated={handleJobUpdated} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
