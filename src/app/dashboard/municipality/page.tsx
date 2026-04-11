"use client";

import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { STANDARD_SECTORS } from "@/lib/administrative-data";
import { 
  Building2, 
  PlusCircle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck,
  LayoutGrid,
  History,
  X,
  AtSign,
  Key,
  Copy,
  Droplets,
  Zap,
  Trash2,
  Stethoscope,
  BookOpen,
  Home,
  Leaf,
  ShoppingBag,
  Shield,
  LifeBuoy,
  Truck,
  Heart,
  Gamepad2,
  Lightbulb,
  Settings2,
  Edit3,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping for professional look
const sectorIcons: Record<string, any> = {
  water: Droplets,
  energy: Zap,
  sanitation: Trash2,
  roads: Truck,
  health: Stethoscope,
  education: BookOpen,
  housing: Home,
  environment: Leaf,
  trade: ShoppingBag,
  security: Shield,
  civil_protection: LifeBuoy,
  transport: Truck,
  social: Heart,
  youth: Gamepad2,
  lighting: Lightbulb
};

export default function MunicipalityManagerPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [fetching, setFetching] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<Record<string, any>>({});
  const [initLoading, setInitLoading] = useState(true);
  
  // Modals state
  const [managerResult, setManagerResult] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", password: "", full_name: "", organization: "" });
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSectForm, setNewSectForm] = useState({ name: "", sector: "" });

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

  const handleCreateDept = async (sectorName: string, customName?: string) => {
    if (!user) return;
    const key = customName || sectorName;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const res = await fetch("/api/admin/department/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baladiyaName: user.baladiya,
          dairaName: user.daira,
          sectorName: key
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        await fetchLocalStats();
        setManagerResult({
          username: data.manager.username,
          password: data.manager.password,
          sector: key,
          full_name: `مصلحة ${key} - ${user.baladiya?.replace("بلدية", "")}`
        });
        setShowAddModal(false);
      } else {
        alert("فشل التفعيل: " + data.message);
      }
    } catch {
      alert("خطأ في الاتصال");
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
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
      // 1. Update Credentials (username/password)
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
      
      // 2. Update Metadata if id exists (name/organization)
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

  if (!user?.is_manager) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldCheck size={48} className="text-red-400 mb-4" />
        <h1 className="text-xl font-black">عذراً، لا تم�  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-primary mb-4">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Building2 size={24} />
              </div>
              <span className="font-black tracking-widest text-sm uppercase">مركز إدارة البلدية</span>
            </div>
            <h1 className="text-4xl font-black mb-2">إدارة مصالح بلدية {user.baladiya?.replace("بلدية", "")}</h1>
            <p className="text-slate-400 text-sm max-w-xl font-medium leading-relaxed">
              مرحباً بك سيادة المدير. تحكم بالكامل في المصالح، أضف قطاعات جديدة، أو عدل مسميات المصالح الحالية.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary-600 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
            إضافة مصلحة مخصصة
          </button>
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
            <h4 className="text-xl font-black">{Object.keys(stats).length} مصلحة</h4>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">المصالح النشطة</p>
            <h4 className="text-xl font-black">{Object.keys(stats).length}</h4>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center">
            <History size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">تحديث القائمة</p>
            <button onClick={fetchLocalStats} className="text-xs font-black text-amber-600 hover:underline">تحديث الآن</button>
          </div>
        </div>
      </div>

      {/* Sectors Grid */}
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
                   {isEnabled ? (
                     <>
                        <button 
                          onClick={() => handleDeleteDept(dept.id, sector.name)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                        <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-full">
                          <CheckCircle2 size={18} />
                        </span>
                     </>
                   ) : (
                     <span className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
                   )}
                </div>
              </div>
              
              <h3 className="font-black text-slate-800 text-lg mb-1">{isEnabled ? dept.organization : sector.name}</h3>
              <p className="text-[10px] text-muted-foreground font-bold mb-6">
                {isEnabled ? dept.full_name : `إدارة بلاغات ${sector.name.toLowerCase()} في النطاق الجغرافي للبلدية`}
              </p>

              {!isEnabled && (
                <button
                  onClick={() => handleCreateDept(sector.name)}
                  disabled={isActing}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white h-12 rounded-2xl font-black text-xs hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                >
                  {isActing ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  تفعيل الحساب الآن
                </button>
              )}

              {isEnabled && (
                <div className="space-y-2">
                  <button
                    disabled={fetching[sector.name]}
                    onClick={() => handleFetchManager(sector.name)}
                    className="w-full h-11 bg-slate-50 border border-border rounded-xl text-[11px] font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-slate-700"
                  >
                    {fetching[sector.name] ? <Loader2 size={14} className="animate-spin" /> : <Settings2 size={14} />}
                    {fetching[sector.name] ? "جاري الجلب..." : "إدارة الحساب والمصلحة"}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Display Custom Sectors that are NOT in STANDARD_SECTORS */}
        {Object.values(stats).filter((d: any) => !STANDARD_SECTORS.some(s => s.name === d.organization)).map((dept: any) => (
           <div key={dept.id} className="bg-surface rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all group relative border-amber-500/20">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 text-amber-600">
                  <Building2 size={28} />
                </div>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDeleteDept(dept.id, dept.organization)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <span className="bg-amber-100 text-amber-600 p-1.5 rounded-full">
                      <CheckCircle2 size={18} />
                    </span>
                </div>
              </div>
              
              <h3 className="font-black text-slate-800 text-lg mb-1">{dept.organization}</h3>
              <p className="text-[10px] text-muted-foreground font-bold mb-6">{dept.full_name}</p>

              <button
                disabled={fetching[dept.organization]}
                onClick={() => handleFetchManager(dept.organization)}
                className="w-full h-11 bg-amber-50/50 border border-amber-100 rounded-xl text-[11px] font-black hover:bg-amber-100 transition-all flex items-center justify-center gap-2 text-amber-700"
              >
                {fetching[dept.organization] ? <Loader2 size={14} className="animate-spin" /> : <Settings2 size={14} />}
                إدارة المصلحة
              </button>
           </div>
        ))}
      </div>

      {/* Add Custom Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95">
              <div className="bg-slate-900 p-8 text-white">
                 <button onClick={() => setShowAddModal(false)} className="absolute top-6 left-6 text-white/50 hover:text-white"><X size={24} /></button>
                 <PlusCircle size={48} className="mb-4 text-primary" />
                 <h2 className="text-2xl font-black italic">إضافة مصلحة بلدية جديدة</h2>
                 <p className="text-slate-400 text-xs font-bold mt-1">يمكنك إضافة أي قطاع أو مصلحة فرعية غير موجودة في القائمة.</p>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">اسم المصلحة (مثال: الإنارة أو الصيانة)</label>
                    <input 
                      value={newSectForm.name}
                      onChange={e => setNewSectForm(p => ({...p, name: e.target.value}))}
                      className="w-full h-14 bg-slate-50 border border-border px-4 rounded-2xl font-black text-slate-800"
                    />
                 </div>
                 <button 
                  disabled={!newSectForm.name || loading[newSectForm.name]}
                  onClick={() => handleCreateDept(newSectForm.name, newSectForm.name)}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2"
                 >
                   {loading[newSectForm.name] ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
                   تأكيد الإضافة والتفعيل
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Credentials Management Modal */}
      {managerResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setManagerResult(null)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={cn(
               "p-8 text-white relative overflow-hidden transition-colors duration-500",
               editMode ? "bg-amber-600" : "bg-emerald-600"
            )}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
               <button onClick={() => setManagerResult(null)} className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors">
                 <X size={24} />
               </button>
               {editMode ? <Edit3 size={48} className="mb-4 text-white/90" /> : <CheckCircle2 size={48} className="mb-4 text-white/90" />}
               <h2 className="text-2xl font-black italic">{editMode ? "تحديث بيانات المصلحة" : "إدارة مصلحة مفعلة"}</h2>
               <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-widest">{managerResult.sector}</p>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group relative col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">اسم المستخدم</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-border p-3.5 rounded-2xl group-hover:border-primary transition-all">
                       <AtSign size={16} className="text-slate-400" />
                       {editMode ? (
                          <input 
                            value={editForm.username}
                            onChange={e => setEditForm(p => ({...p, username: e.target.value}))}
                            className="bg-transparent border-none outline-none font-black text-slate-800 tracking-wider flex-1 text-xs"
                            dir="ltr"
                          />
                       ) : (
                          <span className="font-black text-slate-800 tracking-wider flex-1 text-xs" dir="ltr">{managerResult.username}</span>
                       )}
                    </div>
                  </div>

                  <div className="group relative col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">كلمة المرور</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-border p-3.5 rounded-2xl group-hover:border-primary transition-all">
                       <Key size={16} className="text-slate-400" />
                       {editMode ? (
                          <input 
                            value={editForm.password}
                            onChange={e => setEditForm(p => ({...p, password: e.target.value}))}
                            className="bg-transparent border-none outline-none font-black text-slate-800 tracking-wider flex-1 text-xs"
                            dir="ltr"
                          />
                       ) : (
                          <span className="font-black text-slate-800 tracking-wider flex-1 text-xs" dir="ltr">{managerResult.password}</span>
                       )}
                    </div>
                  </div>

                  {editMode && (
                    <>
                      <div className="group relative col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">اسم المصلحة الكامل</label>
                        <div className="flex items-center gap-3 bg-slate-50 border border-border p-3.5 rounded-2xl group-hover:border-primary transition-all">
                           <FileText size={16} className="text-slate-400" />
                            <input 
                              value={editForm.full_name}
                              onChange={e => setEditForm(p => ({...p, full_name: e.target.value}))}
                              className="bg-transparent border-none outline-none font-black text-slate-800 text-xs flex-1"
                            />
                        </div>
                      </div>
                      <div className="group relative col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">قطاع العمل (النوع)</label>
                        <div className="flex items-center gap-3 bg-slate-50 border border-border p-3.5 rounded-2xl group-hover:border-primary transition-all">
                           <Zap size={16} className="text-slate-400" />
                            <input 
                              value={editForm.organization}
                              onChange={e => setEditForm(p => ({...p, organization: e.target.value}))}
                              className="bg-transparent border-none outline-none font-black text-slate-800 text-xs flex-1"
                            />
                        </div>
                      </div>
                    </>
                  )}
               </div>

               <div className="flex flex-col gap-3">
                  {editMode ? (
                    <button 
                      onClick={handleUpdateCreds}
                      disabled={saving}
                      className="w-full h-14 bg-amber-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                    >
                      {saving ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                      حفظ التغييرات الجديدة
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditForm({ 
                          username: managerResult.username, 
                          password: managerResult.password,
                          full_name: managerResult.full_name || stats[managerResult.sector]?.full_name || "",
                          organization: managerResult.sector || ""
                        });
                        setEditMode(true);
                      }}
                      className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg shadow-slate-200"
                    >
                      تعديل بيانات الدخول والمصلحة
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { if(editMode) setEditMode(false); else setManagerResult(null); }}
                    className="w-full h-12 text-slate-400 font-bold hover:text-slate-600 transition-all text-xs"
                  >
                    {editMode ? "تراجع عن التعديل" : "إغلاق النافذة"}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
                >
                      تغيير معلومات الدخول
                    </button>
                  )}
                  
                  {editMode && (
                    <button 
                      onClick={() => setEditMode(false)}
                      className="w-full h-10 text-slate-400 font-bold hover:text-slate-600 transition-all"
                    >
                      تراجع
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
