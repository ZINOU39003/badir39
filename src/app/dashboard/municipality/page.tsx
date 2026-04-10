"use client";

import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { STANDARD_SECTORS } from "@/lib/administrative-data";
import { 
  Building2, 
  PlusCircle, 
  Users, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck,
  LayoutGrid,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MunicipalityManagerPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<Record<string, boolean>>({});
  const [initLoading, setInitLoading] = useState(true);

  // Check which depts are already created
  const fetchLocalStats = async () => {
    if (!user?.baladiya) return;
    try {
      const res = await fetch("/api/admin/stats/hierarchy");
      const data = await res.json();
      if (data.success) {
        // Here we'd ideally have a more detailed stats API
        // For now, let's assume if count is 1, only manager exists.
        // We'll mock the specific depts for now or fetch depts list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalStats();
  }, [user]);

  const handleCreateDept = async (sectorName: string) => {
    if (!user) return;
    setLoading(prev => ({ ...prev, [sectorName]: true }));
    
    try {
      const res = await fetch("/api/admin/department/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baladiyaName: user.baladiya,
          dairaName: user.daira,
          sectorName: sectorName
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setStats(prev => ({ ...prev, [sectorName]: true }));
        alert(`تم تفعيل حساب ${sectorName} بنجاح!`);
      } else {
        alert("فشل التفعيل: " + data.message);
      }
    } catch {
      alert("خطأ في الاتصال");
    } finally {
      setLoading(prev => ({ ...prev, [sectorName]: false }));
    }
  };

  if (!user?.is_manager) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldCheck size={48} className="text-red-400 mb-4" />
        <h1 className="text-xl font-black">عذراً، لا تمتلك صلاحية دخول هذه الصفحة</h1>
        <p className="text-muted-foreground text-sm mt-2">هذه الصفحة مخصصة لمدراء البلديات فقط.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-primary mb-4">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Building2 size={24} />
            </div>
            <span className="font-black tracking-widest text-sm uppercase">مركز إدارة البلدية</span>
          </div>
          <h1 className="text-4xl font-black mb-2">إدارة مصالح بلدية {user.baladiya?.replace("بلدية", "")}</h1>
          <p className="text-slate-400 text-sm max-w-xl font-medium leading-relaxed">
            مرحباً بك سيادة المدير. من هنا يمكنك تفعيل الحسابات الإدارية للمصالح الـ 15 التابعة لبلديتكم وتوزيع المهام عليهم.
          </p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">إجمالي المصالح</p>
            <h4 className="text-xl font-black">15 مصلحة</h4>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">المصالح المفعلة</p>
            <h4 className="text-xl font-black">قيد التحديث</h4>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center">
            <History size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">آخر نشاط</p>
            <h4 className="text-xl font-black">منذ دقائق</h4>
          </div>
        </div>
      </div>

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STANDARD_SECTORS.map((sector) => {
          const isEnabled = stats[sector.name];
          const isActing = loading[sector.name];

          return (
            <div key={sector.id} className="bg-surface rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-border text-2xl group-hover:scale-110 transition-transform">
                  {sector.logo}
                </div>
                {isEnabled ? (
                  <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-full">
                    <CheckCircle2 size={20} />
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 bg-slate-200 rounded-full animate-pulse" />
                )}
              </div>
              
              <h3 className="font-black text-slate-800 text-lg mb-1">{sector.name}</h3>
              <p className="text-[10px] text-muted-foreground font-bold mb-6">
                إدارة بلاغات {sector.name.toLowerCase()} في نطاق البلدية
              </p>

              {!isEnabled && (
                <button
                  onClick={() => handleCreateDept(sector.name)}
                  disabled={isActing}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white h-12 rounded-2xl font-black text-xs hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isActing ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  تفعيل الحساب الآن
                </button>
              )}

              {isEnabled && (
                <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-default">
                  تم التفعيل بنجاح
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
