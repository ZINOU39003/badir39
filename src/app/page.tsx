"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldAlert, 
  MapPin, 
  ChevronLeft, 
  Users, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24">
        {/* Navigation / Logo Area */}
        <div className="flex items-center justify-between mb-20 scale-in duration-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center p-2 border border-slate-100">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none">بادر</h1>
              <p className="text-[10px] font-black tracking-widest text-primary uppercase mt-1">Algérie Digital</p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
            className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 hover:border-primary/50 hover:bg-slate-50 transition-all shadow-sm"
          >
            {isAuthenticated ? "لوحة التحكم" : "تسجيل الدخول"}
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <div className="space-y-8 slide-right duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase">
              <Zap size={14} fill="currentColor" />
              المنصة الوطنية الموحدة للبلاغات
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1]">
              شارك في <span className="text-primary italic">بناء</span> <br />
              مستقبل مدينتك.
            </h2>
            
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
              منصة بادر هي حلقة الوصل بين المواطن والإدارة. أبلغ عن الانشغالات، تتبع الحلول، وساهم في تحسين جودة الحياة في بلديتك بكل شفافية.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => router.push("/register")}
                className="h-16 px-10 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
              >
                ابدأ الآن مجاناً
                <ArrowRight size={20} />
              </button>
              
              <button 
                onClick={() => router.push("/emergency")}
                className="h-16 px-10 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3 animate-pulse"
              >
                <ShieldAlert size={24} />
                طوارئ (الحماية المدنية)
              </button>
            </div>
          </div>

          {/* Feature Grid / Visual */}
          <div className="grid grid-cols-2 gap-4 slide-left duration-700">
            <div className="space-y-4">
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">تحديد جغرافي</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">تحديد دقيق لموقع البلاغ لضمان سرعة تدخل المصالح التقنية.</p>
              </div>
              <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-transform">
                <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-black mb-2">شفافية كاملة</h3>
                <p className="text-sm text-white/60 font-medium leading-relaxed">تتبع لحظي لحالة طلبك مع إشعارات دورية حتى الانتهاء من المعالجة.</p>
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-xl shadow-primary/20 hover:-translate-y-2 transition-transform">
                <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-6">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-black mb-2">سرعة قصوى</h3>
                <p className="text-sm text-white/80 font-medium leading-relaxed">توجيه آلي للبلاغ إلى المصلحة المعنية مباشرة في بلديتك.</p>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">خدمة ذكية</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">نظام طوارئ مدمج للحماية المدنية يعمل على مدار الساعة.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stat or Info */}
        <div className="mt-20 py-8 px-12 bg-white/50 backdrop-blur-md border border-white rounded-[3rem] flex flex-wrap items-center justify-between gap-8 scale-in duration-1000">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-primary">24/7</span>
            <span className="text-sm font-bold text-slate-500">متاحة دائماً لخدمتكم</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-slate-900">58</span>
            <span className="text-sm font-bold text-slate-500">ولاية مستهدفة</span>
          </div>
          <div className="flex -space-x-3 rtl:space-x-reverse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-12 h-12 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center text-xs font-black">+10k</div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .scale-in { animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .slide-right { animation: slideRight 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .slide-left { animation: slideLeft 1s cubic-bezier(0.16, 1, 0.3, 1); }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div className="text-center py-10 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">بادر 2026 - تحديث الاستقرار والواجهة v4.3</p>
        <Link 
          href="/about-developer" 
          className="text-[9px] font-black text-primary hover:underline transition-all"
        >
          عن مطور المنصة
        </Link>
      </div>
    </div>
  );
}
