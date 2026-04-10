import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    submitted: "تم الاستلام",
    under_review: "قيد المراجعة",
    in_progress: "جاري التنفيذ",
    resolved: "تم الحل",
    rejected: "مرفوض",
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    submitted: "bg-yellow-100 text-yellow-800 border-yellow-300",
    under_review: "bg-blue-100 text-blue-800 border-blue-300",
    in_progress: "bg-orange-100 text-orange-800 border-orange-300",
    resolved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  };
  return map[status] || "bg-gray-100 text-gray-800 border-gray-300";
}
