'use client';

// این کامپوننت «بخش محتوای سئوی صفحه محصولات» است — دقیقاً هم‌خانواده‌ی
// components/HomeSEOContent.tsx (که در صفحه اصلی استفاده می‌شود)، با همان
// قرارداد پروژه: تمام متن‌ها از فایل‌های ترجمه (messages/en.json و
// messages/fa.json) خوانده می‌شوند و هیچ متنی داخل خود کامپوننت هاردکد
// نشده است. اگر روزی خواستی متن بنر یا سوالات متداول را عوض کنی، فقط
// کافیست namespace «ProductsSEO» داخل فایل‌های زبان را ویرایش کنی.
//
// ساختار این بخش:
// ۱) بنر تصویری عریض (۲۱:۹ در دسکتاپ) با متن Overlay — برای EN سمت چپ
//    (چون dir صفحه ltr است)، برای FA سمت راست (چون dir صفحه rtl است).
//    این چینش با کلاس‌های منطقی Tailwind مثل justify-start و text-start
//    خودکار انجام می‌شود و نیازی به شرط دستی isEn ندارد.
// ۲) یک بلوک متن غنی سئو (H2 + دو پاراگراف) مخصوص همین صفحه — برای اینکه
//    محتوا با صفحه اصلی (HomeSEOContent) تکراری نشود و گوگل آن را محتوای
//    نازک (Thin/Duplicate Content) تشخیص ندهد.
// ۳) آکاردئون سوالات متداول با تگ‌های بومی <details>/<summary> (بدون
//    نیاز به جاوااسکریپت برای باز/بسته شدن) به همراه Schema.org FAQPage
//    برای Rich Snippet در نتایج گوگل.

import Image from 'next/image';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const FAQ_COUNT = 5;

export default function ProductsSEOContent() {
  const t = useTranslations('ProductsSEO');
  const locale = useLocale();
  const isEn = locale === 'en';

  // 🖼️ فایل‌های واقعی باید داخل public/images پروژه با همین دو اسم قرار بگیرند:
  // public/images/products-banner-en.webp
  // public/images/products-banner-fa.webp
  // پیشنهاد ابعاد: حدود ۲۱۰۰×۹۰۰ پیکسل (نسبت ۲۱:۹) با کیفیت وب‌بهینه.
  const bannerSrc = isEn ? '/images/products-banner-en.webp' : '/images/products-banner-fa.webp';

  const faqItems = Array.from({ length: FAQ_COUNT }, (_, i) => i + 1).map((n) => ({
    q: t(`faq_q${n}`),
    a: t(`faq_a${n}`),
  }));

  // Schema.org FAQPage — همان الگویی که در components/FAQ.tsx و صفحه
  // send-money-to-iran استفاده شده، تا گوگل بتواند این سوال‌وجواب‌ها را
  // مستقیماً در نتایج جستجو نمایش دهد.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <section className="bg-white border-t border-gray-100 py-14 md:py-16 font-[family-name:var(--font-vazir)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="container mx-auto px-4 max-w-5xl">

        {/* ===== ۱) بنر تصویری با متن Overlay ===== */}
        {/* نسبت تصویر: موبایل ۴:۳ (برای جا شدن راحت متن) → sm از ۱۶:۹ →
            دسکتاپ ۲۱:۹ طبق درخواست. اگر روی ۲۱:۹ ثابت می‌ماند، در موبایل
            بنر خیلی کوتاه و متن‌ها بی‌قواره می‌شدند. */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg mb-12 md:mb-16 bg-gray-100">
          <Image
            src={bannerSrc}
            alt={t('banner_alt')}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />

          {/* گرادیانت تیره پشت متن برای خوانایی روی عکس‌های شلوغ —
              جهت گرادیانت فیزیکی است (نه منطقی)، پس این یکی باید صریحاً
              بر اساس زبان انتخاب شود. */}
          <div
            className={
              isEn
                ? 'absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent'
                : 'absolute inset-0 bg-gradient-to-l from-black/75 via-black/30 to-transparent'
            }
          />

          {/* متن Overlay — justify-start/text-start منطقی هستند: خودکار
              چپ می‌شوند وقتی dir=ltr (EN) و خودکار راست می‌شوند وقتی
              dir=rtl (FA)، دقیقاً مطابق خواسته. */}
          <div className="absolute inset-0 flex items-center justify-start p-5 sm:p-8 lg:p-14">
            <div className="max-w-[88%] sm:max-w-md lg:max-w-xl bg-black/25 backdrop-blur-sm rounded-2xl px-5 py-4 sm:px-7 sm:py-6 text-start">
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] mb-2 sm:mb-3">
                {t('banner_title')}
              </h2>
              <p className="text-xs sm:text-sm lg:text-lg text-gray-100 leading-relaxed drop-shadow-[0_1px_5px_rgba(0,0,0,0.65)]">
                {t('banner_subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* ===== ۲) متن غنی سئو ===== */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 leading-tight text-start">
            {t('intro_title')}
          </h2>
          <p className="text-gray-600 leading-8 text-justify mb-4">
            {t('intro_p1')}
          </p>
          <p className="text-gray-600 leading-8 text-justify">
            {t('intro_p2')}
          </p>
        </div>

        {/* ===== ۳) سوالات متداول (آکاردئون با details/summary) ===== */}
        <div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
              <HelpCircle className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {t('faq_title')}
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
              {t('faq_subtitle')}
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group bg-gray-50 hover:bg-white rounded-xl border border-gray-100 open:bg-white open:shadow-sm open:border-blue-100 transition-colors"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-5 font-bold text-sm md:text-base text-gray-800 [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400 group-open:text-blue-600 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="px-5 pb-5 text-gray-600 leading-7 text-sm md:text-base border-t border-gray-100 pt-3 text-justify">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}