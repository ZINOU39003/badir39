"use client";

import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Mail, 
  MapPin, 
  Phone, 
  Github, 
  Code2, 
  ShieldCheck, 
  Globe,
  ExternalLink
} from "lucide-react";

export default function DeveloperPage() {
  const router = useRouter();

  const developerInfo = {
    name: "المهندس زهير عية (Zouhir Aya)",
    title: "مطور برمجيات ومهندس حلول رقمية",
    role: "مطور منصة بادر (بوابة الجزائر الرقمية)",
    address: "الدبيلة، ولاية الوادي، الجزائر",
    email: "zouhiraya.dz12@gmail.com",
    phone: "0697148209",
  };

  return (
    <div className="min-h-screen bg-slate-50 font-cairo text-slate-900 overflow-x-hidden">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden overflow-y-hidden z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="group flex items-center gap-2 p-2 px-4 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 hover:border-primary/30 transition-all font-bold text-sm shadow-sm"
        >
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          العودة
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Code2 size={24} />
          </div>
          <span className="font-black tracking-tight text-xl">بادر <span className="text-primary">Dev</span></span>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Header Profile Section */}
        <section className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative inline-block mb-8">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[3rem] bg-gradient-to-br from-primary to-emerald-600 p-1 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
              <div className="w-full h-full bg-white rounded-[2.8rem] flex items-center justify-center overflow-hidden">
                 <div className="text-primary text-6xl font-black">Z</div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl border border-slate-100 scale-in-95 animate-pulse">
                <ShieldCheck size={32} />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">{developerInfo.name}</h1>
          <p className="text-primary font-black text-lg md:text-xl mb-6">{developerInfo.title}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {developerInfo.role}
          </div>
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 group animate-in zoom-in-95 fade-in duration-700">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin size={28} />
            </div>
            <h3 className="text-slate-400 text-xs font-black mb-1 uppercase">العنوان</h3>
            <p className="text-slate-800 font-black text-lg leading-relaxed">{developerInfo.address}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 group animate-in zoom-in-95 fade-in delay-150 duration-700">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mail size={28} />
            </div>
            <h3 className="text-slate-400 text-xs font-black mb-1 uppercase">البريد الإلكتروني</h3>
            <p className="text-slate-800 font-black text-lg">{developerInfo.email}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 group animate-in zoom-in-95 fade-in delay-300 duration-700">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Phone size={28} />
            </div>
            <h3 className="text-slate-400 text-xs font-black mb-1 uppercase">الهاتف</h3>
            <p className="text-slate-800 font-black text-2xl tracking-tight" dir="ltr">{developerInfo.phone}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 group animate-in zoom-in-95 fade-in delay-450 duration-700 flex items-center justify-center">
             <div className="text-center">
                <p className="text-slate-800 font-black text-lg mb-4">هل تحتاج لحل رقمي مخصص؟</p>
                <a href={`mailto:${developerInfo.email}`} className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-black transition-all">
                  تواصل معي الآن
                  <ExternalLink size={16} />
                </a>
             </div>
          </div>
        </div>

        {/* Skills/Tags */}
        <section className="text-center animate-in fade-in duration-1000 delay-500">
          <div className="flex flex-wrap justify-center gap-3">
            {["Next.js", "React", "TypeScript", "Node.js", "MySQL", "UI/UX"].map(skill => (
              <span key={skill} className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-all cursor-default shadow-sm">{skill}</span>
            ))}
          </div>
        </section>
      </main>

      <footer className="p-12 text-center text-slate-400 text-xs font-bold">
         <p>© 2026 {developerInfo.name} - "بادر" نبتكر لنخدم الوطن</p>
      </footer>
    </div>
  );
}
