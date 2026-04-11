"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { getDepartments, createDepartment, deleteDepartment } from "@/lib/api";
import { Building2, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";

export default function DepartmentsPage() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", username: "", password: "", organization: "" });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const deps = await getDepartments(token);
      setDepartments(deps);
    } catch {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password || !token) return;
    setBusy(true);
    try {
      await createDepartment(
        {
          phone: `DEPT_${form.username}`,
          password: form.password,
          full_name: form.full_name || form.organization,
          username: form.username,
          organization: form.organization,
        },
        token
      );
      setShowForm(false);
      setForm({ full_name: "", username: "", password: "", organization: "" });
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "خطأ");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!token || !confirm("هل أنت متأكد من حذف هذه المصلحة؟")) return;
    
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        refresh();
      } else {
        alert("فشل الحذف: " + (data.message || "خطأ غير معروف"));
      }
    } catch (err) {
      alert("خطأ في الاتصال بالسيرفر أثناء الحذف");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">إدارة المصالح</h1>
          <p className="text-muted-foreground text-sm mt-1">إضافة وإدارة المصالح الحكومية</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            <RefreshCw size={16} /> تحديث
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors shadow-md"
          >
            <Plus size={18} /> إضافة مصلحة
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface rounded-2xl border border-border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">اسم المصلحة</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">القطاع</label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))}
                className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">اسم المستخدم *</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">كلمة المرور *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            إنشاء
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Building2 size={48} className="mb-4 opacity-30" />
          <p className="text-sm font-semibold">لا توجد مصالح مسجلة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="bg-surface rounded-xl border border-border p-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">{d.name || d.full_name}</p>
                  <p className="text-xs text-muted-foreground">{d.organization || d.username}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(d.id)}
                className="text-red-400 hover:text-red-600 transition-colors p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
