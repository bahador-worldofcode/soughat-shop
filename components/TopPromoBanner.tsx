'use client';

import { useEffect, useState } from 'react';
import { Gift, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { isPromoBannerHidden } from '@/lib/navVisibility';

// بعد از اینکه کاربر بنر را بست، تا این مدت دوباره نشانش نده (۲۴ ساعت).
// اینطوری هم مزاحم نمی‌شود، هم هر بازدید تازه (مثلاً روز بعد از طریق یک
// پست دیگر) دوباره شانس دیده‌شدن دارد.
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'soughat_promo_banner_dismissed_at';

/**
 * بنر تبلیغاتی سراسری بالای صفحه.
 *
 * هدف: بازدیدکنندگانی که از طریق پست‌های وبلاگ در فیسبوک/اکس وارد سایت
 * می‌شوند معمولاً همان صفحه‌ی مقاله می‌مانند و هیچ‌وقت به صفحه‌ی محصولات
 * نمی‌روند. این بنر یک مسیر همیشه-در-دسترس و تک-کلیکی به صفحه‌ی محصولات
 * فراهم می‌کند، در تمام صفحات سایت (به‌جز جاهایی که در isPromoBannerHidden
 * مشخص شده — مثل تسویه‌حساب و صفحه‌ی موفقیت).
 *
 * نکته‌ی سئو: این یک نوار باریک و همیشه در جریان عادی صفحه (نه یک پاپ‌آپ یا
 * لایه‌ی شناور روی محتوا) است، کاملاً قابل‌بستن، و هیچ محتوایی را از دید
 * کاربر یا گوگل پنهان نمی‌کند؛ بنابراین مشمول جریمه‌ی
 * «Intrusive Interstitials» گوگل نمی‌شود (آن قانون فقط برای لایه‌های
 * تمام‌صفحه یا پاپ‌آپ‌هایی است که محتوای اصلی را می‌پوشانند).
 *
 * نکته‌ی CLS: پیش‌فرض state روی «نمایش داده شود» است، دقیقاً همان چیزی که
 * سرور هم رندر می‌کند — یعنی برای اکثریت بازدیدکنندگان (که برای اولین‌بار
 * می‌آیند) هیچ پرشی (Layout Shift) موقع mount شدن رخ نمی‌دهد. فقط اگر کاربر
 * قبلاً واقعاً بسته باشدش، در useEffect (بعد از خواندن localStorage) مخفی
 * می‌شود.
 */
export default function TopPromoBanner() {
  const t = useTranslations('PromoBanner');
  const locale = useLocale();
  const isEn = locale === 'en';
  const pathname = usePathname();

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION_MS) {
        setVisible(false);
      }
    } catch {
      // localStorage در دسترس نیست (مثلاً حالت خصوصی مرورگر)؛ بنر همچنان نمایش داده می‌شود.
    }
  }, []);

  // فقط برای اندازه‌گیری داخلی در گوگل آنالیتیکس (GA4 از قبل در
  // app/[locale]/layout.tsx بارگذاری شده). کاملاً محافظت‌شده: اگر gtag به
  // هر دلیلی هنوز لود نشده باشد، هیچ خطایی رخ نمی‌دهد.
  const trackClick = () => {
    try {
      const gtag = (window as any).gtag;
      if (typeof gtag === 'function') {
        gtag('event', 'promo_banner_click', {
          banner_location: pathname || 'unknown',
        });
      }
    } catch {
      // نادیده گرفتن هر خطای احتمالی ردیابی — نباید مانع ناوبری کاربر شود.
    }
  };

  const handleClose = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // نادیده گرفتن خطای احتمالی localStorage.
    }
  };

  if (isPromoBannerHidden(pathname) || !visible) return null;

  return (
    <div className="relative w-full bg-gradient-to-l from-blue-700 via-blue-600 to-indigo-700 text-white">
      <Link
        href="/products"
        onClick={trackClick}
        className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 text-center text-xs font-bold transition-colors hover:bg-white/10 sm:text-sm ${
          isEn ? 'pr-10 pl-4' : 'pl-10 pr-4'
        }`}
      >
        <Gift className="hidden h-4 w-4 flex-shrink-0 sm:block" aria-hidden="true" />
        <span className="min-w-0 truncate">{t('text')}</span>
        <span className="flex-shrink-0 underline decoration-white/50 underline-offset-2">
          {t('cta')}
        </span>
      </Link>

      <button
        type="button"
        onClick={handleClose}
        aria-label={t('close_aria')}
        className={`absolute top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors hover:bg-white/15 ${
          isEn ? 'right-2' : 'left-2'
        }`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}