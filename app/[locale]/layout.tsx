import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";

// ایمپورت کامپوننت‌های اصلی
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

// --- تنظیمات متادیتا (سئو) ---
export const metadata: Metadata = {
  metadataBase: new URL('https://soughat.shop'),
  
  title: {
    default: "سوغات شاپ | ارسال هدیه به ایران با ارز دیجیتال",
    template: "%s | سوغات شاپ"
  },
  
  description: "اولین پلتفرم تخصصی ارسال هدیه، سوغات و پول به ایران برای ایرانیان خارج از کشور. خرید پسته، زعفران و کادو با پرداخت امن تتر (USDT) و سولانا. تحویل فوری در سراسر ایران.",
  
  manifest: '/site.webmanifest',
  
  keywords: ["ارسال هدیه به ایران", "خرید سوغات ایران", "ارسال پول با تتر", "سوغات شاپ", "Soughat Shop", "خرید پسته صادراتی", "گیفت شاپ ایران", "پرداخت با کریپتو"],
  
  authors: [{ name: "تیم سوغات شاپ" }],
  creator: "Soughat Shop",
  publisher: "Soughat Shop",
  robots: {
    index: true,
    follow: true,
  },

  // ✅ اصلاح حیاتی ۱: اضافه کردن تگ‌های زبان (Hreflang)
  // این بخش به گوگل می‌گوید که این سایت نسخه‌های مختلف زبانی دارد
  alternates: {
    canonical: '/',
    languages: {
      'fa': '/fa', // فارسی برای همه دنیا (نه فقط ایران)
      'en': '/en', // انگلیسی برای همه دنیا
    },
  },

  openGraph: {
    title: "سوغات شاپ | پل ارتباطی با ایران",
    description: "عزیزانتان در ایران را خوشحال کنید. ارسال آنی هدیه و سوغات با پرداخت ارزی و کریپتو.",
    url: 'https://soughat.shop',
    siteName: 'Soughat Shop',
    locale: 'fa', // ✅ اصلاح حیاتی ۲: حذف IR (فارسی عمومی برای تمام کشورها)
    type: 'website',
  },
  
  verification: {
    google: "889fIOlZo4jHk-UB3Sv_X-vuaJQa-YPzZKLPMqpcYEo",
  },
};

// --- کامپوننت اصلی لی‌اوت ---
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // 1. دریافت زبان از پارامترها
  const { locale } = await params;

  // 2. بررسی معتبر بودن زبان (فقط fa و en)
  if (!['fa', 'en'].includes(locale)) {
    notFound();
  }

  // 3. دریافت فایل ترجمه مربوطه (fa.json یا en.json)
  const messages = await getMessages();

  // 4. تنظیم جهت صفحه (RTL برای فارسی، LTR برای انگلیسی)
  const direction = locale === 'fa' ? 'rtl' : 'ltr';

  // 5. تعریف اسکیمای سازمان (Organization Schema) برای گوگل
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Soughat Shop',
    'alternateName': 'سوغات شاپ',
    'url': 'https://soughat.shop',
    'logo': 'https://soughat.shop/logo.png',
    'description': 'اولین پلتفرم تخصصی ارسال هدیه و سوغات به ایران با پرداخت ارزی و کریپتو',
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+98-916-803-8017',
      'contactType': 'customer service',
      'areaServed': ['IR', 'US', 'CA', 'DE', 'GB', 'SE'], // کشورهایی که سرویس می‌دهیم
      'availableLanguage': ['en', 'fa']
    },
    'sameAs': [
      'https://www.instagram.com/soughatshop',
      'https://twitter.com/soughatshop'
    ]
  };

  return (
    <NextIntlClientProvider messages={messages}>
      {/* دیو اصلی که جهت صفحه را کنترل می‌کند */}
      <div dir={direction} className="flex flex-col min-h-screen w-full">
        
        {/* تزریق اسکریپت جیسون برای گوگل */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* هدر سایت */}
        <Header />
        
        {/* محتوای اصلی صفحات */}
        <main className="flex-1 w-full">
            {children}
        </main>
        
        {/* فوتر سایت */}
        <Footer />
        
        {/* دکمه شناور تماس */}
        <FloatingContact />
        
      </div>
    </NextIntlClientProvider>
  );
}