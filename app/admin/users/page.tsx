"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/auth/client";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  userType: string;
  createdAt: string;
};

const ROLES = ["ADMIN", "REPAIR_SHOP_OWNER", "TECHNICIAN", "CUSTOMER", "SUPPLIER"];
const ROLE_STYLE: Record<string, string> = {
  ADMIN: "bg-amber-500/15 text-amber-400",
  REPAIR_SHOP_OWNER: "bg-accent-500/15 text-accent-400",
  TECHNICIAN: "bg-blue-500/15 text-blue-400",
  CUSTOMER: "bg-purple-500/15 text-purple-400",
  SUPPLIER: "bg-orange-500/15 text-orange-400",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<{ success: boolean; data: UserRow[] }>(`/api/admin/users${filter ? `?userType=${filter}` : ""}`)
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <div className="flex gap-2 flex-wrap">
          {["", ...ROLES].map((r) => (
            <button
              key={r || "all"}
              onClick={() => setFilter(r)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                filter === r ? "border-accent-500/50 text-accent-400 bg-accent-500/10" : "border-white/10 text-graphite-400 hover:text-white"
              }`}
            >
              {r ? r.replace(/_/g, " ") : "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="glass rounded-xl border border-white/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-graphite-500 uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-graphite-400">{u.email}</td>
                  <td className="px-4 py-3 text-graphite-400">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_STYLE[u.userType] ?? "bg-white/5 text-graphite-400"}`}>
                      {u.userType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-graphite-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-graphite-500 text-sm p-4">No users found.</p>}
        </div>
      )}
    </div>
  );
}
