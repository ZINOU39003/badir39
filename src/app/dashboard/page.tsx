"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { getMyComplaints, getAdminComplaints } from "@/lib/api";
import { Complaint } from "@/types";
import { cn, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import {
  FilePlus,
  ListChecks,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Users,
  Building2,
  ArrowLeft,
  MapPin,
  ShieldCheck,
  LayoutGrid,
  ChevronRight
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let items: Complaint[] = [];
      if (user.role === "admin") {
        items = await getAdminComplaints();
      } else if (user.role === "department") {
        // Isolate data for depts by passing their daira/baladiya/organization as filters
        items = await getAdminComplaints({ 
          daira: user.daira, 
          baladiya: user.baladiya,
          dept: user.organization
        });
      } else {
        items = await getMyComplaints(user.id);
      }
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

  const isCitizen = user?.role === "citizen";
  const isStaff = user?.role === "admin" || user?.role === "department";
  const isAdmin = user?.role === "admin";

  // Statistics Calculations
  const total = complaints.length;
  const pending = complaints.filter(
    (c) => c.status === "submitted" || c.status === "under_review"
  ).length;
  const inProgress = complaints.filter(c => c.status === "in_progress").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Group by Daira (District) for Admin
  const districtStats = complaints.reduce((acc: any, c) => {
    const dist = c.district || "غير محدد";
    if (!acc[dist]) acc[dist] = { total: 0, resolved: 0 };
    acc[dist].total++;
    if (c.status === "resolved") acc[dist].resolved++;
    return acc;
  }, {});

  const topDistricts = Object.entries(districtStats)
    .map(([name, stats]: [string, any]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
      
      {isAdmin ? (
         /* ADMIN COMMAND CENTER HEADER */
         <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-900 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-slate-900 rounded-[2.5rem] p-10 text-white overflow-hidden border border-white/5 shadow-2xl">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    نظام الإدارة المركزي للولاية
                  </div>
                  <h1 className="text-5xl font-black tracking-tight leading-tight">
                    مركز العمليات <span className="text-emerald-400 italic">بادر</span>
                  </h1>
                  <p className="text-slate-400 text-sm max-w-xl leading-relaxed font-medium">
                    مرحباً بك سيادة المدير. أنت تتحكم الآن في المنصة المركزية لمتابعة كافة البلاغات الواردة من مختلف الدوائر والبلديات لضمان جودة الخدمة العمومية.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                   <AdminQuickStat label="نسبة الحسم" value={`${resolutionRate}%`} icon={TrendingUp} color="text-emerald-400" />
                   <AdminQuickStat label="إجمالي الدوائر" value={topDistricts.length.toString()} icon={MapPin} color="text-blue-400" />
                   <button onClick={refresh} className="w-16 h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-90">
                     <RefreshCw size={24} className={cn("text-slate-400 group-hover:text-white transition-all", loading && "animate-spin")} />
                   </button>
                </div>
              </div>
            </div>
         </div>
      ) : (
        /* CITIZEN/DEPT HEADER */
        <div className="bg-gradient-to-l from-primary-800 to-primary rounded-3xl p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-[300px]">
              <p className="text-primary-100 text-sm font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                مرحباً بك مجدداً،
              </p>
              <h1 className="text-4xl font-black">{user?.full_name}</h1>
              <p className="text-primary-100 mt-3 text-sm leading-relaxed max-w-xl font-medium opacity-90">
                {isCitizen
                  ? "ساهم في تحسين جودة الحياة في منطقتك من خلال تقديم بلاغاتك ومتابعتها بكل شفافية."
                  : `نظام الإدارة المركزي لـ ${user?.organization || "ولاية الوادي"}. تابع وتتبع الطلبات لضمان خدمة أفضل.`}
              </p>
            </div>
            {isCitizen && (
              <Link
                href="/dashboard/report"
                className="flex items-center gap-2 bg-white text-primary px-8 py-3.5 border-2 border-white rounded-2xl font-black hover:bg-transparent hover:text-white transition-all shadow-xl"
              >
                <FilePlus size={22} />
                تقديم بلاغ جديد
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Statistics Column */}
        <div className="lg:col-span-1 space-y-6">
           <SummaryCardSmall label="تحت الدراسة" value={pending} color="amber" icon={Clock} />
           <SummaryCardSmall label="جاري التنفيذ" value={inProgress} color="blue" icon={TrendingUp} />
           <SummaryCardSmall label="تم الحل" value={resolved} color="emerald" icon={CheckCircle2} />
           
           {isAdmin && (
             <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-5 mt-8">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">أداء الدوائر</p>
                <div className="space-y-4">
                  {topDistricts.slice(0, 3).map((d: any, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-xs font-black">
                           {i + 1}
                        </div>
                        <span className="text-xs font-bold text-slate-300">{d.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-500">{d.total} بلاغ</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/stats" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 text-[10px] font-black text-emerald-500 hover:text-emerald-400 transition-colors">
                  فتح الإحصائيات التفصيلية <ChevronRight size={14} />
                </Link>
             </div>
           )}
        </div>

        {/* Content Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface/50 backdrop-blur-sm rounded-[2rem] border border-border shadow-sm overflow-hidden min-h-[500px]">
             <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <ListChecks size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-lg">
                      {isCitizen ? "أحدث التحديثات" : "طلبات العمل الحالية"}
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground">متابعة دقيقة لكافة الطلبات الميدانية</p>
                  </div>
                </div>
                <Link
                  href={isCitizen ? "/dashboard/tracking" : "/dashboard/admin"}
                  className="flex items-center gap-2 text-primary text-xs font-black bg-primary/5 px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-all"
                >
                  عرض الكل <LayoutGrid size={14} />
                </Link>
             </div>

             {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">جاري سحب البيانات من المركز</p>
                </div>
             ) : (
                <div className="divide-y divide-border/50">
                   {complaints.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 opacity-50">
                          <AlertCircle size={40} />
                        </div>
                        <p className="text-sm font-bold">لا يوجد نشاط عمل حالياً</p>
                      </div>
                   ) : (
                      complaints.slice(0, 10).map((c) => (
                        <Link
                          key={c.id}
                          href={`/dashboard/complaint/${c.id}`}
                          className="flex items-center justify-between px-8 py-6 hover:bg-primary/[0.02] transition-all group relative overflow-hidden"
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                             <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-xs text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                #{c.id.slice(0, 4)}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors truncate mb-1">
                                  {c.title}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                      <MapPin size={12} className="text-slate-400" />
                                      {c.municipality || "المركز المعني"} • {c.district || "الدائرة"}
                                   </div>
                                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                      <Clock size={12} />
                                      {formatDate(c.created_at)}
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className={cn("px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-wider", getStatusColor(c.status))}>
                                {getStatusLabel(c.status)}
                             </span>
                             <ArrowLeft size={18} className="text-slate-300 group-hover:text-primary transition-all -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                          </div>
                        </Link>
                      ))
                   )}
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}

function AdminQuickStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[140px] hover:bg-white/10 transition-all cursor-default">
       <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase mb-1">
          <Icon size={14} className={color} />
          {label}
       </div>
       <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function SummaryCardSmall({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-600",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-600",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
      <div>
        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 tracking-wider">{label}</p>
        <p className={cn("text-2xl font-black", colors[color].split(' ')[2])}>{value}</p>
      </div>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors[color].split(' ').slice(0, 2).join(' '))}>
        <Icon size={24} />
      </div>
    </div>
  );
}
