import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Gift } from 'lucide-react';

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
// =============================================================================

export default async function CustomOrderBanner() {
  const t = await getTranslations('CustomOrder.banner');
  const locale = await getLocale();
  const isEn = locale === 'en';

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
        {/* 🔧 قبلاً بلاک متن «flex-1» بود، یعنی روی مانیتورهای عریض تمام
            فضای خالی ردیف رو پر می‌کرد و آیکون رو تا لبه‌ی راست هل می‌داد —
            همون گپ بزرگ و بی‌قاعده‌ای که در اسکرین‌شات دیده می‌شد. حالا
            متن یک عرض حداکثر منطقی داره و کل ردیف (متن + آیکون) به‌عنوان
            یک بلوک واحد و با یک gap ثابت و متناسب، وسط‌چین شده. */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-14 max-w-4xl mx-auto">
          {/* سمت متن و عنوان */}
          <div className="text-center md:text-start md:max-w-md lg:max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-bold mb-4">
              <Gift className="h-3.5 w-3.5" />
              {t('eyebrow')}
            </span>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-snug mb-3">
              {t('title')}
            </h2>

            <p className="text-blue-100 text-sm md:text-base mb-6">{t('subtitle')}</p>

            <Link
              href="/custom-gifts"
              className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20"
            >
              {t('cta')}
              <ArrowLeft
                className={`h-4 w-4 transition-transform group-hover:${isEn ? 'translate-x-1' : '-translate-x-1'} ${isEn ? 'rotate-180' : ''}`}
              />
            </Link>
          </div>

          {/* سمت آیکون */}
          {/* 🔧 عمداً از next/image استفاده نشده: پایپ‌لاین بهینه‌سازی سمت
              سرور Next.js (/_next/image) روی این PNG خاص (خروجی ابزار حذف
              پس‌زمینه) درست کار نمی‌کرد و تصویر نمایش داده نمی‌شد. با یک
              <img> ساده — دقیقاً مثل ۴ عکس دیگر همین قابلیت — فایل مستقیم
              و بدون پردازش سرور لود می‌شود و مشکل کاملاً برطرف می‌شود. */}
          <div className="flex-shrink-0">
            <div className="relative w-36 h-36 md:w-48 md:h-48 lg:w-56 lg:h-56">
              <img
                src="/images/custom-gifts-banner-icon.png"
                alt={t('icon_alt')}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}