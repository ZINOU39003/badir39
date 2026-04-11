"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Phone, Lock, Eye, EyeOff, ArrowLeft, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password) {
      setError("يرجى إدخال (رقم الهاتف أو اسم المستخدم) وكلمة المرور للمتابعة.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await login(phone.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "يرجى التحقق من البيانات والمحاولة مرة أخرى."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-800 via-primary to-primary-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center text-white px-12">
          <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl p-4">
            <img src="/logo.png" alt="بادر Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-black mb-4">منصة بادر</h2>
          <p className="text-primary-100 leading-relaxed max-w-sm mx-auto">
            بوابتكم الرقمية للمساهمة في تحسين الخدمات العمومية وتتبع
            انشغالاتكم بكل سهولة وشفافية.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-3">
              <img src="/logo.png" alt="بادر Mobile Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-black text-primary">منصة بادر</h1>
          </div>

          <h2 className="text-2xl font-black text-foreground mb-2">
            مرحباً بك في بادر
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            يرجى إدخال رقم الهاتف أو اسم المستخدم وكلمة المرور
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">رقم الهاتف أو اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف أو اسم المستخدم"
                  className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-surface text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  dir="ltr"
                />
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-surface text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جارٍ الدخول...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border space-y-4">
            <button 
              onClick={() => router.push("/emergency")}
              className="w-full h-14 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 animate-pulse"
            >
              <ShieldAlert size={20} />
              طوارئ (الحماية المدنية)
            </button>

            <div className="text-center">
              <Link
                href="/register"
                className="text-primary font-bold text-sm hover:underline"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
