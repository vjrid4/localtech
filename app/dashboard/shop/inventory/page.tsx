"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/auth/client";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  brands: string[];
  partNumber: string | null;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  quantity: number;
  reorderLevel: number;
  location: string | null;
  lowStock: boolean;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiGet<{ success: boolean; data: InventoryItem[] }>("/api/inventory")
      .then((r) => setItems(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = items.filter((i) => {
    if (filter === "low" && !i.lowStock) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lowCount = items.filter((i) => i.lowStock).length;
  const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-graphite-400 mt-1">{items.length} parts · {lowCount > 0 ? <span className="text-amber-400">{lowCount} low stock</span> : "all stocked"}</p>
        </div>
        {lowCount > 0 && (
          <div className="glass rounded-lg px-4 py-2 border border-amber-500/20">
            <p className="text-amber-400 text-sm font-semibold">{lowCount} items need reorder</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search parts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-graphite-500 focus:outline-none focus:border-accent-500/50"
        />
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-4 py-2 rounded-lg border transition ${filter === "all" ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-graphite-400 hover:text-white"}`}
        >All</button>
        <button
          onClick={() => setFilter("low")}
          className={`text-xs px-4 py-2 rounded-lg border transition ${filter === "low" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "border-white/10 text-graphite-400 hover:text-white"}`}
        >Low Stock</button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-graphite-500 text-sm">No inventory items found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Part</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3 hidden md:table-cell">Category</th>
                <th className="text-left text-xs text-graphite-500 uppercase tracking-widest py-3 px-3 hidden lg:table-cell">Supplier</th>
                <th className="text-right text-xs text-graphite-500 uppercase tracking-widest py-3 px-3">Stock</th>
                <th className="text-right text-xs text-graphite-500 uppercase tracking-widest py-3 px-5">Price</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className={`border-b border-white/5 last:border-0 transition ${item.lowStock ? "bg-amber-500/5" : "hover:bg-white/3"}`}>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      {item.lowStock && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-graphite-500 mt-0.5">
                          {item.brands.join(", ")}{item.partNumber ? ` · ${item.partNumber}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-graphite-300">{item.category}</span>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell text-graphite-400 text-xs">{item.supplier}</td>
                  <td className="py-3 px-3 text-right">
                    <p className={`font-bold ${item.lowStock ? "text-amber-400" : "text-white"}`}>{item.quantity}</p>
                    <p className="text-xs text-graphite-500">min {item.reorderLevel}</p>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <p className="font-medium">{formatINR(item.sellingPrice)}</p>
                    <p className="text-xs text-graphite-500">cost {formatINR(item.costPrice)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
