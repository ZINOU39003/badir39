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
} from "lucide-react";

const CITIZEN_SERVICES = [
  { id: "municipality", title: "شؤون البلدية", desc: "النظافة، الإنارة، والطرق", icon: "🏢" },
  { id: "water", title: "الموارد المائية", desc: "تسربات المياه والتوزيع", icon: "💧" },
  { id: "electricity", title: "الطاقة والكهرباء", desc: "أعطال الشبكات والإنارة", icon: "⚡" },
  { id: "health", title: "الصحة العامة", desc: "الرعاية والخدمات الطبية", icon: "🏥" },
  { id: "roads", title: "الأشغال العمومية", desc: "صيانة الطرق والجسور", icon: "🛣️" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items =
        user.role === "admin" || user.role === "department"
          ? await getAdminComplaints()
          : await getMyComplaints(user.id);
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

  // Group by department
  const deptStats = complaints.reduce((acc: any, c) => {
    const dept = c.assigned_dept || "غير محدد";
    if (!acc[dept]) acc[dept] = { total: 0, resolved: 0 };
    acc[dept].total++;
    if (c.status === "resolved") acc[dept].resolved++;
    return acc;
  }, {});

  const topDepts = Object.entries(deptStats)
    .map(([name, stats]: [string, any]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Welcome Banner */}
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
                : `نظام الإدارة المركزي لـ ${user?.organization || "ولاية الجزائر"}. تابع وتتبع الطلبات لضمان خدمة أفضل.`}
            </p>
          </div>
          <div className="flex items-center gap-4">
             {isCitizen && (
              <Link
                href="/dashboard/report"
                className="flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-2xl font-black hover:bg-primary-50 hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <FilePlus size={22} />
                تقديم بلاغ جديد
              </Link>
            )}
            <button
              onClick={refresh}
              className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 group"
            >
              <RefreshCw size={20} className={cn("group-active:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          label={isStaff ? "إجمالي البلاغات" : "بلاغاتي الكلية"}
          value={total}
          subtext="+2 من أمس"
          trend="up"
          color="text-slate-900"
          icon={<ListChecks className="text-slate-600" />}
        />
        <SummaryCard 
          label="تحت الدراسة"
          value={pending}
          subtext="مراجعة فورية"
          color="text-amber-600"
          icon={<Clock className="text-amber-500" />}
        />
         <SummaryCard 
          label="جاري التنفيذ"
          value={inProgress}
          subtext="عمل ميداني"
          color="text-blue-600"
          icon={<TrendingUp className="text-blue-500" />}
        />
        <SummaryCard 
          label="تم الحل"
          value={resolved}
          subtext={`${resolutionRate}% نسبة الإنجاز`}
          color="text-primary"
          icon={<CheckCircle2 className="text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Complaints */}
          <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
              <h2 className="font-black text-lg flex items-center gap-3">
                <ListChecks size={22} className="text-primary" />
                {isCitizen ? "أحدث التحديثات" : "طلبات العمل الحالية"}
              </h2>
              <Link
                href={isCitizen ? "/dashboard/tracking" : "/dashboard/admin"}
                className="text-primary text-xs font-black bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                عرض الكل
              </Link>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <Loader />
                <p className="text-xs font-bold text-muted-foreground">جاري جلب البيانات...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 border border-border">
                  <AlertCircle size={32} className="opacity-20" />
                </div>
                <p className="text-sm font-bold">لا يوجد نشاط مسجل حالياً</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {complaints.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/complaint/${c.id}`}
                    className="flex items-center justify-between px-8 py-5 hover:bg-background/40 transition-all group"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{c.title}</p>
                      <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold whitespace-nowrap">#{c.id}</span>
                        <span className="text-[10px] text-muted-foreground truncate font-medium">
                          {c.assigned_dept} • {formatDate(c.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border", getStatusColor(c.status))}>
                        {getStatusLabel(c.status)}
                      </span>
                      <ArrowLeft size={16} className="text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Stats */}
        <div className="space-y-6">
           {/* Detailed Progress Card */}
           <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
            <h3 className="text-sm font-black mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              الإحصائيات التحليلية
            </h3>
            
            <div className="space-y-6">
              {/* Resolution Rate */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-bold text-muted-foreground">نسبة حل البلاغات</p>
                  <p className="text-lg font-black text-primary">{resolutionRate}%</p>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${resolutionRate}%` }} 
                  />
                </div>
              </div>

              {/* Department Distribution */}
              <div className="pt-4 border-t border-border">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-4">أكثر المصالح استقبالاً</p>
                <div className="space-y-4">
                   {topDepts.length > 0 ? topDepts.map((dept, i) => (
                     <div key={i} className="space-y-1.5">
                       <div className="flex justify-between items-center text-[11px] font-bold">
                         <span className="truncate max-w-[150px]">{dept.name}</span>
                         <span>{dept.total} بلاغ</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-slate-400 rounded-full opacity-60" 
                           style={{ width: `${(dept.total / total) * 100}%` }} 
                         />
                       </div>
                     </div>
                   )) : (
                     <p className="text-xs text-muted-foreground font-medium italic">لا توجد بيانات كافية</p>
                   )}
                </div>
              </div>

              <div className="pt-6">
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase mb-1">اقتراح ترقية</p>
                  <p className="text-[11px] text-primary/70 font-medium leading-relaxed">
                    تحليل الأسبوع يظهر زيادة في بلاغات الإنارة، نقترح توجيه فريق الصيانة لحي المركز.
                  </p>
                </div>
              </div>
            </div>
           </div>

           {/* Mobile Tools Quick Access */}
           <div className="grid grid-cols-2 gap-3">
              <QuickTool icon={Building2} label="المصالح" href="/dashboard/departments" />
              <QuickTool icon={Users} label="المستخدمين" href="/dashboard/admin" />
           </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, subtext, icon, color, trend }: any) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center border border-border text-slate-500">
          {icon}
        </div>
        {trend && (
           <span className="text-[10px] font-black bg-green-50 text-green-600 px-2 py-1 rounded-lg">
             {trend === 'up' ? '↑' : '↓'} 12%
           </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className={cn("text-3xl font-black", color)}>{value}</p>
          <span className="text-[10px] font-bold text-muted-foreground opacity-60">{subtext}</span>
        </div>
      </div>
    </div>
  );
}

function QuickTool({ icon: Icon, label, href }: any) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-2 p-4 bg-surface rounded-2xl border border-border hover:border-primary/40 hover:bg-primary-50/5 transition-all text-muted-foreground hover:text-primary">
       <Icon size={20} />
       <span className="text-[10px] font-black">{label}</span>
    </Link>
  );
}

function Loader() {
  return (
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
