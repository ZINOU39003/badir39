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
  ArrowLeft,
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

  const total = complaints.length;
  const pending = complaints.filter(
    (c) => c.status === "submitted" || c.status === "under_review"
  ).length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-primary-800 to-primary rounded-2xl p-8 text-white shadow-xl shadow-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-primary-100 text-sm font-semibold mb-1">
              مرحباً بك مجدداً،
            </p>
            <h1 className="text-3xl font-black">{user?.full_name}</h1>
            <p className="text-primary-100 mt-2 text-sm leading-relaxed max-w-md">
              {isCitizen
                ? "بوابتكم الرقمية للمساهمة في تحسين الخدمات العمومية وتتبع انشغالاتكم."
                : "لوحة التحكم لإدارة البلاغات والطلبات الواردة."}
            </p>
          </div>
          {isCitizen && (
            <Link
              href="/dashboard/report"
              className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-lg"
            >
              <FilePlus size={20} />
              تقديم بلاغ جديد
            </Link>
          )}
          <button
            onClick={refresh}
            className="flex items-center gap-2 text-primary-100 hover:text-white transition-colors text-sm font-semibold"
          >
            <RefreshCw size={16} />
            تحديث
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={isStaff ? "إجمالي الوارد" : "بلاغاتي"}
          value={total}
          icon={<ListChecks size={24} />}
          color="text-foreground"
          bg="bg-surface"
        />
        <StatCard
          label="قيد المعالجة"
          value={pending}
          icon={<Clock size={24} />}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
        <StatCard
          label="تم الحل"
          value={resolved}
          icon={<CheckCircle2 size={24} />}
          color="text-primary"
          bg="bg-primary-50"
        />
      </div>

      {/* Citizen Services */}
      {isCitizen && (
        <div>
          <h2 className="text-lg font-black mb-4">الخدمات الأكثر طلباً</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CITIZEN_SERVICES.map((s) => (
              <Link
                key={s.id}
                href="/dashboard/report"
                className="flex items-center gap-4 bg-surface p-5 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <p className="font-bold text-sm group-hover:text-primary transition-colors">
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Complaints */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-black text-base">
            {isCitizen ? "آخر تحديثات بلاغاتي" : "قائمة المهام القائمة"}
          </h2>
          <Link
            href={isCitizen ? "/dashboard/tracking" : "/dashboard/admin"}
            className="text-primary text-sm font-bold hover:underline"
          >
            عرض الكل
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <AlertCircle size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-semibold">لا توجد بيانات ليتم عرضها حالياً.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {complaints.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/complaint/${c.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-background/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.assigned_dept} • {formatDate(c.created_at)}
                  </p>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border mr-4 whitespace-nowrap",
                    getStatusColor(c.status)
                  )}
                >
                  {getStatusLabel(c.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border p-5 flex items-center gap-4", bg)}>
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", bg === "bg-surface" ? "bg-background" : "bg-surface")}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-semibold">{label}</p>
        <p className={cn("text-2xl font-black", color)}>{value}</p>
      </div>
    </div>
  );
}
