"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  Camera, 
  MapPin, 
  Send, 
  Phone, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  X,
  ShieldCheck
} from "lucide-react";
import { getNearestUnit, CivilProtectionUnit } from "@/lib/civil-protection-data";
import { cn } from "@/lib/utils";
import { createComplaint } from "@/lib/api";
import { WILAYA_STRUCTURE } from "@/lib/administrative-data";
import { useAuth } from "@/lib/auth-context";

export default function EmergencyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [locationText, setLocationText] = useState("جاري تحديد موقعك...");
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [municipality, setMunicipality] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<{file: File, preview: string} | null>(null);
  const [description, setDescription] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [nearestUnit, setNearestUnit] = useState<CivilProtectionUnit | null>(null);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&accept-language=ar`);
        const data = await res.json();
        const address = data.address;
        const city = address.city || address.town || address.village || "";
        setMunicipality(city);
        setLocationText(data.display_name);
        
        // Find District (Daira)
        const matchedDistrict = WILAYA_STRUCTURE.find(d => 
          d.municipalities.some(m => {
            const mNameClean = m.name.replace("بلدية", "").trim();
            const cityNameClean = city.trim();
            return cityNameClean.includes(mNameClean) || mNameClean.includes(cityNameClean);
          })
        );
        if (matchedDistrict) setDistrict(matchedDistrict.name);

        // Find nearest unit
        const unit = getNearestUnit(city);
        if (unit) setNearestUnit(unit);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setIsLocating(false);
      setLocationText("تعذر تحديد الموقع تلقائياً");
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); 
        };
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !coords) return;
    
    setSending(true);
    
    try {
      const compressed = await compressImage(image.file);
      
      await createComplaint({
        title: "بلاغ استغاثة مستعجل",
        description: `رقم الهاتف: ${phone}\n\n${description.trim() || "بلاغ طوارئ مرسل عبر نظام الاستغاثة السريع."}`,
        category: "طوارئ",
        location_text: locationText || "موقع استغاثة",
        lat: coords.lat,
        lng: coords.lng,
        assigned_dept: "الحماية المدنية",
        media_urls: [compressed],
        municipality: municipality || "غير محدد",
        district: district || "غير محدد"
      } as any);

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("فشل إرسال البلاغ، يرجى المحاولة مرة أخرى أو الاتصال مباشرة بالرقم المعروض.");
    } finally {
      setSending(false);
    }
  };

  if (success && nearestUnit) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-white text-slate-900 rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-2xl font-black mb-2">تم استلام بلاغك!</h1>
          <p className="text-slate-600 font-bold mb-8">
            تم توجيه الاستغاثة إلى {nearestUnit.name}
          </p>
          
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8">
            <p className="text-red-600 text-xs font-black uppercase mb-1">رقم الطوارئ المباشر</p>
            <p className="text-3xl font-black text-red-700 tracking-wider mb-4" dir="ltr">
              {nearestUnit.phone}
            </p>
            <a 
              href={`tel:${nearestUnit.phone}`}
              className="flex items-center justify-center gap-3 w-full h-16 bg-red-600 text-white rounded-xl font-black text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-200"
            >
              <Phone size={24} fill="currentColor" />
              اتصل الآن
            </a>
          </div>
          
          <button 
            onClick={() => router.push("/")}
            className="text-slate-400 font-bold text-sm hover:text-slate-600"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ba0000] flex flex-col">
      {/* Urgent Header */}
      <div className="p-6 flex items-center justify-between text-white">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
          <ArrowRight size={24} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldAlert size={28} className="animate-pulse" />
          <h1 className="text-xl font-black">طوارئ الحماية المدنية</h1>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 bg-white rounded-t-[3rem] p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-black text-red-700">تقديم بلاغ مستعجل</h2>
            <p className="text-slate-500 font-bold text-sm">سرعة البلاغ تساهم في إنقاذ الأرواح</p>
          </div>

          {/* Quick Photo */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-slate-700 px-1">صورة الحادث (مهم جداً)</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
            />
            
            {image ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-red-100">
                <img src={image.preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setImage(null)}
                  className="absolute top-4 left-4 bg-red-600 text-white rounded-full p-2"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-red-50 border-4 border-dashed border-red-200 rounded-3xl flex flex-col items-center justify-center text-red-600 hover:bg-red-100 transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <Camera size={32} />
                </div>
                <span className="font-black">افتح الكاميرا وصوّر الحادث</span>
              </button>
            )}
          </div>

          {/* Target Unit Feedback */}
          {nearestUnit && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-500">
               <p className="text-[10px] font-black text-red-400 uppercase mb-1">جهة الاستلام المستهدفة</p>
               <div className="flex items-center gap-2 text-red-700">
                  <ShieldCheck size={18} />
                  <p className="text-sm font-black">{nearestUnit.name}</p>
               </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm shrink-0">
              {isLocating ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase">موقعك الحالي ({district || "جاري البحث..."})</p>
              <p className="text-sm font-bold text-slate-700 truncate">{locationText}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 px-1">رقم الهاتف للتواصل *</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0x XX XX XX XX"
                className="w-full h-14 pr-12 pl-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-sm focus:border-red-500 transition-all shadow-inner"
                dir="ltr"
                required
              />
              <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 px-1">تفاصيل إضافية (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: حادث تصادم، حالة إغماء..."
              rows={3}
              className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-sm focus:border-red-500 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={sending || !image}
            className={cn(
              "w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl",
              image ? "bg-red-600 text-white hover:bg-red-700 shadow-red-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            {sending ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Send size={24} />
                إرسال استغاثة فورية
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
