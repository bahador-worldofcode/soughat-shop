import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Gift, Lock, ShieldCheck, Zap } from 'lucide-react';

// =============================================================================
// بنر «هدایای سفارشی» — صفحه‌ی اصلی
// =============================================================================
// این کامپوننت کاملاً جدید است و فقط در یک نقطه به app/[locale]/(home)/page.tsx
// اضافه شده (بین بخش دسته‌بندی‌ها و بخش «شفافیت مالی»). هیچ کامپوننت یا
// منطق دیگری از پروژه تغییر نکرده است.
//
// یک کامپوننت سرور (Server Component) ساده و سبک است — بدون state، بدون
// فراخوانی دیتابیس — پس هیچ تاثیری روی سرعت یا پایداری صفحه‌ی اصلی ندارد.
//
// تصویر آیکون از مسیر زیر خوانده می‌شود (به بخش مستندات پروژه مراجعه کنید
// تا بدانید این فایل را دقیقاً کجا و با چه پرامپتی تولید کنید):
//   public/images/custom-gifts-banner-icon.png
//   (فرمت PNG عمداً است — چون برای شفاف نگه‌داشتن پس‌زمینه‌ی آیکون لازم شد)
//
// 🔧 تاریخچه‌ی طراحی این بلوک (برای اینکه دوباره به همون اشتباه‌ها برنگردیم):
//  نسخه‌ی ۱: بلاک متن «flex-1» بود → روی مانیتور عریض کل فضای خالی رو
//            می‌گرفت و آیکون تا لبه‌ی راست هل داده می‌شد → یک گپ بزرگ و
//            بی‌قاعده وسط بنر.
//  نسخه‌ی ۲: کل ردیف (متن+آیکون) با max-w-4xl mx-auto وسط‌چین شد → گپِ وسط
//            درست شد، ولی حالا لبه‌های چپ و راستِ بنر (روی مانیتور عریض)
//            کاملاً خالی و بی‌محتوا به‌نظر می‌رسیدن.
//  نسخه‌ی ۳ (فعلی): برگشتیم به چیدمانِ متن-در-ابتدا / آیکون-در-انتها
//            (justify-between) با همون عرض استاندارد «container» که بقیه‌ی
//            بخش‌های صفحه‌ی اصلی هم استفاده می‌کنن (نه یک جزیره‌ی کوچیکِ
//            وسط‌چین)، به‌علاوه‌ی یک ردیف «نشان‌های اعتماد» (بدون ثبت
//            اطلاعات / قیمت‌گذاری شفاف / پاسخ سریع) زیر توضیحات — که هم
//            محتوای واقعی و مفید اضافه می‌کنه (نه صرفاً تزیین)، هم عرض
//            بلاک متن رو طبیعی‌تر پر می‌کنه و گپ وسط رو کوچیک‌تر می‌کنه.
// =============================================================================

export default async function CustomOrderBanner() {
  const t = await getTranslations('CustomOrder');
  const locale = await getLocale();
  const isEn = locale === 'en';

  const trustChips = [
    { icon: Lock, label: t('trust.item1_title') },
    { icon: ShieldCheck, label: t('trust.item2_title') },
    { icon: Zap, label: t('trust.item3_title') },
  ];

  return (
    <section className="w-full bg-gradient-to-l from-indigo-800 via-blue-800 to-blue-900 text-white relative overflow-hidden">
      {/* دکوراسیون پس‌زمینه — دو دایره‌ی محو، فقط برای عمق بصری */}
      <div
        className="pointer-events-none absolute -top-20 -start-20 w-72 h-72 rounded-full bg-white/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -end-10 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-10">
          {/* سمت متن و عنوان — دقیقاً در ابتدای ردیف، نه وسط‌چین */}
          <div className="text-center md:text-start md:max-w-xl lg:max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-bold mb-4">
              <Gift className="h-3.5 w-3.5" />
              {t('banner.eyebrow')}
            </span>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-snug mb-3">
              {t('banner.title')}
            </h2>

            <p className="text-blue-100 text-sm md:text-base mb-5">{t('banner.subtitle')}</p>

            {/* نشان‌های اعتماد — همون سه مورد «بدون ثبت اطلاعات / قیمت‌گذاری
                شفاف / پاسخ سریع» که در صفحه‌ی هدایای سفارشی هم هستن؛ اینجا
                هم محتوای واقعی به بنر اضافه می‌کنن، هم فضا رو منطقی‌تر پر
                می‌کنن. */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              {trustChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-blue-50 text-xs font-medium"
                >
                  <chip.icon className="h-3.5 w-3.5 text-amber-300 flex-shrink-0" />
                  {chip.label}
                </span>
              ))}
            </div>

            <Link
              href="/custom-gifts"
              className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20"
            >
              {t('banner.cta')}
              <ArrowLeft
                className={`h-4 w-4 transition-transform group-hover:${isEn ? 'translate-x-1' : '-translate-x-1'} ${isEn ? 'rotate-180' : ''}`}
              />
            </Link>
          </div>

          {/* سمت آیکون — دقیقاً در انتهای ردیف */}
          {/* 🔧 عمداً از next/image استفاده نشده: پایپ‌لاین بهینه‌سازی سمت
              سرور Next.js (/_next/image) روی این PNG خاص (خروجی ابزار حذف
              پس‌زمینه) درست کار نمی‌کرد و تصویر نمایش داده نمی‌شد. با یک
              <img> ساده — دقیقاً مثل ۴ عکس دیگر همین قابلیت — فایل مستقیم
              و بدون پردازش سرور لود می‌شود و مشکل کاملاً برطرف می‌شود. */}
          <div className="flex-shrink-0">
            <div className="relative w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64">
              <img
                src="/images/custom-gifts-banner-icon.png"
                alt={t('banner.icon_alt')}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}