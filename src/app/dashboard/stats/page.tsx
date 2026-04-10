"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminComplaints } from "@/lib/api";
import { Complaint } from "@/types";
import { BarChart3, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function StatsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

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

  const total = complaints.length;
  const submitted = complaints.filter((c) => c.status === "submitted").length;
  const underReview = complaints.filter((c) => c.status === "under_review").length;
  const inProgress = complaints.filter((c) => c.status === "in_progress").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const rejected = complaints.filter((c) => c.status === "rejected").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-8">الإحصائيات</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatBox label="إجمالي البلاغات" value={total} icon={<BarChart3 size={20} />} color="text-foreground" bg="bg-surface" />
            <StatBox label="تم الحل" value={resolved} icon={<CheckCircle2 size={20} />} color="text-green-600" bg="bg-green-50" />
            <StatBox label="قيد المعالجة" value={inProgress + underReview} icon={<Clock size={20} />} color="text-yellow-600" bg="bg-yellow-50" />
            <StatBox label="مرفوضة" value={rejected} icon={<AlertCircle size={20} />} color="text-red-600" bg="bg-red-50" />
          </div>

          {/* Resolution Rate */}
          <div className="bg-surface rounded-2xl border border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-sm">معدل الإنجاز</h2>
              <span className="text-2xl font-black text-primary">{resolutionRate}%</span>
            </div>
            <div className="w-full h-3 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${resolutionRate}%` }}
              />
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="font-black text-sm mb-4">توزيع الحالات</h2>
            <div className="space-y-3">
              {[
                { label: "تم الاستلام", count: submitted, color: "bg-yellow-500" },
                { label: "قيد المراجعة", count: underReview, color: "bg-blue-500" },
                { label: "جاري التنفيذ", count: inProgress, color: "bg-orange-500" },
                { label: "تم الحل", count: resolved, color: "bg-green-500" },
                { label: "مرفوض", count: rejected, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm font-semibold">{item.label}</span>
                  <span className="text-sm font-black">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ label, value, icon, color, bg }: { label: string; value: number; icon: React.ReactNode; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl border border-border p-4 flex items-center gap-3`}>
      <div className={`${bg === "bg-surface" ? "bg-background" : "bg-surface"} w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-semibold">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}
