"use client";

import { useAuth } from "@/lib/auth-context";
import { 
  FileText, 
  Download, 
  Printer, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Search,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <FileText size={32} className="text-primary" />
            التقرير والإحصاء
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">استخراج التقارير التحليلية والبيانات الإحصائية للمنصة</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-lg"
          >
            <Printer size={16} />
            طباعة التقرير (PDF)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase mb-4 text-muted-foreground">تصفية التقرير</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground">الفترة الزمنية</label>
                <div className="relative">
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select className="w-full h-10 pr-9 pl-4 bg-background border border-border rounded-lg text-xs font-bold appearance-none">
                    <option>آخر 30 يوم</option>
                    <option>الربع الحالي</option>
                    <option>السنة الحالية</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground">المصلحة المعنية</label>
                <select className="w-full h-10 px-4 bg-background border border-border rounded-lg text-xs font-bold appearance-none">
                  <option>كافة المصالح</option>
                  <option>بلدية الدبيلة</option>
                  <option>الموارد المائية</option>
                </select>
              </div>
              <button className="w-full py-2.5 bg-primary/10 text-primary text-xs font-black rounded-lg hover:bg-primary/20 transition-all">
                تحديث التصفية
              </button>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 border-r-4 border-r-primary">
            <TrendingUp size={24} className="text-primary mb-3" />
            <p className="text-xs font-black text-primary mb-1">النمو العام</p>
            <p className="text-2xl font-black text-primary-900">+12.5%</p>
            <p className="text-[10px] text-primary/60 mt-1 font-bold">زيادة في حل البلاغات مقارنة بالشهر السابق</p>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                ملخص الأداء الميداني
              </h2>
              <span className="text-[10px] font-bold text-muted-foreground">آخر تحديث: اليوم، 10:30 صباحاً</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Distribution */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-muted-foreground uppercase flex items-center gap-2">
                  <PieChart size={14} />
                  توزيع البلاغات حسب القطاعات
                </h3>
                <div className="space-y-4">
                  <ProgressRow label="البلدية والنظافة" value={45} count={124} />
                  <ProgressRow label="الكهرباء والإنارة" value={22} count={60} />
                  <ProgressRow label="المياه والري" value={18} count={49} />
                  <ProgressRow label="الطرق والأشغال" value={15} count={41} />
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <StatusMetric label="تم حلها" value="84" color="text-primary" />
                  <StatusMetric label="تحت الدراسة" value="12" color="text-amber-500" />
                  <StatusMetric label="جاري التنفيذ" value="28" color="text-blue-500" />
                  <StatusMetric label="مؤجل" value="03" color="text-slate-400" />
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-sm font-black mb-4">أهم الشركاء الفاعلين هذا الشهر</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-background text-muted-foreground font-black uppercase italic">
                    <tr>
                      <th className="px-4 py-3 rounded-r-lg">المصلحة</th>
                      <th className="px-4 py-3">إجمالي الطلبات</th>
                      <th className="px-4 py-3">متوسط زمن الاستجابة</th>
                      <th className="px-4 py-3 rounded-l-lg">معدل الإغلاق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <TableRow name="بلدية الدبيلة" total="156" time="2.4 يوم" rate="92%" />
                    <TableRow name="سونلغاز" total="42" time="1.8 يوم" rate="88%" />
                    <TableRow name="سيال (المياه)" total="38" time="4.1 يوم" rate="75%" />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, count }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[11px] font-bold">
        <span>{label}</span>
        <span className="text-muted-foreground">{count} بلاغ</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

function StatusMetric({ label, value, color }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50 flex flex-col items-center">
      <span className={cn("text-2xl font-black mb-1", color)}>{value}</span>
      <span className="text-[10px] font-black text-muted-foreground uppercase">{label}</span>
    </div>
  );
}

function TableRow({ name, total, time, rate }: any) {
  return (
    <tr className="hover:bg-primary/5 transition-colors">
      <td className="px-4 py-4 font-black">{name}</td>
      <td className="px-4 py-4 font-bold">{total}</td>
      <td className="px-4 py-4 font-bold text-muted-foreground">{time}</td>
      <td className="px-4 py-4 font-black text-primary">{rate}</td>
    </tr>
  );
}
