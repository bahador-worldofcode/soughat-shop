import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Gift, Lock, ShieldCheck, Zap } from 'lucide-react';

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
        {/* رفع باگ UI: 
            استفاده از یک مهارکننده‌ی حداکثر عرض (max-w-5xl) باعث میشه 
            که توی مانیتورهای واید تصویر و نوشته ها خیلی از هم فاصله نگیرند 
            و کاربر یک گپ خسته کننده رو حس نکنه. 
        */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10 md:gap-8 lg:gap-12">
          
          {/* سمت متن و عنوان */}
          <div className="text-center md:text-start flex-1 max-w-2xl mx-auto md:mx-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-bold mb-4 shadow-sm">
              <Gift className="h-3.5 w-3.5" />
              {t('banner.eyebrow')}
            </span>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-snug mb-3">
              {t('banner.title')}
            </h2>

            <p className="text-blue-100 text-sm md:text-base mb-6 leading-7">{t('banner.subtitle')}</p>

            {/* نشان‌های اعتماد */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6 md:mb-7">
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
              className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-95"
            >
              {t('banner.cta')}
              <ArrowLeft
                className={`h-4 w-4 transition-transform group-hover:${isEn ? 'translate-x-1' : '-translate-x-1'} ${isEn ? 'rotate-180' : ''}`}
              />
            </Link>
          </div>

          {/* سمت آیکون 
              رفع باگ UI در موبایل: اختصاص w-full و justify-center به والدِ این قسمت 
              موجب میشه روی موبایل این تصویر تمام عرض رو بگیره اما وسط‌چین بمونه و به بغل پرت نشه.
          */}
          <div className="w-full md:w-auto flex justify-center flex-shrink-0">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-72 lg:h-72">
              <img
                src="/images/custom-gifts-banner-icon.png"
                alt={t('banner.icon_alt')}
                className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}