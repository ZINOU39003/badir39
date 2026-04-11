"use client";

import { useAuth } from "@/lib/auth-context";
import { Settings, Shield, Globe, Lock, Info, LogOut } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { logout, user } = useAuth();

  const settingsItems = [
    {
      icon: Shield,
      label: "الأمان وكلمة المرور",
      desc: "تغيير كلمة المرور وإعدادات الأمان",
      href: "/dashboard/profile",
    },
    {
      icon: Globe,
      label: "لغة التطبيق",
      desc: "العربية (افتراضي)",
      href: "/dashboard/profile",
    },
    {
      icon: Lock,
      label: "سياسة الخصوصية",
      desc: "كيفية معالجة بياناتكم",
      href: "/dashboard/profile",
    },
    {
      icon: Info,
      label: "حول المنصة",
      desc: "الإصدار 4.4 - منصة بادر الوطنية",
      href: "/dashboard/profile",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-8">الإعدادات</h1>

      <div className="space-y-3">
        {settingsItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 bg-surface p-5 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <item.icon size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}

        <button
          onClick={logout}
          className="flex items-center gap-4 w-full bg-surface p-5 rounded-xl border border-red-200 hover:border-red-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <LogOut size={20} className="text-red-600" />
          </div>
          <div className="flex-1 text-right">
            <p className="font-bold text-sm text-red-600">تسجيل الخروج</p>
            <p className="text-xs text-muted-foreground mt-0.5">خروج من حسابك الحالي</p>
          </div>
        </button>
      </div>
    </div>
  );
}
