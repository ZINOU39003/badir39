"use client";

import { useState, useEffect } from "react";
import { WILAYA_STRUCTURE, STANDARD_SECTORS } from "@/lib/administrative-data";
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  CheckCircle2, 
  Loader2, 
  Search, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HierarchyPage() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<Record<string, number>>({});

  // Fetch real stats from the database
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats/hierarchy");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch hierarchy stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBulkGenerate = async (baladiyaName: string, dairaName: string) => {
    setLoading(prev => ({ ...prev, [baladiyaName]: true }));
    try {
      const res = await fetch("/api/admin/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baladiyaName, dairaName }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        // Refresh stats after generation
        fetchStats();
      } else {
        alert("فشل في التوليد: " + data.message);
      }
    } catch {
      alert("خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(prev => ({ ...prev, [baladiyaName]: false }));
    }
  };

  const filteredWilaya = WILAYA_STRUCTURE.filter(d => 
    d.name.includes(search) || d.municipalities.some(m => m.name.includes(search))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Zap size={14} />
            التأسيس الإداري الذكي
          </div>
          <h1 className="text-4xl font-black">إدارة هيكل الولاية</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl font-medium leading-relaxed">
            تحكم في كافة المصالح الحكومية عبر الدوائر والبلديات. يمكنك توليد الحسابات الإدارية آلياً بضغطة زر واحدة لكل بلدية.
          </p>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm space-y-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن دائرة أو بلدية..."
            className="w-full h-14 pr-14 pl-4 rounded-2xl border border-border bg-background text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
          />
          <Search size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredWilaya.map((d) => (
            <div key={d.id} className="border border-border rounded-2xl overflow-hidden transition-all">
              <button 
                onClick={() => toggleExpand(d.id)}
                className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-border text-slate-400 shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">{d.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold">{d.municipalities.length} بلديات تابعة</p>
                  </div>
                </div>
                {expanded[d.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>

              {expanded[d.id] && (
                <div className="bg-white divide-y divide-border/50 animate-in slide-in-from-top-2 duration-300">
                  {d.municipalities.map((m) => {
                    const count = stats[m.name] || 0;
                    const isComplete = count >= 15;
                    const isGenerating = loading[m.name];

                    return (
                      <div key={m.id} className="flex items-center justify-between p-5 hover:bg-slate-50/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-2 h-10 rounded-full",
                            isComplete ? "bg-emerald-500" : "bg-slate-200"
                          )} />
                          <div>
                            <p className="font-bold text-sm text-slate-700">{m.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                               {isComplete ? (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 size={12} />
                                    مكتمل (15/15 مصلحة)
                                  </span>
                               ) : (
                                  <span className="text-[10px] font-bold text-muted-foreground">
                                    {count}/15 مصلحة مفعلة
                                  </span>
                               )}
                            </div>
                          </div>
                        </div>

                        {!isComplete && (
                          <button
                            onClick={() => handleBulkGenerate(m.name, d.name)}
                            disabled={isGenerating}
                            className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                            {isGenerating ? "جاري التوليد..." : "تفعيل كافة المصالح"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl border border-emerald-200 flex items-center justify-center text-emerald-500 shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h4 className="font-black text-emerald-900 text-sm mb-1">معلومات عن التوليد الآلي</h4>
          <p className="text-xs text-emerald-700 leading-relaxed font-medium">
            عند "تفعيل كافة المصالح"، سيتم تلقائياً إنشاء 15 حساباً إدارياً لمصلحة (الماء، الكهرباء، النظافة، إلخ) لهذه البلدية. 
            أسماء المستخدمين ستكون احترافية بنمط منظّم، وكلمة المرور الافتراضية ستكون <span className="font-black">bader123</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
