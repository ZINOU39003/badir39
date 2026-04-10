"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createComplaint, getDepartments } from "@/lib/api";
import { 
  AlertCircle, 
  Lightbulb, 
  MapPin, 
  Camera, 
  Upload, 
  Loader2, 
  Building2, 
  ArrowRight,
  X,
  Map as MapIcon,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<"complaint" | "suggestion">("complaint");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Manual Department Routing
  const [assignedDept, setAssignedDept] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  // Location & Media
  const [locationText, setLocationText] = useState("");
  const [images, setImages] = useState<{file: File, preview: string}[]>([]);
  const [isMapActive, setIsMapActive] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoadingDeps(true);
    getDepartments().then((deps) => {
      setDepartments(deps);
      if (deps.length > 0) {
        setAssignedDept(deps[0].full_name || deps[0].organization);
      }
    }).finally(() => setLoadingDeps(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newFiles].slice(0, 5)); // Limit to 5
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationText.trim()) {
      setError("يرجى ملء جميع الحقول الإلزامية (العنوان، الوصف، والموقع).");
      return;
    }
    
    setSending(true);
    setError("");

    try {
      // Mocking image upload - in production this would upload to S3/Cloudinary
      const mediaUrls = images.map((_, i) => `https://placehold.co/600x400?text=Image+${i+1}`);

      await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category: type === "complaint" ? "بلاغ" : "اقتراح",
        location_text: locationText.trim(),
        lat: 36.7372,
        lng: 3.088,
        reporter_id: user?.id,
        assigned_dept: assignedDept || "المصلحة العامة",
        media_urls: mediaUrls,
      });

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/tracking"), 2000);
    } catch {
      setError("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-2xl font-black">تم إرسال بلاغك بنجاح</h1>
        <p className="text-muted-foreground max-w-sm">
          جاري توجيه بلاغك للمصلحة المعنية. يمكنك تتبع حالة الطلب من لوحة التحكم.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-black text-foreground">تقديم مراسلة جديدة</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            تواصل مع المصالح المختصة بكل سهولة وشفافية
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground p-2 rounded-lg bg-surface border border-border transition-colors"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Type Selector */}
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <label className="block text-sm font-bold text-muted-foreground mb-4 px-1">نوع المراسلة *</label>
              <div className="grid grid-cols-2 gap-3">
                 <button
                  type="button"
                  onClick={() => setType("complaint")}
                  className={cn(
                    "flex items-center justify-center gap-3 h-14 rounded-xl border-2 transition-all font-bold",
                    type === "complaint"
                      ? "border-primary bg-primary-50/50 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <AlertCircle size={20} />
                  <span>بلاغ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("suggestion")}
                  className={cn(
                    "flex items-center justify-center gap-3 h-14 rounded-xl border-2 transition-all font-bold",
                    type === "suggestion"
                      ? "border-primary bg-primary-50/50 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <Lightbulb size={20} />
                  <span>اقتراح</span>
                </button>
              </div>
            </div>

            {/* Input Details */}
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2 px-1">عنوان الموضوع *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تسرب مياه في شارع الاستقلال..."
                  className="w-full h-14 px-4 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2 px-1">تفاصيل الطلب *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="يرجى شرح المشكلة بوضوح، مع ذكر أي تفاصيل إضافية قد تفيد..."
                  rows={6}
                  className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Routing & Location */}
          <div className="lg:col-span-4 space-y-6">
            {/* Routing */}
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-3 px-1 flex items-center gap-2">
                  <Building2 size={16} className="text-primary" />
                  توجيه الطلب
                </label>
                {loadingDeps ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium animate-pulse py-2">
                    <Loader2 size={16} className="animate-spin" />
                    جارٍ تحميل المصالح...
                  </div>
                ) : (
                  <select
                    value={assignedDept}
                    onChange={(e) => setAssignedDept(e.target.value)}
                    className="w-full h-14 px-4 rounded-xl border-border bg-background text-foreground font-bold text-sm focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- اختر المصلحة --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.full_name || d.organization}>
                        {d.full_name || d.organization}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Location Input */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-foreground px-1 flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  المكان / العنوان *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="العنوان، الحي، أو المعالم القريبة"
                    className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-background text-foreground font-bold text-xs focus:border-primary transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setIsMapActive(!isMapActive)}
                    className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors",
                      isMapActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-surface"
                    )}
                  >
                    <MapIcon size={16} />
                  </button>
                </div>
                {isMapActive && (
                  <div className="h-32 bg-slate-100 rounded-xl border border-border flex flex-col items-center justify-center text-muted-foreground text-[10px] font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                    <MapPin size={24} className="mb-2 text-red-400" />
                    جارٍ تحديد الإحداثيات آلياً...
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-foreground px-1 flex items-center gap-2">
                  <Camera size={16} className="text-primary" />
                  الصور المرفقة
                </label>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple 
                  accept="image/*"
                  className="hidden" 
                />

                {images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                        <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                       <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg aspect-square hover:border-primary hover:bg-primary-50/10 transition-all text-muted-foreground"
                       >
                         <Upload size={16} />
                       </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full py-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-background transition-all text-muted-foreground hover:text-primary"
                  >
                    <Upload size={20} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase">ارفق صوراً للحدث</span>
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="sticky bottom-6 lg:static pt-2">
               {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold leading-relaxed">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={sending || !title.trim() || !description.trim() || !locationText.trim()}
                className="w-full h-16 flex items-center justify-center gap-3 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]"
              >
                {sending ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    تأكيد وإرسال الطلب
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
