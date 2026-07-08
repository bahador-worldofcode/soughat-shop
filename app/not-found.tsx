// app/not-found.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Vazirmatn } from 'next/font/google';
import { SearchX, Home, Package } from 'lucide-react';
import './globals.css';

const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

// تشخیص زبان کاربر از روی هدر مرورگر (Accept-Language)
// این صفحه بیرون از app/[locale] است، پس next-intl زبان را برایش
// مشخص نمی‌کند و باید خودمان حدس بزنیم. اگر زبان اول مرورگر «en»
// بود انگلیسی نشان می‌دهیم، در غیر این صورت فارسی (پیش‌فرض سایت).
async function detectIsEnglish() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  return acceptLanguage.toLowerCase().startsWith('en');
}

const content = {
  fa: {
    lang: 'fa' as const,
    dir: 'rtl' as const,
    metaTitle: 'صفحه پیدا نشد | سوغات شاپ',
    title: 'صفحه مورد نظر پیدا نشد',
    description: 'صفحه‌ای که دنبالش بودید پیدا نشد یا جابه‌جا شده است.',
    backHome: 'بازگشت به خانه',
    viewProducts: 'مشاهده محصولات',
    switchHref: '/en',
    switchLabel: 'English',
  },
  en: {
    lang: 'en' as const,
    dir: 'ltr' as const,
    metaTitle: 'Page not found | Soughat Shop',
    title: 'Page not found',
    description: 'The page you’re looking for doesn’t exist or has moved.',
    backHome: 'Back to home',
    viewProducts: 'Browse products',
    switchHref: '/fa',
    switchLabel: 'فارسی',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const isEnglish = await detectIsEnglish();
  const t = isEnglish ? content.en : content.fa;

  return {
    title: t.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function RootNotFound() {
  const isEnglish = await detectIsEnglish();
  const t = isEnglish ? content.en : content.fa;
  const homeHref = isEnglish ? '/en' : '/fa';
  const productsHref = isEnglish ? '/en/products' : '/fa/products';

  return (
    <html lang={t.lang} dir={t.dir}>
      <body className={`${vazir.className} antialiased`}>
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 via-white to-gray-50 px-4">
          {/* دایره‌های محو تزئینی پس‌زمینه */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="relative w-full max-w-md">
            <div className="rounded-3xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-blue-900/5 px-8 py-10 text-center">
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50">
                <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-blue-100 opacity-40" />
                <SearchX className="relative h-9 w-9 text-blue-600" strokeWidth={1.75} />
              </div>

              <p className="text-7xl font-black leading-none bg-gradient-to-b from-blue-600 to-blue-300 bg-clip-text text-transparent select-none">
                404
              </p>

              <h1 className="mt-4 text-xl font-bold text-gray-900">{t.title}</h1>
              <p className="mt-2 text-sm text-gray-500 leading-7">{t.description}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href={homeHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
                >
                  <Home className="h-4 w-4" />
                  {t.backHome}
                </Link>
                <Link
                  href={productsHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Package className="h-4 w-4" />
                  {t.viewProducts}
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              <Link
                href={t.switchHref}
                className="font-semibold text-blue-500 underline underline-offset-2 hover:text-blue-600"
              >
                {t.switchLabel}
              </Link>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}