"use client";

import { useAuth } from "@/lib/auth-context";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { getAdminComplaints, getMyComplaints, getComplaintMessages, sendMessage, updateComplaintStatus, getUserById } from "@/lib/api";
import { Complaint, Message, ComplaintStatus, AuthUser } from "@/types";
import { cn, formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  Send,
  User,
  MapPin,
  Calendar,
  Building2,
  MessageSquare,
  ShieldCheck,
  History,
  FileText,
  Loader2
} from "lucide-react";

const STATUS_FLOW: { value: ComplaintStatus; label: string; desc: string }[] = [
  { value: "submitted", label: "تم الاستلام", desc: "تم تسجيل البلاغ في منصة بادر بنجاح" },
  { value: "under_review", label: "قيد المراجعة", desc: "البلاغ حالياً قيد الدراسة من قبل المصالح المختصة" },
  { value: "in_progress", label: "جاري التنفيذ", desc: "بدأت أشغال المعالجة الميدانية للبلاغ" },
  { value: "resolved", label: "تم الحل", desc: "تمت معالجة البلاغ وإغلاق الملف بنجاح" },
];

export default function ComplaintDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  
  const [reporter, setReporter] = useState<AuthUser | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadComplaint = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const all =
        user.role === "admin" || user.role === "department"
          ? await getAdminComplaints()
          : await getMyComplaints(user.id);
      const found = all.find((c) => c.id === complaintId) || null;
      setComplaint(found);
      if (found) {
        const msgs = await getComplaintMessages(found.id);
        setMessages(msgs);

        // Fetch reporter info if admin/dept
        if ((user.role === "admin" || user.role === "department") && found.reporter_id) {
          const reporterInfo = await getUserById(String(found.reporter_id));
          setReporter(reporterInfo);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user, complaintId]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  const handleSendMessage = async () => {
    if (!newMsg.trim() || !complaint || !user) return;
    const text = newMsg.trim();
    setNewMsg("");
    setSendingMsg(true);
    
    // Optimistic update
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      text,
      sender_role: user.role,
      sender_name: user.full_name,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    
    try {
      await sendMessage(complaint.id, text, user);
    } catch {
      // Revert if failed
      setMessages((prev) => prev.filter(m => m.id !== optimistic.id));
    } finally {
      setSendingMsg(false);
    }
  };

  const handleStatusUpdate = async (newStatus: ComplaintStatus) => {
    if (!complaint || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await updateComplaintStatus(complaint.id, newStatus);
      // Update local state
      setComplaint(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openInMaps = () => {
    if (!complaint?.lat || !complaint?.lng) {
      // Fallback if no coords, use location text
      const query = encodeURIComponent(complaint?.location_text || "الجزائر");
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
      return;
    }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${complaint.lat},${complaint.lng}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">جارٍ جلب تفاصيل البلاغ...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
           <FileText size={32} />
        </div>
        <h2 className="text-xl font-black mb-2">تعذر العثور على البلاغ</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
          يبدو أن البلاغ الذي تبحث عنه غير موجود أو لا تملك صلاحية الوصول إليه.
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
        >
          <ArrowRight size={18} />
          العودة للقائمة
        </button>
      </div>
    );
  }

  const currentStepIdx = STATUS_FLOW.findIndex((s) => s.value === complaint.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with quick info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold w-fit"
        >
          <ArrowRight size={20} />
          العودة للتتبع
        </button>
        <div className="flex items-center gap-2">
           <span className="text-xs text-muted-foreground font-mono bg-background border border-border px-3 py-1 rounded-full">
            REF: {complaint.id}
           </span>
           <span className={cn("px-4 py-1.5 rounded-full text-xs font-black border shadow-sm", getStatusColor(complaint.status))}>
            {getStatusLabel(complaint.status)}
           </span>
           {(user?.role === "admin" || user?.role === "department") && (
             <button
               onClick={openInMaps}
               className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black hover:bg-slate-800 transition-all shadow-md group"
             >
               <MapPin size={12} className="text-primary group-hover:scale-125 transition-transform" />
               فتح الخرائط (GPS)
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
            <h1 className="text-2xl font-black mb-4">{complaint.title}</h1>
            <p className="text-foreground/80 leading-relaxed mb-8 text-base">
              {complaint.description}
            </p>

            {/* Attachments Section */}
            {complaint.media_urls && complaint.media_urls.length > 0 && (
              <div className="mb-8 space-y-4">
                <h3 className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-wider">
                  <FileText size={16} />
                  الصور والمرفقات ({complaint.media_urls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.media_urls.map((url, idx) => (
                     <div 
                       key={idx} 
                       className="aspect-video relative rounded-2xl overflow-hidden border border-border group cursor-zoom-in shadow-sm hover:shadow-md transition-all"
                       onClick={() => window.open(url, '_blank')}
                     >
                        <img 
                          src={url} 
                          alt={`Attachment ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white text-[10px] font-black uppercase">عرض الصورة</span>
                        </div>
                     </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-background rounded-xl border border-border/50">
              <InfoItem icon={Calendar} label="تاريخ التقديم" value={formatDate(complaint.created_at)} />
              <InfoItem icon={Building2} label="المصلحة" value={complaint.assigned_dept || "قيد التوجيه"} />
              <InfoItem icon={MapPin} label="الموقع" value={complaint.location_text || complaint.municipality || "الجزائر العاصمة"} />
              <InfoItem icon={ShieldCheck} label="الدرجة" value={complaint.category || "عام"} />
            </div>

            {/* Admin Controls */}
            {(user?.role === "admin" || user?.role === "department") && (
              <div className="mt-8 pt-6 border-t border-border/50">
                <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  إجراءات المصلحة الإدارية
                </h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.map((s) => (
                    <button
                      key={s.value}
                      disabled={updatingStatus || complaint.status === s.value}
                      onClick={() => handleStatusUpdate(s.value)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black transition-all border shadow-sm flex items-center gap-2",
                        complaint.status === s.value
                          ? "bg-primary/10 border-primary text-primary opacity-50 cursor-default"
                          : "bg-surface border-border hover:border-primary/50 text-foreground active:scale-95"
                      )}
                    >
                      {updatingStatus && complaint.status !== s.value && <Loader2 size={10} className="animate-spin" />}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
            <h2 className="font-black text-lg mb-8 flex items-center gap-2">
              <History size={20} className="text-primary" />
              سجل التحديثات
            </h2>
            
            <div className="space-y-0">
              {STATUS_FLOW.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isLast = idx === STATUS_FLOW.length - 1;

                return (
                  <div key={step.value} className="relative flex gap-6 pb-8 group last:pb-0">
                    {!isLast && (
                       <div className={cn(
                        "absolute top-6 bottom-0 right-[15px] w-0.5 transition-colors duration-500",
                        idx < currentStepIdx ? "bg-primary" : "bg-border"
                       )} />
                    )}
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-500",
                      isCompleted ? "bg-primary border-primary text-white scale-110" : "bg-surface border-border text-muted-foreground",
                      isCurrent && "ring-4 ring-primary/10 shadow-lg shadow-primary/20"
                    )}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <div className="pt-0.5">
                      <p className={cn("text-base font-black transition-colors", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {step.desc}
                      </p>
                      {isCurrent && (
                        <span className="inline-block mt-3 bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/10">
                          قيد المعالجة حالياً
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reporter Profile (Admin Only) */}
          {(user?.role === "admin" || user?.role === "department") && reporter && (
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm border-r-4 border-r-primary">
              <h2 className="font-black text-sm mb-4 flex items-center gap-2">
                <User size={18} className="text-primary" />
                معلومات المواطن المبلغ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">الاسم الكامل</p>
                  <p className="text-sm font-black">{reporter.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">رقم الهاتف</p>
                  <p className="text-sm font-black" dir="ltr">{reporter.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">البريد الإلكتروني</p>
                  <p className="text-sm font-black">{reporter.email || "غير متوفر"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chat Interface */}
        <div className="bg-surface rounded-2xl border border-border flex flex-col shadow-sm h-[600px] sticky top-24">
          <div className="p-6 border-b border-border bg-background/50 rounded-t-2xl">
            <h2 className="font-black text-base flex items-center gap-2 text-primary">
              <MessageSquare size={18} />
              مركز التواصل
            </h2>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">تواصل مباشر مع المصالح المعنية</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-dots-grid">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary/20 mb-3 border border-border">
                  <MessageSquare size={24} />
                </div>
                <p className="text-xs font-bold text-muted-foreground">لا توجد رسائل سابقة في هذا البلاغ</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = (user?.role === "citizen" && msg.sender_role === "citizen") || 
                             (user?.role !== "citizen" && msg.sender_role !== "citizen");
                
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-1 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                      isMe ? "self-start" : "self-end items-end"
                    )}
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-black text-muted-foreground">
                        {isMe ? "أنت" : msg.sender_name}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "p-4 rounded-2xl text-sm shadow-sm",
                        isMe
                          ? "bg-primary text-white rounded-tr-none"
                          : "bg-surface border border-border rounded-tl-none"
                      )}
                    >
                      <p className="leading-relaxed font-medium">{msg.text}</p>
                      <p className={cn("text-[9px] mt-2 block opacity-60 text-right font-mono")}>
                        {formatDate(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-border bg-background/30">
            <div className="relative group">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="اكتب استفسارك هنا..."
                className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-surface text-foreground font-bold text-xs focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-muted-foreground/50 shadow-inner"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMsg.trim() || sendingMsg}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 shadow-md shadow-primary/20 active:scale-95"
              >
                {sendingMsg ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="rotate-180" />}
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground text-center mt-3 font-medium opacity-50">
              سيتم الرد عليك في أقرب وقت ممكن
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon size={12} className="text-primary/60" />
        <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-[11px] font-bold text-foreground truncate">{value}</p>
    </div>
  );
}
