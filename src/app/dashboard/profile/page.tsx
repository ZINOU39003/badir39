"use client";

import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { User, Phone, Mail, Building2, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [full_name, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser({ full_name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-8">حسابي</h1>

      <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-black">
              {user?.full_name?.charAt(0) || "م"}
            </span>
          </div>
          <div>
            <p className="font-black text-lg">{user?.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {user?.role === "admin"
                ? "الإدارة العليا"
                : user?.role === "department"
                ? user?.organization
                : "مواطن"}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">الاسم الكامل</label>
          <div className="relative">
            <input
              type="text"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">رقم الهاتف</label>
          <div className="relative">
            <input
              type="text"
              value={user?.phone || ""}
              disabled
              className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-muted/20 text-muted-foreground font-semibold text-sm"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-background text-foreground font-semibold text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              dir="ltr"
            />
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {user?.organization && (
          <div>
            <label className="block text-sm font-bold mb-2">المؤسسة</label>
            <div className="relative">
              <input
                type="text"
                value={user.organization}
                disabled
                className="w-full h-12 pr-4 pl-12 rounded-xl border border-border bg-muted/20 text-muted-foreground font-semibold text-sm"
              />
              <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors shadow-md shadow-primary/20"
        >
          <Save size={18} />
          {saved ? "تم الحفظ ✓" : "حفظ التعديلات"}
        </button>
      </div>
    </div>
  );
}
