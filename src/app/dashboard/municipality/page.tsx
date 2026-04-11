"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { 
  Building2, 
  CheckCircle2, 
  History, 
  LayoutGrid, 
  Loader2, 
  PlusCircle, 
  Settings2, 
  Trash2, 
  Edit3, 
  AtSign, 
  Key, 
  Zap, 
  X, 
  FileText, 
  RefreshCw,
  ShieldCheck,
  Plus,
  ShieldAlert,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

const STANDARD_SECTORS = [
  { id: "water", name: "الموارد المائية (ADE)" },
  { id: "energy", name: "الطاقة والكهرباء (Sonelgaz)" },
  { id: "waste", name: "التطهير والنظافة (ONA)" },
  { id: "roads", name: "الأشغال العمومية والطرق" },
  { id: "health", name: "الصحة والسكان" },
  { id: "education", name: "التربية والتعليم" },
  { id: "lighting", name: "الإنارة العمومية" },
  { id: "protection", name: "الحماية المدنية" },
];

const sectorIcons: Record<string, any> = {
  water: Building2,
  energy: Zap,
  waste: Trash2,
  roads: Building2,
  health: Building2,
  education: Building2,
  lighting: Lightbulb,
  protection: ShieldAlert,
};

export default function MunicipalityManagerPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [fetching, setFetching] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<Record<string, any>>({});
  const [initLoading, setInitLoading] = useState(true);
  
  const [managerResult, setManagerResult] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", password: "", full_name: "", organization: "" });
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSectForm, setNewSectForm] = useState({ name: "" });

  const fetchLocalStats = async () => {
    if (!user?.baladiya) return;
    try {
      const res = await fetch(`/api/admin/departments?baladiya=${encodeURIComponent(user.baladiya)}`);
      const data = await res.json();
      if (data.success) {
        const active: Record<string, any> = {};
        data.data.items.forEach((d: any) => {
          active[d.organization] = d;
        });
        setStats(active);
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
          dairaName: user.daira || "ولاية الوادي",
          sectorName: sectorName
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        await fetchLocalStats();
        setManagerResult({
          username: data.manager.username,
          password: data.manager.password,
          sector: sectorName,
          full_name: `مصلحة ${sectorName} - ${user.baladiya?.replace("بلدية", "")}`
        });
        setShowAddModal(false);
        setNewSectForm({ name: "" });
      } else {
        alert("فشل التفعيل: " + data.message);
      }
    } catch {
      alert("خطأ في الاتصال");
    } finally {
      setLoading(prev => ({ ...prev, [sectorName]: false }));
    }
  };

  const handleDeleteDept = async (id: string, sector: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${sector}؟ سيتم حذف حساب الدخول نهائياً.`)) return;
    
    try {
      const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStats(prev => {
          const next = { ...prev };
          delete next[sector];
          return next;
        });
      }
    } catch {
      alert("خطأ في الاتصال");
    }
  };

  const handleFetchManager = async (sectorName: string) => {
    setFetching(prev => ({ ...prev, [sectorName]: true }));
    try {
      const res = await fetch(`/api/admin/municipality-manager?baladiya=${encodeURIComponent(user?.baladiya || "")}&organization=${encodeURIComponent(sectorName)}`);
      const data = await res.json();
      if (data.success) {
        setManagerResult({ ...data.manager, sector: sectorName, id: stats[sectorName]?.id });
        setEditMode(false);
      } else {
        alert("فشل جلب البيانات: " + data.message);
      }
    } catch {
      alert("خطأ في الاتصال");
    } finally {
      setFetching(prev => ({ ...prev, [sectorName]: false }));
    }
  };

  const handleUpdateCreds = async () => {
    if (!managerResult) return;
    setSaving(true);
    try {
      const resCreds = await fetch("/api/admin/municipality-manager", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editForm.username,
          password: editForm.password,
          baladiya: user?.baladiya,
          organization: managerResult.sector
        }),
      });
      
      if (managerResult.id) {
         await fetch(`/api/admin/departments/${managerResult.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              full_name: editForm.full_name,
              organization: editForm.organization
            })
         });
      }

      const data = await resCreds.json();
      if (data.success) {
        alert("تم التحديث بنجاح");
        await fetchLocalStats();
        setManagerResult(null);
        setEditMode(false);
      } else {
        alert("فشل التحديث: " + data.message);
      }
    } catch {
      alert("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== "department" || !user.is_manager) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldCheck size={48} className="text-red-400 mb-4" />
        <h1 className="text-xl font-black">عذراً، لا تمتلك صلاحية دخول هذه الصفحة</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2">إدارة مصالح بلدية {user.baladiya?.replace("بلدية", "")}</h1>
            <p className="text-slate-400 text-sm max-w-xl">تحكم بالكامل في المصالح، أضف قطاعات مخصصة، أو عدل المسميات.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary-600 shadow-xl flex items-center gap-2"
          >
            <Plus size={20} />
            إضافة مصلحة مخصصة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STANDARD_SECTORS.map((sector) => {
          const dept = stats[sector.name];
          const isEnabled = !!dept;
          const isActing = loading[sector.name];
          const Icon = sectorIcons[sector.id] || Building2;

          return (
            <div key={sector.id} className="bg-surface rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-border text-primary group-hover:scale-110 transition-transform">
                  <Icon size={28} />
                </div>
                <div className="flex items-center gap-2">
                   {isEnabled && (
                        <button onClick={() => handleDeleteDept(dept.id, sector.name)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                   )}
                   {isEnabled ? <CheckCircle2 size={18} className="text-emerald-500" /> : <div className="w-2 h-2 bg-slate-200 rounded-full" />}
                </div>
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-1">{isEnabled ? dept.organization : sector.name}</h3>
              <p className="text-[10px] text-muted-foreground font-bold mb-6">{isEnabled ? dept.full_name : "مصلحة غير فعلة حالياً"}</p>
              {!isEnabled ? (
                <button onClick={() => handleCreateDept(sector.name)} disabled={isActing} className="w-full h-12 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all">
                  {isActing ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  تفعيل الآن
                </button>
              ) : (
                <button onClick={() => handleFetchManager(sector.name)} className="w-full h-11 bg-slate-50 border border-border rounded-xl text-[11px] font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                  <Settings2 size={14} />
                  إدارة المصلحة
                </button>
              )}
            </div>
          );
        })}

        {/* قطاعات مخصصة غير موجودة في القائمة الافتراضية */}
        {Object.keys(stats)
          .filter(orgName => !STANDARD_SECTORS.some(s => s.name === orgName))
          .map((orgName) => {
            const dept = stats[orgName];
            return (
              <div key={dept.id} className="bg-surface rounded-3xl border border-border p-6 shadow-sm hover:shadow-md border-primary/20 bg-primary/5 transition-all group relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-primary text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase">مصلحة مخصصة</div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-primary/20 text-primary shadow-sm hover:rotate-12 transition-transform">
                    <Building2 size={28} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDeleteDept(dept.id, orgName)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                </div>
                <h3 className="font-black text-slate-800 text-lg mb-1">{dept.organization}</h3>
                <p className="text-[10px] text-muted-foreground font-bold mb-6">{dept.full_name}</p>
                <button onClick={() => handleFetchManager(orgName)} className="w-full h-11 bg-white border border-primary/30 rounded-xl text-[11px] font-black hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm">
                  <Settings2 size={14} />
                  إدارة المصلحة
                </button>
              </div>
            );
          })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden">
              <div className="bg-slate-900 p-8 text-white">
                 <h2 className="text-2xl font-black">إضافة مصلحة جديدة</h2>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">اسم المصلحة</label>
                    <input value={newSectForm.name} onChange={e => setNewSectForm({ name: e.target.value })} placeholder="مثال: مصلحة الإنارة الريفية" className="w-full h-14 bg-slate-50 border border-border px-4 rounded-2xl font-black" />
                 </div>
                 <button disabled={!newSectForm.name} onClick={() => handleCreateDept(newSectForm.name)} className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2">
                   تأكيد الإضافة
                 </button>
              </div>
           </div>
        </div>
      )}

      {managerResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setManagerResult(null)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden">
            <div className={cn("p-8 text-white relative transition-colors", editMode ? "bg-amber-600" : "bg-emerald-600")}>
               <h2 className="text-2xl font-black italic">{editMode ? "تحديث مصلحة" : "إدارة مصلحة"}</h2>
               <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-widest">{managerResult.sector}</p>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">اسم المستخدم</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-border p-3.5 rounded-2xl">
                       {editMode ? <input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="bg-transparent font-black text-xs flex-1" dir="ltr" /> : <span className="font-black text-xs" dir="ltr">{managerResult.username}</span>}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">كلمة المرور</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-border p-3.5 rounded-2xl">
                       {editMode ? <input value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="bg-transparent font-black text-xs flex-1" dir="ltr" /> : <span className="font-black text-xs" dir="ltr">{managerResult.password}</span>}
                    </div>
                  </div>
                  {editMode && (
                    <>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">اسم المصلحة الكامل</label>
                        <input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="bg-slate-50 border border-border p-3.5 rounded-2xl font-black text-xs w-full" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">قطاع العمل (النوع)</label>
                        <input value={editForm.organization} onChange={e => setEditForm({...editForm, organization: e.target.value})} className="bg-slate-50 border border-border p-3.5 rounded-2xl font-black text-xs w-full" />
                      </div>
                    </>
                  )}
               </div>
               <div className="space-y-3">
                  {editMode ? (
                    <button onClick={handleUpdateCreds} disabled={saving} className="w-full h-14 bg-amber-600 text-white rounded-2xl font-black shadow-lg">حفظ التعديلات</button>
                  ) : (
                    <button onClick={() => { setEditForm({ username: managerResult.username, password: managerResult.password, full_name: managerResult.full_name || stats[managerResult.sector]?.full_name || "", organization: managerResult.sector }); setEditMode(true); }} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black shadow-lg">تعديل بيانات المصلحة</button>
                  )}
                  <button onClick={() => { if(editMode) setEditMode(false); else setManagerResult(null); }} className="w-full h-12 text-slate-400 font-bold text-xs">إغلاق</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
