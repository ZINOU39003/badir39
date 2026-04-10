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
  CheckCircle2,
  Navigation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WILAYA_STRUCTURE } from "@/lib/administrative-data";

export default function ReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<"complaint" | "suggestion">("complaint");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Hierarchy & Routing
  const [selectedDaira, setSelectedDaira] = useState("");
  const [selectedBaladiya, setSelectedBaladiya] = useState("");
  const [assignedDept, setAssignedDept] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(false);

  // Location & Media
  const [locationText, setLocationText] = useState("");
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [images, setImages] = useState<{file: File, preview: string}[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch departments when baladiya changes
  useEffect(() => {
    if (!selectedBaladiya) {
      setDepartments([]);
      return;
    }
    setLoadingDeps(true);
    getDepartments().then((all) => {
      // Filter by baladiya name
      const filtered = all.filter(d => d.baladiya === selectedBaladiya);
      setDepartments(filtered);
      if (filtered.length > 0) {
        setAssignedDept(filtered[0].organization);
      } else {
        setAssignedDept("");
      }
    }).finally(() => setLoadingDeps(false));
  }, [selectedBaladiya]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم تحديد الموقع");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      
      try {
        // Reverse geocoding using Nominatim (OpenStreetMap)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=ar`);
        const data = await res.json();
        const address = data.address;
        const placeName = address.city || address.town || address.village || address.suburb || "";
        
        // Match with our Baladiya list
        const matched = WILAYA_STRUCTURE.flatMap(d => d.municipalities).find(m => 
          placeName.includes(m.name.replace("بلدية", "").trim()) || m.name.includes(placeName)
        );

        if (matched) {
          const parentDaira = WILAYA_STRUCTURE.find(d => d.municipalities.some(m => m.id === matched.id));
          if (parentDaira) {
            setSelectedDaira(parentDaira.name);
            setSelectedBaladiya(matched.name);
            setLocationText(data.display_name);
          }
        } else {
          setLocationText(data.display_name);
          alert("تم تحديد موقعك، يرجى اختيار البلدية يدوياً من القائمة");
        }
      } catch (err) {
        console.error("Geocoding error", err);
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setIsLocating(false);
      alert("فشل في الوصول للموقع الجغرافي");
    });
  };

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
    if (!title.trim() || !description.trim() || !selectedBaladiya || !assignedDept) {
      setError("يرجى ملء جميع الحقول الإلزامية واختيار المصلحة المعنية.");
      return;
    }
    
    setSending(true);
    setError("");

    try {
      // Mocking image upload
      const mediaUrls = images.map((_, i) => `https://placehold.co/600x400?text=Image+${i+1}`);

      await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category: type === "complaint" ? "بلاغ" : "اقتراح",
        location_text: locationText.trim() || selectedBaladiya,
        lat: coords?.lat || 33.36, // Fallback to El Oued center
        lng: coords?.lng || 6.85,
        reporter_id: user?.id,
        assigned_dept: assignedDept,
        media_urls: mediaUrls,
        district: selectedDaira,
        municipality: selectedBaladiya
      } as any);

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
          جاري توجيه بلاغك للمصلحة المعنية في بلديتك. يمكنك تتبع حالة الطلب من لوحة التحكم.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-black text-foreground">تقديم مراسلة جديدة</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            سيتم توجيه بلاغك تلقائياً إلى المصالح المعنية في بلديتك
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <label className="block text-sm font-bold text-muted-foreground mb-4 px-1">نوع المراسلة *</label>
              <div className="grid grid-cols-2 gap-3">
                 <button
                  type="button"
                  onClick={() => setType("complaint")}
                  className={cn(
                    "flex items-center justify-center gap-3 h-14 rounded-xl border-2 transition-all font-bold",
                    type === "complaint" ? "border-primary bg-primary-50/50 text-primary" : "border-border bg-background text-muted-foreground"
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
                    type === "suggestion" ? "border-primary bg-primary-50/50 text-primary" : "border-border bg-background text-muted-foreground"
                  )}
                >
                  <Lightbulb size={20} />
                  <span>اقتراح</span>
                </button>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2 px-1">عنوان الموضوع *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تسرب مياه، إنارة معطلة..."
                  className="w-full h-14 px-4 rounded-xl border border-border bg-background font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2 px-1">تفاصيل الطلب *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="يرجى كتابة التفاصيل..."
                  rows={6}
                  className="w-full p-4 rounded-xl border border-border bg-background font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-3 flex items-center justify-between">
                  توجيه البلاغ
                  <button 
                    type="button"
                    onClick={detectLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1 text-[10px] bg-emerald-500 text-white px-2 py-1 rounded-md hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                    تحديد تلقائي
                  </button>
                </label>
                
                <div className="space-y-3">
                  <select
                    value={selectedDaira}
                    onChange={(e) => {
                      setSelectedDaira(e.target.value);
                      setSelectedBaladiya("");
                    }}
                    className="w-full h-12 px-3 rounded-xl border border-border bg-background text-xs font-bold focus:border-primary outline-none"
                  >
                    <option value="">-- اختر الدائرة --</option>
                    {WILAYA_STRUCTURE.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedBaladiya}
                    onChange={(e) => setSelectedBaladiya(e.target.value)}
                    disabled={!selectedDaira}
                    className="w-full h-12 px-3 rounded-xl border border-border bg-background text-xs font-bold focus:border-primary outline-none disabled:opacity-50"
                  >
                    <option value="">-- اختر البلدية --</option>
                    {WILAYA_STRUCTURE.find(d => d.name === selectedDaira)?.municipalities.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>

                  <select
                    value={assignedDept}
                    onChange={(e) => setAssignedDept(e.target.value)}
                    disabled={!selectedBaladiya || loadingDeps}
                    className="w-full h-12 px-3 rounded-xl border border-border bg-background text-xs font-bold focus:border-primary outline-none disabled:opacity-50"
                  >
                    <option value="">-- اختر المصلحة --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.organization}>{d.organization}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-sm font-bold text-foreground px-1 flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  العنوان الدقيق
                </label>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="مثال: حي الرمال، بالقرب من..."
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-xs font-bold focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-sm font-bold text-foreground px-1 flex items-center gap-2">
                  <Camera size={16} className="text-primary" />
                  الصور
                </label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-background transition-all text-muted-foreground flex flex-col items-center"
                >
                  <Upload size={18} className="mb-1" />
                  <span className="text-[9px] font-black uppercase">ارفق الصور</span>
                </button>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                         <img src={img.preview} alt="" className="w-full h-full object-cover" />
                         <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
               {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-[10px] font-bold">{error}</div>}
               <button
                type="submit"
                disabled={sending || !selectedBaladiya || !assignedDept}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary-600 transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
              >
                {sending ? "جاري الإرسال..." : "تأكيد وإرسال"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
