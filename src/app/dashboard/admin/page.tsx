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
  const [selectedDaira, setSelectedDaira] = useState<string>("all");
  const [selectedBaladiya, setSelectedBaladiya] = useState<string>("all");

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

  // Extract unique dairas and baladiyas for filters
  const dairas = Array.from(new Set(complaints.map(c => c.district).filter(Boolean)));
  const baladiyas = Array.from(new Set(complaints.filter(c => selectedDaira === 'all' || c.district === selectedDaira).map(c => c.municipality).filter(Boolean)));

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.title.includes(search) ||
      c.id.includes(search) ||
      c.assigned_dept?.includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "pending" && (c.status === "submitted" || c.status === "under_review")) ||
      (filter === "resolved" && c.status === "resolved");
    const matchDaira = selectedDaira === "all" || c.district === selectedDaira;
    const matchBaladiya = selectedBaladiya === "all" || c.municipality === selectedBaladiya;
    
    return matchSearch && matchFilter && matchDaira && matchBaladiya;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-black">الطلبات الواردة</h1>
          <p className="text-slate-400 text-xs mt-1 font-bold">
            فرز ومتابعة البلاغات على مستوى الولاية، الدوائر والبلديات
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          تحديث البيانات
        </button>
      </div>

      {/* Filters Hub */}
      <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث برقم البلاغ، العنوان أو المصلحة..."
              className="w-full h-12 pr-4 pl-12 rounded-2xl border border-border bg-background text-foreground font-bold text-xs focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-border">
            {["all", "pending", "resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider",
                  filter === f
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "text-muted-foreground hover:bg-white"
                )}
              >
                {f === "all" ? "كافة الحالات" : f === "pending" ? "تحت المعالجة" : "تم الحل"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
           <div className="space-y-1.5">
             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">تصفية حسب الدائرة</label>
             <select 
               value={selectedDaira}
               onChange={(e) => { setSelectedDaira(e.target.value); setSelectedBaladiya("all"); }}
               className="w-full h-11 px-4 rounded-xl border border-border bg-background text-xs font-bold appearance-none transition-all focus:border-primary"
             >
               <option value="all">كافة الدوائر</option>
               {dairas.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
           </div>
           <div className="space-y-1.5">
             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">تصفية حسب البلدية</label>
             <select 
               value={selectedBaladiya}
               onChange={(e) => setSelectedBaladiya(e.target.value)}
               className="w-full h-11 px-4 rounded-xl border border-border bg-background text-xs font-bold appearance-none transition-all focus:border-primary"
             >
               <option value="all">كافة بلديات {selectedDaira !== 'all' ? selectedDaira : 'الولاية'}</option>
               {baladiyas.map(b => <option key={b} value={b}>{b}</option>)}
             </select>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">مزامنة البيانات الإدارية</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-surface rounded-[2rem] border-2 border-dashed border-border text-muted-foreground">
          <Shield size={64} className="mb-4 opacity-10" />
          <p className="text-sm font-black">لا توجد بلاغات تطابق معايير البحث الحالية</p>
          <button onClick={() => { setSearch(""); setFilter("all"); setSelectedDaira("all"); setSelectedBaladiya("all"); }} className="mt-4 text-xs font-bold text-primary hover:underline">إعادة ضبط التصفية</button>
        </div>
      ) : (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  <th className="px-6 py-4 font-black text-[10px] text-muted-foreground uppercase">المعرف</th>
                  <th className="px-6 py-4 font-black text-[10px] text-muted-foreground uppercase">الموقع الإداري</th>
                  <th className="px-6 py-4 font-black text-[10px] text-muted-foreground uppercase">موضوع البلاغ</th>
                  <th className="px-6 py-4 font-black text-[10px] text-muted-foreground uppercase">المصلحة</th>
                  <th className="px-6 py-4 font-black text-[10px] text-muted-foreground uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-primary/[0.02] transition-all group cursor-default">
                    <td className="px-6 py-5">
                       <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md">#{c.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="font-black text-xs text-slate-900">{c.municipality || "المركز"}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">{c.district || "الدائرة الرئيسية"}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <Link
                        href={`/dashboard/complaint/${c.id}`}
                        className="font-black text-sm text-slate-800 hover:text-primary transition-colors block max-w-xs truncate"
                      >
                        {c.title}
                      </Link>
                      <span className="text-[10px] font-bold text-muted-foreground mt-0.5 block">{formatDate(c.created_at)}</span>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-blue-400 rounded-full" />
                           <span className="text-xs font-bold text-slate-600">{c.assigned_dept || "قيد التوجيه"}</span>
                        </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest", getStatusColor(c.status))}>
                        {getStatusLabel(c.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
