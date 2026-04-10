"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { getMyComplaints } from "@/lib/api";
import { Complaint, ComplaintStatus } from "@/types";
import { cn, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { Search, ListChecks, AlertCircle, Plus, Filter, Loader2, ChevronLeft, Clock } from "lucide-react";

const TABS: { id: ComplaintStatus | "all"; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "submitted", label: "تم الاستلام" },
  { id: "under_review", label: "المراجعة" },
  { id: "in_progress", label: "قيد التنفيذ" },
  { id: "resolved", label: "تم الحل" },
];

export default function TrackingPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ComplaintStatus | "all">("all");

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await getMyComplaints(user.id);
      setComplaints(items);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = complaints.filter(
    (c) =>
      (activeTab === "all" || c.status === activeTab) &&
      (c.title.includes(search) ||
        c.description?.includes(search) ||
        c.id.includes(search))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">تتبع بلاغاتي</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            تابع مسار معالجة انشغالاتك في منصة بادر
          </p>
        </div>
        <Link
          href="/dashboard/report"
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-primary-600 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-95"
        >
          <Plus size={18} />
          تقديم بلاغ جديد
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-2 flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative group">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في قائمة بلاغاتك..."
          className="w-full h-14 pr-4 pl-12 rounded-2xl border border-border bg-surface text-foreground font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-muted-foreground/50 shadow-sm"
        />
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={32} className="animate-spin text-primary/40" />
          <p className="text-xs font-bold text-muted-foreground">جارٍ تحميل القائمة...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6">
            <ListChecks size={40} className="text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-black text-foreground mb-2">لا توجد بلاغات حالياً</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 font-medium">
            {search || activeTab !== "all" 
              ? "لم يتم العثور على أي نتائج تطابق بحثك الحالي."
              : "لم تقم بتقديم أي بلاغ بعد. يمكنك البدء بالمساهمة الآن."}
          </p>
          {(search || activeTab !== "all") ? (
            <button 
              onClick={() => { setSearch(""); setActiveTab("all"); }}
              className="text-primary font-black text-sm hover:underline"
            >
              إعادة تعيين الفلاتر
            </button>
          ) : (
            <Link
              href="/dashboard/report"
              className="bg-background text-foreground border border-border px-8 py-3 rounded-2xl font-black text-sm hover:border-primary/40 transition-all"
            >
              قدم بلاغك الأول
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/complaint/${c.id}`}
              className="group bg-surface rounded-2xl border border-border p-6 hover:border-primary/40 hover:shadow-xl transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-muted-foreground bg-background px-2 py-0.5 rounded border border-border font-mono">
                      #{c.id}
                    </span>
                    <span className="text-[10px] font-bold text-primary/60">{c.assigned_dept}</span>
                  </div>
                  <h3 className="font-black text-base text-foreground group-hover:text-primary transition-colors truncate mb-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed h-8 mb-4">
                    {c.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                       <Clock size={12} />
                       {formatDate(c.created_at)}
                    </div>
                    <div className="flex items-center gap-1 text-primary text-[10px] font-black group-hover:gap-2 transition-all">
                      عرض التفاصيل
                      <ChevronLeft size={14} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black border whitespace-nowrap shadow-sm uppercase",
                      getStatusColor(c.status)
                    )}
                  >
                    {getStatusLabel(c.status)}
                  </span>
                </div>
              </div>
              <div className={cn("absolute bottom-0 right-0 h-1 bg-current opacity-10 transition-all duration-500", getStatusColor(c.status))} style={{ width: '0%', }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
