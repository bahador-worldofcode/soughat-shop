'use client';

import { useState, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { MessageCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

// نکته‌ی مهندسی (بازطراحی): قبلاً این دکمه‌ی شناور با کلیک یک منو باز می‌کرد که
// دو گزینه داشت: «واتساپ» و «ارسال تیکت» (یک فرم کامل داخل همین ویجت).
// بخش تیکت از اینجا برداشته شده و به یک فرم کامل‌تر (نام + شماره + ایمیل +
// پیام) در صفحه‌ی «تماس با ما» منتقل شده؛ چون:
//   ۱) گفتن «اگر واتساپ ندارید تیکت بزنید» برای اکثر مخاطب‌های خارج از ایران
//      (که تقریباً همه واتساپ دارند) منطقی نبود و فقط یک کلیک اضافه ایجاد می‌کرد.
//   ۲) مسیر جایگزین برای کسانی که واتساپ ندارند همین حالا هم به‌وضوح در دسترسه:
//      دکمه‌ی برجسته‌ی «تماس با ما» در منوی موبایل (MobileBottomNav) و لینک
//      «تماس با ما» در فوتر/هدر، که به همین صفحه‌ی Contact با فرم تیکت می‌رسند.
// در نتیجه این دکمه‌ی شناور حالا صرفاً یک میان‌بر مستقیم به چت واتساپ است —
// بدون منو، بدون فرم — دقیقاً مثل اکثر دکمه‌های شناور واتساپ در سایت‌های دیگر.
export default function FloatingContact() {
  const t = useTranslations('FloatingContact');
  const locale = useLocale();
  const isEn = locale === 'en';

  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // استثنائات نمایش را برمی‌داریم. قانون کلی می‌گوید دکمه باید به خاطر
  // حضور همیشگی Navigation اصلی به انداره ۶ رِم به سمت بالا شناور شود.
  const hasBottomNav = !pathname?.startsWith('/admin');

  // وقتی کاربر به وب‌سایت وارد میشه، در هیروی اولیه شناور مخفیست و وقتی پایین‌تر رفت دیده می‌شود.
  const [hideForHero, setHideForHero] = useState(() => pathname === '/' && isMobileViewport());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname !== '/' || !isMobileViewport()) {
      setHideForHero(false);
      return;
    }

    const heroEl = document.getElementById('home-hero');
    if (!heroEl) {
      setHideForHero(false);
      return;
    }

    setHideForHero(true);
    const observer = new IntersectionObserver(
      ([entry]) => setHideForHero(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [pathname]);

  if (!mounted) return null;
  // این دکمه کاملا از فضای محیط‌های شرکتی (داشبورد) منفک شده.
  if (pathname?.startsWith('/admin')) return null;

  // با قانون طلایی، تنها با توجه به بود و نبود هدر مرکزی تنظیم می‌شود
  // BottomNav ما ارتفاع حدودی ۸۰ پیکسل از انتهای کادر اشغال می‌کند (تلاقی محیط امن در iOS)
  // ما عدد را استاندارد ست میکنیم.
  const bottomPosClass = hasBottomNav ? 'bottom-[6rem] md:bottom-6' : 'bottom-6';

  return (
    <div
      className={`fixed right-6 z-50 flex flex-col items-end font-[family-name:var(--font-vazir)] transition-all duration-300 ${bottomPosClass} ${hideForHero ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'}`}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <a
        href={`https://wa.me/989168038017?text=${encodeURIComponent(t('whatsapp_msg'))}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('aria_label')}
        title={t('aria_label')}
        className="group relative flex items-center justify-center w-[54px] h-[54px] sm:w-14 sm:h-14 bg-green-600 hover:brightness-110 text-white rounded-full shadow-[0_6px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all active:scale-95 z-50"
      >
        <MessageCircle className="h-[26px] w-[26px] sm:h-7 sm:w-7 drop-shadow-sm" />
        <span className="absolute top-0 right-0 flex h-[18px] w-[18px]">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
          <span className="relative inline-flex rounded-full h-[18px] w-[18px] bg-red-500 border-2 border-white"></span>
        </span>
      </a>
    </div>
  );
}