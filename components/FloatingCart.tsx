'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, Link } from '@/i18n/navigation';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';

// TASK-05 (ROADMAP.md): نشانگر شناور سبد خرید در دسکتاپ.
// نکته‌ی مهم: این یک «باگ» نبود — آیکون سبد خرید داخل هدر از قبل وجود داشت
// (Header.tsx، بخش Actions، با بج قرمز تعداد آیتم‌ها). این کامپوننت صرفاً یک
// نشانگر کمکیِ اضافه است، دقیقاً به همان‌چیزی که در ROADMAP خواسته شده بود:
//   ۱) فقط در دسکتاپ نمایش داده می‌شود (`hidden md:flex`) — در موبایل، سبد
//      خرید از طریق نوار پایین (MobileBottomNav) یا آیکون هدر همیشه در
//      دسترس است و نیازی به عنصر شناور اضافه نیست.
//   ۲) فقط وقتی سبد خرید حداقل یک آیتم دارد نمایش داده می‌شود
//      (`useStore().totalItems()` — همان منبع شمارش بج هدر، تا همیشه یکی
//      باشند).
//   ۳) برای اینکه با دکمه‌ی شناور واتساپ (FloatingContact، گوشه‌ی پایین-راست)
//      روی هم نیفتد، عمداً در گوشه‌ی مخالف (پایین-چپ) صفحه قرار گرفته. این
//      ساده‌ترین و مطمئن‌ترین راه برای «عدم تداخل دو دکمه‌ی شناور» است — به‌جای
//      هماهنگی پیکسلی و شکننده بین دو کامپوننت جدا، هرکدام گوشه‌ی ثابت خودش
//      را دارد و در هیچ حالتی (اسکرول، تغییر زبان، ریسایز) روی هم نمی‌افتند.
//   ۴) هنگام اسکرول به سمت پایین کمی محو (نیمه‌شفاف) می‌شود تا مزاحم خواندن
//      محتوای صفحه نشود؛ با هاور یا اسکرول به سمت بالا دوباره کامل واضح
//      می‌شود — الگوی fade مشابه چیزی که در ROADMAP برای FloatingContact هم
//      توضیح داده شده.
export default function FloatingCart() {
  const t = useTranslations('FloatingCart');
  const locale = useLocale();
  const isEn = locale === 'en';

  const pathname = usePathname();
  const { totalItems } = useStore();
  const cartCount = totalItems();

  // چون totalItems از zustand persist (localStorage) می‌آید، تا قبل از mount
  // شدن روی کلاینت نباید به آن اعتماد کرد — دقیقاً همان الگوی `mounted` که در
  // Header.tsx برای همین بج استفاده شده، تا خروجی سرور و کلاینت یکی بمانند.
  const [mounted, setMounted] = useState(false);

  // آیا الان در حال اسکرول به سمت پایین هستیم؟ برای محو ملایم دکمه.
  const [fadedForScroll, setFadedForScroll] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        // فقط بعد از عبور از ۸۰ پیکسل اول صفحه محو شدن فعال می‌شود، تا در
        // بالای صفحه (جایی که کاربر تازه رسیده) همیشه کاملاً واضح دیده شود.
        setFadedForScroll(currentY > lastScrollY.current && currentY > 80);
        lastScrollY.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;
  // پنل ادمین محیط کاملاً جدایی دارد؛ این کامپوننت مخصوص ویترین فروشگاه است.
  if (pathname?.startsWith('/admin')) return null;
  // طبق تسک: فقط وقتی سبد خرید حداقل یک آیتم دارد نمایش داده شود.
  if (cartCount === 0) return null;

  return (
    <div
      className={`hidden md:flex fixed left-6 bottom-6 z-50 font-[family-name:var(--font-vazir)] transition-opacity duration-300 ${
        fadedForScroll ? 'opacity-50 hover:opacity-100' : 'opacity-100'
      }`}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <Link
        href="/cart"
        aria-label={t('aria_label')}
        title={t('aria_label')}
        className="group flex items-center gap-2.5 h-14 px-5 bg-blue-600 hover:brightness-110 text-white rounded-full shadow-[0_6px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all active:scale-95"
      >
        <span className="relative flex items-center justify-center w-7 h-7 flex-shrink-0">
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
            {cartCount}
          </span>
        </span>
        <span className="text-sm font-bold whitespace-nowrap">{t('cta')}</span>
      </Link>
    </div>
  );
}