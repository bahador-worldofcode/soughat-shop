import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";
import { Vazirmatn } from 'next/font/google';

// ایمپورت کامپوننت‌های اصلی
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

// کانفیگ فونت برای خوانایی بهتر سایت
const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

// --- تنظیمات متادیتا (سئو) ---
// تبدیل به تابع برای اینکه بتوانیم زبان را داینامیک از آدرس بگیریم
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  // خواندن متادیتا از فایل زبان
  const t = await getMessages({ locale });
  const meta = (t as any).Metadata;

  return {
    metadataBase: new URL('https://soughat.shop'),
    
    title: {
      default: meta.title,
      template: meta.title_template
    },
    
    description: meta.description,
    
    manifest: '/site.webmanifest',
    
    keywords: meta.keywords,
    
    authors: [{ name: "Soughat Shop Team" }],
    creator: "Soughat Shop",
    publisher: "Soughat Shop",
    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      languages: {
        'fa': '/fa', 
        'en': '/en', 
      },
    },

    openGraph: {
      title: meta.title,
      description: meta.description,
      url: 'https://soughat.shop',
      siteName: 'Soughat Shop',
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
    },
    
    verification: {
      google: "889fIOlZo4jHk-UB3Sv_X-vuaJQa-YPzZKLPMqpcYEo",
    },
  };
}

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
      'areaServed': ['IR', 'US', 'CA', 'DE', 'GB', 'SE'],
      'availableLanguage': ['en', 'fa']
    },
    'sameAs': [
      'https://www.instagram.com/soughatshop',
      'https://twitter.com/soughatshop'
    ]
  };

  return (
    // ✅ اصلاح ۳: اضافه شدن تگ html و body به جای div
    <html lang={locale} dir={direction}>
      <body className={`${vazir.className} antialiased bg-gray-50 flex flex-col min-h-screen w-full`}>
        <NextIntlClientProvider messages={messages}>
          
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
          
        </NextIntlClientProvider>
      </body>
    </html>
  );
}