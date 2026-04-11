"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FilePlus,
  ListChecks,
  MapPin,
  Bell,
  Shield,
  BarChart3,
  Building2,
  FileText,
  LogOut,
  Menu,
  X,
  Zap,
  User,
  Settings
} from "lucide-react";
import { useState } from "react";

const citizenLinks = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/report", label: "تقديم بلاغ", icon: FilePlus },
  { href: "/dashboard/tracking", label: "بلاغاتي", icon: ListChecks },
  { href: "/dashboard/map", label: "الخريطة", icon: MapPin },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
];

const adminLinks = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/admin", label: "الطلبات الواردة", icon: Shield },
  { href: "/dashboard/admin/hierarchy", label: "هيكل الولاية", icon: Zap },
  { href: "/dashboard/stats", label: "الإحصائيات", icon: BarChart3 },
  { href: "/dashboard/departments", label: "المصالح", icon: Building2 },
  { href: "/dashboard/reports", label: "التقرير والإحصاء", icon: FileText },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
];

const deptLinks = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/admin", label: "الطلبات الواردة", icon: Shield },
  { href: "/dashboard/reports", label: "التقرير والإحصاء", icon: FileText },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
];

const municipalityLinks = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/admin", label: "الطلبات الواردة", icon: Shield },
  { href: "/dashboard/municipality", label: "إدارة البلدية", icon: Building2 },
  { href: "/dashboard/reports", label: "التقرير والإحصاء", icon: FileText },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
];

const bottomLinks = [
  { href: "/dashboard/profile", label: "حسابي", icon: User },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStaff = user?.role === "admin" || user?.role === "department";
  const isAdmin = user?.role === "admin";
  const isManager = user?.is_manager;

  const links = isAdmin
    ? adminLinks
    : isManager
    ? municipalityLinks
    : isStaff
    ? deptLinks
    : citizenLinks;

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <img src="/logo.png" alt="بادر" className="w-12 h-12 object-contain" />
          <div className="leading-tight">
            <h1 className="text-[1.3rem] font-black text-primary tracking-tight">بادر</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">المنصة الوطنية</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-border bg-primary-50/50">
        <p className="text-sm font-bold text-foreground truncate">{user?.full_name}</p>
        <p className="text-xs text-muted-foreground">
          {user?.role === "admin" ? "الإدارة العليا" : user?.role === "department" ? user.organization : "مواطن"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">القائمة الرئيسية</p>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-border">
          <p className="px-3 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">عام</p>
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                )}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-xl shadow-lg border border-border text-primary"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-72 bg-surface border-l border-border z-40 flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
