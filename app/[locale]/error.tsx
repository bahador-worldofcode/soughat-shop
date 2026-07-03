'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

/**
 * این فایل به‌صورت خودکار خطاهای هر صفحه‌ی زیر [locale] رو می‌گیره —
 * چه خطای رندر React، چه خطای throw‌شده توی یک Server Component
 * (مثلاً اگه کوئری Supabase توی صفحه‌ی خانه fail کنه).
 *
 * چون error.tsx طبق قرارداد Next.js پارامتر params (locale) دریافت
 * نمی‌کنه، زبان رو از طریق هوک next-intl (useLocale) می‌گیریم؛ این کار
 * جواب میده چون error.tsx داخل همون NextIntlClientProvider که توی
 * layout.tsx تعریف شده رندر میشه.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isEn = locale === 'en';

  useEffect(() => {
    // ثبت خطا در کنسول برای دیباگ؛ بعداً می‌شه همین‌جا به یک سرویس
    // مانیتورینگ خطا (مثل Sentry) هم وصل کرد.
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-4 py-24 text-center font-[family-name:var(--font-vazir)]">
      <div className="bg-red-50 p-5 rounded-full">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEn ? 'Something went wrong' : 'مشکلی پیش اومد'}
        </h1>
        <p className="text-gray-500 leading-7">
          {isEn
            ? 'An unexpected error occurred while loading this page. You can try again, or head back to the homepage.'
            : 'در بارگذاری این صفحه خطایی رخ داد. می‌تونید دوباره تلاش کنید یا به صفحه‌ی اصلی برگردید.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          {isEn ? 'Try again' : 'تلاش مجدد'}
        </button>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
        >
          <Home className="h-4 w-4" />
          {isEn ? 'Back to home' : 'بازگشت به خانه'}
        </Link>
      </div>

      {error.digest && (
        <p className="text-xs text-gray-300 font-mono mt-2">
          {isEn ? 'Error code' : 'کد خطا'}: {error.digest}
        </p>
      )}
    </div>
  );
}