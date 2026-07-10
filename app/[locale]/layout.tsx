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
import AuthSessionHandler from "@/components/AuthSessionHandler";
import PWARegister from "@/components/PWARegister";

// کانفیگ فونت برای خوانایی بهتر سایت
const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

// شناسه‌ی اندازه‌گیری گوگل آنالیتیکس (GA4)
const GA_MEASUREMENT_ID = 'G-E6M9G3032G';

// آدرس پایه‌ی سایت — یک‌بار اینجا تعریف می‌شود تا هم metadataBase و هم
// alternates از همین یک منبع واحد استفاده کنند (جلوگیری از mismatch).
const SITE_URL = 'https://soughat.shop';

// --- تنظیمات متادیتا (سئو) ---
// تبدیل به تابع برای اینکه بتوانیم زبان را داینامیک از آدرس بگیریم
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  // خواندن متادیتا از فایل زبان
  const t = await getMessages({ locale });
  const meta = (t as any).Metadata;

  return {
    metadataBase: new URL(SITE_URL),
    
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

    // ✅ این alternates فقط یک «پیش‌فرض ایمن» (Safety Net) در سطح لایوت است،
    // نه canonical واقعیِ هر صفحه.
    // صفحات داخلی (about, contact, crypto-guide, how-it-works, terms, trust,
    // products, blog, ...) خودشان در generateMetadata مخصوص خودشان کلید
    // alternates را کامل override می‌کنند — چون Next.js متادیتای هر کلید را
    // به‌صورت کامل جایگزین می‌کند نه merge عمقی — تا canonical و hreflang
    // دقیقاً متناظر با همان صفحه (و نه صفحه‌ی اصلی) به گوگل اعلام شود.
    //
    // 🔧 ریشه‌ی خطای گوگل‌کنسول «Duplicate without user-selected canonical»
    // روی /fa همین‌جا بود: اینجا فقط «languages» ست شده بود و «canonical»
    // اصلاً وجود نداشت. صفحه‌ی هوم (app/[locale]/(home)/page.tsx) هم خودش
    // generateMetadata جداگانه‌ای نداشت، پس این آبجکت ناقص، همان چیزی بود که
    // مستقیماً روی خروجی /fa و /en می‌نشست — یعنی هوم‌پیج اصلاً تگ canonical
    // نمی‌گرفت. حالا هم اینجا یک canonical خودارجاع (self-referencing) به‌عنوان
    // پیش‌فرض داریم، هم به خود صفحه‌ی هوم یک generateMetadata مستقل اضافه شده
    // (که این پیش‌فرض را override می‌کند اما نتیجه‌ی نهایی یکسان و درست است).
    // x-default طبق تصمیم تیم برای مخاطبان بین‌المللی به en اشاره می‌کند —
    // دقیقاً هماهنگ با buildAlternates() در app/sitemap.ts.
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        'fa': `${SITE_URL}/fa`,
        'en': `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/en`,
      },
    },

    openGraph: {
      title: meta.title,
      description: meta.description,
      url: SITE_URL,
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
  //
  // 🔧 رفع مشکل «دو Schema سازمانی جدا روی هوم‌پیج»:
  // این همان Organization پایه‌ای است که روی همه‌ی صفحات سایت رندر می‌شود
  // (نام، لوگو، توضیحات، راه ارتباطی، شبکه‌های اجتماعی) — یعنی هویت اصلی
  // برند. آیتم aggregateRating/review را عمداً اینجا نمی‌آوریم، چون طبق
  // دستورالعمل گوگل، دیتای امتیاز/نظر باید فقط در صفحه‌ای تزریق شود که
  // آن نظرات واقعاً روی صفحه قابل مشاهده‌اند (اینجا فقط هوم‌پیج است،
  // نه صفحاتی مثل تماس یا قوانین).
  // به‌جای ساختن یک Organization دومِ کاملاً جدا در هوم‌پیج (که قبلاً
  // باعث سردرگمی گوگل می‌شد)، یک «@id» ثابت به این آبجکت می‌دهیم.
  // در app/[locale]/(home)/page.tsx هم دقیقاً همین @id استفاده می‌شود تا
  // گوگل هر دو تکه‌ی JSON-LD را به‌عنوان یک موجودیت واحد (همین برند) در
  // نظر بگیرد، نه دو Organization متفاوت و متناقض.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
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

          {/* شبکهٔ ایمنی احراز هویت: اگر گوگل کاربر را با ?code= به
              ریشه برگرداند، سِشن را می‌سازد و به داشبورد هدایت می‌کند */}
          <AuthSessionHandler />

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

          {/* ثبت سرویس‌ورکر PWA — سراسری (نه فقط هوم‌پیج)، چون معیار
              نصب‌پذیری باید در کل سایت برقرار باشد؛ خودِ نوتیف نصب فقط در
              صفحه‌ی اصلی نمایش داده می‌شود (به (home)/page.tsx مراجعه کنید) */}
          <PWARegister />
          
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

