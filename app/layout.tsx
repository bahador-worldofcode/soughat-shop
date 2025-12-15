import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazir",
});

export const metadata: Metadata = {
  // آدرس اصلی سایت
  metadataBase: new URL('https://soughat-shop.vercel.app'),
  
  title: {
    default: "سوغات شاپ | ارسال هدیه به ایران با ارز دیجیتال",
    template: "%s | سوغات شاپ"
  },
  
  description: "اولین پلتفرم تخصصی ارسال هدیه، سوغات و پول به ایران برای ایرانیان خارج از کشور. خرید پسته، زعفران و کادو با پرداخت امن تتر (USDT) و سولانا. تحویل فوری در سراسر ایران.",
  
  // --- بخش جدید: اتصال به فایل‌های پوشه Public ---
  manifest: '/site.webmanifest',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  // ---------------------------------------------

  keywords: ["ارسال هدیه به ایران", "خرید سوغات ایران", "ارسال پول با تتر", "سوغات شاپ", "Soughat Shop", "خرید پسته صادراتی", "گیفت شاپ ایران", "پرداخت با کریپتو"],
  
  authors: [{ name: "تیم سوغات شاپ" }],
  creator: "Soughat Shop",
  publisher: "Soughat Shop",
  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "سوغات شاپ | پل ارتباطی با ایران",
    description: "عزیزانتان در ایران را خوشحال کنید. ارسال آنی هدیه و سوغات با پرداخت ارزی و کریپتو.",
    url: 'https://soughat-shop.vercel.app',
    siteName: 'Soughat Shop',
    locale: 'fa_IR',
    type: 'website',
  },
  
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