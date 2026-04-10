"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminComplaints } from "@/lib/api";
import { Complaint } from "@/types";
import { MapPin, Search, Filter, List, ArrowLeft, Loader2, Navigation } from "lucide-react";
import { cn, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import Link from "next/link";

export default function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const filtered = complaints.filter(
    (c) =>
      c.title.includes(search) ||
      c.assigned_dept?.includes(search) ||
      c.id.includes(search)
  );

  const selectedItem = complaints.find((c) => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      {/* Sidebar List */}
      <div className="w-full lg:w-96 flex flex-col gap-4 order-2 lg:order-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">الخريطة التفاعلية</h1>
          <button onClick={refresh} className="text-primary hover:rotate-180 transition-transform duration-500">
            <Loader2 size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في البلاغات..."
            className="w-full h-11 pr-4 pl-10 rounded-xl border border-border bg-surface text-sm font-semibold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-primary/40" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <MapPin size={32} className="mx-auto mb-2" />
              <p className="text-xs font-bold">لا توجد بلاغات متوفرة</p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full text-right p-4 rounded-xl border transition-all hover:bg-surface",
                  selectedId === c.id
                    ? "bg-surface border-primary shadow-md ring-2 ring-primary/5"
                    : "bg-background border-border"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{c.assigned_dept}</p>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black border uppercase", getStatusColor(c.status))}>
                    {getStatusLabel(c.status)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Map View Area */}
      <div className="flex-1 bg-surface rounded-2xl border border-border relative overflow-hidden order-1 lg:order-2 shadow-sm">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-[#f8f9fa] opacity-80" style={{ 
          backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        {/* Mock Map Features */}
        <div className="relative w-full h-full flex items-center justify-center">
           {/* Simulated City Grid */}
           <div className="w-full h-full p-20 opacity-20 pointer-events-none">
              <div className="w-full h-full border-4 border-dashed border-slate-300 rounded-full flex items-center justify-center">
                <div className="w-1/2 h-1/2 border-4 border-dashed border-slate-300 rounded-full" />
              </div>
           </div>

           {/* Complaint Pins */}
           {filtered.map((c, i) => (
             <button
               key={c.id}
               onClick={() => setSelectedId(c.id)}
               className={cn(
                 "absolute transition-all duration-300 transform hover:scale-125 z-10",
                 selectedId === c.id ? "scale-150 z-20" : ""
               )}
               style={{
                 top: `${20 + (i * 13) % 60}%`,
                 left: `${20 + (i * 17) % 60}%`
               }}
             >
               <div className={cn(
                 "w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white",
                 selectedId === c.id ? "bg-primary text-white" : "bg-white text-primary"
               )}>
                 <MapPin size={16} />
               </div>
               {selectedId === c.id && (
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-xl">
                   {c.title.slice(0, 20)}...
                 </div>
               )}
             </button>
           ))}

           {/* Info Overlay */}
           {selectedItem && (
             <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:w-80 bg-surface border border-border rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-30">
               <div className="flex items-start justify-between mb-3">
                 <h2 className="font-black text-sm">{selectedItem.title}</h2>
                 <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground">
                   <ArrowLeft size={16} className="rotate-180" />
                 </button>
               </div>
               <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                 {selectedItem.description}
               </p>
               <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="bg-background rounded-lg p-2 border border-border">
                   <p className="text-[10px] text-muted-foreground mb-0.5">المصلحة</p>
                   <p className="text-[11px] font-bold truncate">{selectedItem.assigned_dept}</p>
                 </div>
                 <div className="bg-background rounded-lg p-2 border border-border">
                   <p className="text-[10px] text-muted-foreground mb-0.5">التاريخ</p>
                   <p className="text-[11px] font-bold truncate">{formatDate(selectedItem.created_at)}</p>
                 </div>
               </div>
               <Link
                href={`/dashboard/complaint/${selectedItem.id}`}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-black text-xs hover:bg-primary-600 transition-all shadow-md shadow-primary/20"
               >
                 عرض التفاصيل والدردشة
               </Link>
             </div>
           )}

           {/* Map Controls */}
           <div className="absolute top-6 left-6 flex flex-col gap-2">
              <button className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center shadow-md text-slate-700 hover:text-primary transition-colors">
                <Navigation size={18} />
              </button>
              <button className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center shadow-md text-slate-700 font-bold text-lg hover:text-primary transition-colors">
                +
              </button>
              <button className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center shadow-md text-slate-700 font-bold text-lg hover:text-primary transition-colors">
                -
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
