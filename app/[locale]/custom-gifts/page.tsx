import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Sparkles, Lock, ShieldCheck, Zap, HelpCircle, Plus, Minus, Compass, Coins, Users, ArrowLeft } from 'lucide-react';
import CustomOrderCalculator from '@/components/CustomOrderCalculator';

// =============================================================================
// صفحه‌ی «هدایای سفارشی» (/custom-gifts)
// =============================================================================
// یک صفحه‌ی کاملاً جدید و مستقل — دقیقاً مطابق الگوی سایر صفحات محتوایی
// پروژه (مثل app/[locale]/trust/page.tsx). هیچ فایل موجودی به‌جز یک خط
// import + یک خط JSX در app/[locale]/(home)/page.tsx برای نمایش بنر،
// تغییر نکرده است.
//
// این صفحه یک Server Component است (برای بهترین سئو و سرعت)؛ فقط بخش
// ماشین‌حساب (که نیاز به state و تعامل کاربر دارد) در یک کامپوننت کلاینتِ
// جدا (components/CustomOrderCalculator.tsx) پیاده شده — دقیقاً همان
// معماریِ «جزیره‌ی تعاملی» که در بقیه‌ی صفحات این پروژه هم دیده می‌شود.
//
// تصاویر مورد نیاز این صفحه (به CUSTOM_GIFTS_SETUP.md مراجعه کنید):
//   public/images/custom-gifts-banner-icon.webp   (در بالای صفحه هم استفاده می‌شود)
//   public/images/custom-gifts-content-1.webp
//   public/images/custom-gifts-content-2.webp
//   public/images/custom-gifts-content-3.webp
//   public/images/custom-gifts-content-4.webp
// =============================================================================

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CustomOrder.meta' });
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${siteUrl}/${locale}/custom-gifts`,
      languages: {
        fa: `${siteUrl}/fa/custom-gifts`,
        en: `${siteUrl}/en/custom-gifts`,
        'x-default': `${siteUrl}/en/custom-gifts`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${siteUrl}/${locale}/custom-gifts`,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
      images: [{ url: `${siteUrl}/images/og-default.jpg`, width: 1200, height: 630, alt: t('title') }],
    },
  };
}

export default async function CustomGiftsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CustomOrder' });
  const isEn = locale === 'en';

  const faqItems = [1, 2, 3, 4, 5].map((n) => ({
    q: t(`faq.q${n}`),
    a: t(`faq.a${n}`),
  }));

  // Schema.org FAQPage — دقیقاً همان الگوی components/FAQ.tsx، فقط برای
  // سوال‌های مخصوص همین صفحه.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const trustItems = [
    { icon: Lock, title: t('trust.item1_title'), desc: t('trust.item1_desc') },
    { icon: ShieldCheck, title: t('trust.item2_title'), desc: t('trust.item2_desc') },
    { icon: Zap, title: t('trust.item3_title'), desc: t('trust.item3_desc') },
  ];

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ---------- Hero ---------- */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-14 md:py-20 text-center border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto mb-6">
            <Image
              src="/images/custom-gifts-banner-icon.webp"
              alt={t('hero.image_alt')}
              fill
              sizes="112px"
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {t('hero.eyebrow')}
          </span>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">{t('hero.title')}</h1>

          <p className="text-lg text-gray-500 leading-8 max-w-2xl mx-auto">{t('hero.subtitle')}</p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {trustItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-3 text-start"
              >
                <item.icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">{item.title}</p>
                  <p className="text-[11px] text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Calculator ---------- */}
      <div id="calculator" className="container mx-auto px-4 max-w-2xl -mt-8 md:-mt-10 relative z-10 mb-16">
        <CustomOrderCalculator />
      </div>

      {/* ---------- SEO Content (۴ تصویر، هر کدام کنار یک بلوک محتوا) ---------- */}
      <section className="border-t border-gray-100 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight text-start">
              {t('seo.main_title')}
            </h2>
            <p className="text-gray-600 leading-8 text-lg text-justify">{t('seo.intro_text')}</p>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-10">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 order-2 md:order-1">
              <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Compass className="h-5 w-5" />
                {t('seo.how_title')}
              </h3>
              <p className="text-gray-700 text-sm leading-7 text-justify">{t('seo.how_text')}</p>
            </div>
            <img
              src="/images/custom-gifts-content-1.webp"
              alt={t('seo.image_alt_1')}
              loading="lazy"
              className="w-full h-64 object-cover rounded-2xl border border-gray-100 shadow-sm order-1 md:order-2"
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-10">
            <img
              src="/images/custom-gifts-content-2.webp"
              alt={t('seo.image_alt_2')}
              loading="lazy"
              className="w-full h-64 object-cover rounded-2xl border border-gray-100 shadow-sm"
            />
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                <Coins className="h-5 w-5" />
                {t('seo.pricing_title')}
              </h3>
              <p className="text-gray-700 text-sm leading-7 text-justify">{t('seo.pricing_text')}</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-10">
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 order-2 md:order-1">
              <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('seo.who_title')}
              </h3>
              <p className="text-gray-700 text-sm leading-7 text-justify">{t('seo.who_text')}</p>
            </div>
            <img
              src="/images/custom-gifts-content-3.webp"
              alt={t('seo.image_alt_3')}
              loading="lazy"
              className="w-full h-64 object-cover rounded-2xl border border-gray-100 shadow-sm order-1 md:order-2"
            />
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-10">
            <img
              src="/images/custom-gifts-content-4.webp"
              alt={t('seo.image_alt_4')}
              loading="lazy"
              className="w-full h-64 object-cover rounded-2xl border border-gray-100 shadow-sm"
            />
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t('seo.security_title')}
              </h3>
              <p className="text-gray-700 text-sm leading-7 text-justify">{t('seo.security_text')}</p>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-400 leading-6">
            <p>{t('seo.keywords')}</p>
          </div>
        </div>
      </section>

      {/* ---------- FAQ (بدون نیاز به JavaScript، با details/summary بومی) ---------- */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('faq.title')}</h2>
            <p className="text-gray-500">{t('faq.subtitle')}</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group border border-gray-200 open:border-blue-200 open:bg-blue-50/30 open:shadow-sm rounded-xl bg-white transition-colors"
              >
                <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden text-start">
                  <span className="font-bold text-sm md:text-base text-gray-700 group-open:text-blue-800">
                    {item.q}
                  </span>
                  <Plus className="h-5 w-5 text-gray-400 flex-shrink-0 group-open:hidden" />
                  <Minus className="h-5 w-5 text-blue-600 flex-shrink-0 hidden group-open:block" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-gray-600 leading-7 text-sm md:text-base border-t border-blue-100 pt-3 text-justify">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-gradient-to-l from-indigo-800 via-blue-800 to-blue-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div
              className="pointer-events-none absolute -top-10 -start-10 w-56 h-56 rounded-full bg-white/5 blur-3xl"
              aria-hidden="true"
            />
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 relative z-10">{t('final_cta.title')}</h2>
            <p className="text-blue-100 mb-8 relative z-10">{t('final_cta.subtitle')}</p>
            <a
              href="#calculator"
              className="relative z-10 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold px-6 py-3 rounded-xl transition-all"
            >
              {t('final_cta.btn')}
              <ArrowLeft className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}