"use client";

import { useState } from "react";

const ARTICLES = [
  { category: "iPhone", title: "iPhone 14 Pro Max Battery Replacement", difficulty: "Medium", time: "45 min", steps: 8, views: 2341 },
  { category: "Samsung", title: "Samsung S23 Screen Assembly Swap", difficulty: "Hard", time: "90 min", steps: 12, views: 1892 },
  { category: "OnePlus", title: "OnePlus 11 Charging Port Repair", difficulty: "Easy", time: "30 min", steps: 6, views: 987 },
  { category: "iPhone", title: "iPhone 13 Face ID Calibration", difficulty: "Hard", time: "60 min", steps: 10, views: 1543 },
  { category: "General", title: "Micro-soldering Power IC Reballing", difficulty: "Expert", time: "120 min", steps: 15, views: 3210 },
  { category: "General", title: "Water Damage Recovery Protocol", difficulty: "Medium", time: "Varies", steps: 9, views: 4567 },
];

const DIFF_COLORS: Record<string, string> = {
  Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444", Expert: "#8b5cf6",
};

const BRANDS = ["All", "iPhone", "Samsung", "OnePlus", "General"];

export default function KnowledgePage() {
  const [brand, setBrand] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter(
    (a) =>
      (brand === "All" || a.category === brand) &&
      (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-graphite-400 mt-1">Repair guides and technical references</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search guides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50"
        />
        <div className="flex gap-2 flex-wrap">
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`text-xs px-3 py-2 rounded-lg border transition ${brand === b ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white hover:bg-white/5"}`}
            >{b}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a, i) => (
          <div key={i} className="glass rounded-xl p-5 hover:border-accent-500/20 border border-transparent transition cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-graphite-400">{a.category}</span>
              <span className="text-xs font-bold" style={{ color: DIFF_COLORS[a.difficulty] ?? "#aaa" }}>{a.difficulty}</span>
            </div>
            <h3 className="font-semibold mb-3 group-hover:text-accent-400 transition">{a.title}</h3>
            <div className="flex items-center gap-4 text-xs text-graphite-500">
              <span>{a.time}</span>
              <span>{a.steps} steps</span>
              <span className="ml-auto">{a.views.toLocaleString()} views</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-xl p-12 text-center text-graphite-500 text-sm">No guides found</div>
      )}

      <div className="glass rounded-xl p-5 border border-accent-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center text-xl shrink-0">AI</div>
          <div>
            <p className="font-semibold text-accent-400">AI-Assisted Diagnosis</p>
            <p className="text-sm text-graphite-400 mt-0.5">Coming soon — describe a symptom and get step-by-step repair guidance powered by Claude AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
