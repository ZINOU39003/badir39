"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Phone, Lock, User, Mail, Eye, EyeOff, ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    password: "",
    email: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim() || !form.password) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }
    setBusy(true);
    setError("");

    // Algerian Phone Validation
    const algerianPhoneRegex = /^0[567][0-9]{8}$/;
    if (!algerianPhoneRegex.test(form.phone.trim())) {
      setError("يرجى إدخال رقم هاتف جزائري صحيح (10 أرقام تبدأ بـ 05، 06، أو 07).");
      setBusy(false);
      return;
    }

    try {
      await register({
        phone: form.phone.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        email: form.email.trim() || undefined,
        role: "citizen",
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "فشل عملية الإنشاء."
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
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl font-black">ب</span>
          </div>
          <h2 className="text-3xl font-black mb-4">انضم إلى بادر</h2>
          <p className="text-primary-100 leading-relaxed max-w-sm mx-auto">
            سجّل الآن وساهم في تحسين الخدمات العمومية في منطقتك من خلال
            تقديم البلاغات وتتبعها بكل سهولة.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-black text-foreground mb-2">
            إنشاء حساب جديد
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            أنشئ حسابك للبدء في تقديم البلاغات وتتبعها
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">الاسم الكامل *</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="الاسم الكامل"
                  className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-surface text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">رقم الهاتف *</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="05 / 06 / 07 xxxxxxxx"
                  className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-surface text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  dir="ltr"
                />
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@email.com"
                  className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-surface text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  dir="ltr"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">كلمة المرور *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
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
              className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 mt-2"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جارٍ الإنشاء...
                </span>
              ) : (
                "إنشاء الحساب"
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
                href="/login"
                className="text-primary font-bold text-sm hover:underline"
              >
                لديك حساب؟ تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
