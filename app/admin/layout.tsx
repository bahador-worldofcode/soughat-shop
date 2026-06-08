import "@/app/globals.css";
import type { Metadata } from "next";
import { Vazirmatn } from 'next/font/google';
import AdminWrapper from "@/components/AdminWrapper";

// کانفیگ فونت 
const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

// تنظیمات سئو برای اینکه گوگل پنل ادمین رو ایندکس نکنه
export const metadata: Metadata = {
  title: "پنل مدیریت | سوغات شاپ",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.className} antialiased bg-gray-50 flex flex-col min-h-screen w-full`}>
        {/* کدهای سایدبار و احراز هویت رو دادیم به این کامپوننت */}
        <AdminWrapper>
          {children}
        </AdminWrapper>
      </body>
    </html>
  );
}