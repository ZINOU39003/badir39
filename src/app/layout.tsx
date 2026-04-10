import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "بادر - المنصة الوطنية للبلاغات",
  description: "بوابتكم الرقمية للمساهمة في تحسين الخدمات العمومية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-cairo antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
