import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact"; // اضافه شد

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazir",
});

export const metadata: Metadata = {
  title: "Soughat Shop | سوغات شاپ",
  description: "ارسال هدیه به ایران با پرداخت کریپتو",
  verification: {
    google: "889fIOlZo4jHk-UB3Sv_X-vuaJQa-YPzZKLPMqpcYEo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazir.className} antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">
            {children}
        </main>
        <Footer />
        
        {/* ویجت شناور در تمام صفحات */}
        <FloatingContact />
      </body>
    </html>
  );
}