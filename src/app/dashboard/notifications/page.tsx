"use client";

import { Bell, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "تم استلام بلاغك",
    desc: "تم استلام البلاغ RPT-1234 بنجاح وسيتم مراجعته قريباً",
    time: "منذ ساعة",
    type: "success",
  },
  {
    id: "2",
    title: "تحديث على البلاغ",
    desc: "تم تحويل البلاغ RPT-5678 إلى المصلحة التقنية المختصة",
    time: "منذ 3 ساعات",
    type: "info",
  },
  {
    id: "3",
    title: "تم حل البلاغ",
    desc: "تم حل البلاغ RPT-9012 بنجاح - شكراً لمساهمتك",
    time: "أمس",
    type: "success",
  },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const targetHref = user?.role === 'citizen' ? '/dashboard/tracking' : '/dashboard/admin';

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-black mb-8">الإشعارات</h1>

      {MOCK_NOTIFICATIONS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell size={48} className="mb-4 opacity-30" />
          <p className="text-sm font-semibold">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {MOCK_NOTIFICATIONS.map((n) => (
            <Link
              key={n.id}
              href={targetHref}
              className="flex items-start gap-4 bg-surface p-5 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                  n.type === "success"
                    ? "bg-green-50"
                    : n.type === "warning"
                    ? "bg-yellow-50"
                    : "bg-blue-50"
                }`}
              >
                {n.type === "success" ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : n.type === "warning" ? (
                  <AlertTriangle size={20} className="text-yellow-600" />
                ) : (
                  <Clock size={20} className="text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm group-hover:text-primary transition-colors">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {n.desc}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2 font-bold">{n.time}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
