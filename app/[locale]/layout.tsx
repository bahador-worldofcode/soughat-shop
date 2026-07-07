import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";
import { Vazirmatn } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import Script from 'next/script';

// ایمپورت کامپوننت‌های اصلی
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import FloatingCart from "@/components/FloatingCart";
import MobileBottomNav from "@/components/MobileBottomNav";
import WebMCPProvider from "@/components/WebMCPProvider";

// کانفیگ فونت برای خوانایی بهتر سایت
const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

// شناسه‌ی اندازه‌گیری گوگل آنالیتیکس (GA4)
const GA_MEASUREMENT_ID = 'G-E6M9G3032G';

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

    // ✅ این بخش فقط برای صفحه اصلی (هوم‌پیج) صحیح است.
    // صفحات داخلی (about, contact, crypto-guide, how-it-works, terms, trust, ...)
    // خودشان در generateMetadata مخصوص خودشان این مقدار را override می‌کنند
    // تا آدرس alternate درست (متناظر با همان صفحه) به گوگل اعلام شود.
    alternates: {
      languages: {
        'fa': '/fa',
        'en': '/en',
        'x-default': '/fa',
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
      'https://x.com/Soughatshop',
      'https://www.facebook.com/share/14eJwCenVjC/'
    ]
  };

  // 5.۲ (TASK-07، ROADMAP.md): اسکیمای WebSite با SearchAction — تنها موردِ
  // واقعاً خالیِ گزارش سئوی چت‌جی‌پی‌تی بعد از تطبیق با کد. به گوگل می‌گه که
  // سرچ‌باکس سایت (همون که در Header.tsx و ProductsClientView.tsx هست) به
  // `/products?q=...` می‌ره، تا در نتایج گوگل هم به‌صورت sitelinks search box
  // نمایش داده بشه.
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Soughat Shop',
    'alternateName': 'سوغات شاپ',
    'url': 'https://soughat.shop',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `https://soughat.shop/${locale}/products?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    // ✅ اصلاح ۳: اضافه شدن تگ html و body به جای div
    <html lang={locale} dir={direction}>
      <body className={`${vazir.className} antialiased bg-gray-50 flex flex-col min-h-screen w-full`}>

        {/* اسکریپت ردیابی گوگل آنالیتیکس (GA4) - باید در همه‌ی صفحات عمومی سایت بارگذاری شود */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>

        <NextIntlClientProvider messages={messages}>

          {/* نوار پیشرفت سراسری بالای صفحه — فاز ۴ */}
          <NextTopLoader
            color="#2563eb"
            height={3}
            showSpinner={false}
            shadow="0 0 10px #2563eb, 0 0 5px #2563eb"
          />

          {/* تزریق اسکریپت جیسون برای گوگل */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          {/* TASK-07: اسکیمای WebSite + SearchAction */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />

          {/* هدر سایت */}
          <Header />
          
          {/* محتوای اصلی صفحات */}
          <main className="flex-1 w-full">
              {children}
          </main>
          
          {/* فوتر سایت */}
          <Footer />

          {/* نوار پایین ناوبری موبایل (خانه، محصولات، سبد خرید، پیگیری، منو) */}
          <MobileBottomNav />

          {/* دکمه شناور تماس */}
          <FloatingContact />

          {/* نشانگر شناور سبد خرید در دسکتاپ (TASK-05) — گوشه‌ی مخالفِ دکمه‌ی
              تماس، تا با آن روی هم نیفتد، و فقط وقتی سبد خرید آیتم دارد */}
          <FloatingCart />

          {/* WebMCP: نمایش اکشن‌های فرانت‌اند به ایجنت‌های مبتنی بر مرورگر */}
          <WebMCPProvider locale={locale} />
          
        </NextIntlClientProvider>
      </body>
    </html>
  );
}