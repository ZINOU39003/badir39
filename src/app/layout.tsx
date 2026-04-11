import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "بادر - المنصة الوطنية للبلاغات",
  description: "بوابتكم الرقمية للمساهمة في تحسين الخدمات العمومية",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "بادر",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  themeColor: "#006241",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { SWRegistration } from "@/components/sw-registration";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-cairo antialiased">
        <AuthProvider>
          {children}
          <SWRegistration />
        </AuthProvider>
      </body>
    </html>
  );
}
