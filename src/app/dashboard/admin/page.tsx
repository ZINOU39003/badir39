"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { getAdminComplaints } from "@/lib/api";
import { Complaint } from "@/types";
import { cn, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { Search, Shield, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getAdminComplaints();
      setComplaints(items);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.title.includes(search) ||
      c.id.includes(search) ||
      c.assigned_dept?.includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "pending" && (c.status === "submitted" || c.status === "under_review")) ||
      (filter === "resolved" && c.status === "resolved");
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">الطلبات الواردة</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة البلاغات والطلبات الواردة
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
        >
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث..."
            className="w-full h-10 pr-4 pl-10 rounded-xl border border-border bg-surface text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        {["all", "pending", "resolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filter === f
                ? "bg-primary text-white shadow-md"
                : "bg-surface border border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            {f === "all" ? "الكل" : f === "pending" ? "قيد المعالجة" : "تم الحل"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Shield size={48} className="mb-4 opacity-30" />
          <p className="text-sm font-semibold">لا توجد بلاغات</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">الرقم</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">العنوان</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">المصلحة</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">التاريخ</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-background/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/complaint/${c.id}`}
                      className="font-bold hover:text-primary transition-colors"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.assigned_dept}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", getStatusColor(c.status))}>
                      {getStatusLabel(c.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
