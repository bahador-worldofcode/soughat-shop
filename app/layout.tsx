import "./globals.css";
import { Vazirmatn } from "next/font/google";

// تنظیم فونت وزیرمتن برای کل پروژه
const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazir",
});

// این لی‌اوت، ریشه کل سایت (هم ادمین و هم سایت اصلی) است.
// وظیفه آن فقط ساختن تگ‌های html و body است.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.className} antialiased bg-gray-50 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}