"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createComplaint, getDepartments } from "@/lib/api";
import { 
  AlertCircle, 
  Lightbulb, 
  MapPin, 
  Camera, 
  Upload, 
  Loader2, 
  Building2, 
  Droplets, 
  Zap, 
  Stethoscope, 
  Truck,
  ArrowRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "municipality", title: "شؤون البلدية", icon: Building2, color: "bg-blue-50 text-blue-600" },
  { id: "water", title: "الموارد المائية", icon: Droplets, color: "bg-cyan-50 text-cyan-600" },
  { id: "electricity", title: "الطاقة والكهرباء", icon: Zap, color: "bg-yellow-50 text-yellow-600" },
  { id: "health", title: "الصحة العامة", icon: Stethoscope, color: "bg-rose-50 text-rose-600" },
  { id: "roads", title: "الأشغال العمومية", icon: Truck, color: "bg-orange-50 text-orange-600" },
  { id: "general", title: "خدمات عامة", icon: Info, color: "bg-slate-50 text-slate-600" },
];

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [type, setType] = useState<"complaint" | "suggestion">("complaint");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [assignedDept, setAssignedDept] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDepartments().then((deps) => {
      const names = deps.map((d: any) => d.name || d.organization).filter(Boolean);
      setDepartments(names);
      if (names.length > 0) setAssignedDept(names[0]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("يرجى ملء العنوان والوصف للمتابعة.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const catTitle = CATEGORIES.find(c => c.id === category)?.title || "عام";
      await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category: catTitle,
        location_text: "الجزائر العاصمة",
        lat: 36.7372,
        lng: 3.088,
        reporter_id: user?.id,
        assigned_dept: assignedDept || "المصلحة التقنية",
      });
      router.push("/dashboard/tracking");
    } catch {
      setError("حدث خطأ أثناء إرسال البلاغ. يرجى مراجعة الاتصال والمحاولة مرة أخرى.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">تقديم بلاغ جديد</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            ساهم في تحسين الخدمات العمومية من خلال تقديم بلاغك بكل دقة
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="lg:hidden text-muted-foreground hover:text-foreground p-2"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Type & Category Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">نوع المراسلة</p>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <button
              onClick={() => setType("complaint")}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all group",
                type === "complaint"
                  ? "border-primary bg-primary-50 text-primary shadow-sm"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/30"
              )}
            >
              <AlertCircle size={20} className={cn("shrink-0", type === "complaint" ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              <span className="font-bold text-sm">بلاغ</span>
            </button>
            <button
              onClick={() => setType("suggestion")}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all group",
                type === "suggestion"
                  ? "border-primary bg-primary-50 text-primary shadow-sm"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/30"
              )}
            >
              <Lightbulb size={20} className={cn("shrink-0", type === "suggestion" ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              <span className="font-bold text-sm">اقتراح</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">تصنيف الحالة</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                  category === cat.id
                    ? "border-primary bg-surface shadow-md ring-2 ring-primary/5"
                    : "border-border bg-surface hover:border-primary/20 opacity-70 hover:opacity-100"
                )}
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-1", cat.color)}>
                  <cat.icon size={20} />
                </div>
                <span className={cn("text-xs font-bold", category === cat.id ? "text-primary" : "text-foreground")}>
                  {cat.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2 px-1">عنوان البلاغ *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنواناً مقتضباً وواضحاً..."
                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2 px-1">تفاصيل المراسلة *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="يرجى تزويدنا بكافة التفاصيل التي قد تساعد في معالجة طلبك..."
                rows={6}
                className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-3 px-1 flex items-center gap-2">
                <Building2 size={16} className="text-primary" />
                توجيه الطلب
              </label>
              {departments.length > 0 ? (
                <select
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium animate-pulse py-2">
                  <Loader2 size={16} className="animate-spin" />
                  جارٍ تحميل المصالح...
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-3 px-1 flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                المكان التقريبي
              </label>
              <button
                type="button"
                className="w-full h-12 px-4 rounded-xl border border-border bg-background flex items-center justify-between text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all group"
              >
                <span className="text-xs font-bold">تحديد عبر الخريطة</span>
                <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-md">آلي</span>
              </button>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-bold text-foreground mb-3 px-1 flex items-center gap-2">
                <Camera size={16} className="text-primary" />
                المرفقات (اختياري)
              </label>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-background hover:bg-primary-50/10 transition-all text-muted-foreground hover:text-primary group"
              >
                <div className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                   <Upload size={20} />
                </div>
                <span className="text-xs font-bold">رفع صور توثيقية</span>
                <span className="text-[10px] opacity-60">PNG, JPG حتى 5 ميجابايت</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={sending || !title.trim() || !description.trim()}
            className="w-full h-14 flex items-center justify-center gap-3 bg-primary text-white rounded-2xl font-black text-base hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98]"
          >
            {sending ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                جارٍ الإرسال...
              </>
            ) : (
              <>
                إرسال الطلب
                <ArrowRight size={20} className="rotate-180" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
