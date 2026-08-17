// مسیر این فایل در پروژه: app/[locale]/first-order-discount/page.tsx
// این یک فایل جدید است — باید در همین مسیر ساخته شود.
// --------------------------------------------------------------
// صفحه‌ی سئومحورِ «کد تخفیف ۱۵٪ سفارش اول». هدف: کسی که توی گوگل چیزهایی
// مثل «ارسال هدیه به ایران با کد تخفیف»، «ارسال پول برای خرجی خانواده به
// ایران تخفیف»، یا «تخفیف سفارش اول سوغات شاپ» جست‌وجو می‌کند، این صفحه
// را ببیند. محتوا عمداً کامل و مستقل از JS نوشته شده (Server Component
// خالص، بدون 'use client') تا هم گوگل هم ربات‌های هوش مصنوعی، همان لحظه‌ی
// اول در HTML خام، همه‌چیز را بخوانند.
//
// بخشِ FAQ با Schema.org FAQPage تزریق می‌شود — دقیقاً همان سوال‌هایی که
// مشتری‌های واقعی می‌پرسند، عیناً همان چیزی که روی صفحه هم دیده می‌شود.
// --------------------------------------------------------------

import {
  Tag,
  Gift,
  Send,
  UserPlus,
  CheckCircle2,
  Sparkles,
  Percent,
  Globe,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  Wallet,
  Truck,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FirstOrderDiscount' });
  const siteUrl = getSiteUrl();

  return {
    title: { absolute: t('meta_title') },
    description: t('meta_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}/first-order-discount`,
      languages: {
        fa: `${siteUrl}/fa/first-order-discount`,
        en: `${siteUrl}/en/first-order-discount`,
        'x-default': `${siteUrl}/en/first-order-discount`,
      },
    },
    openGraph: {
      title: t('meta_title'),
      description: t('meta_desc'),
      url: `${siteUrl}/${locale}/first-order-discount`,
      locale: locale === 'fa' ? 'fa' : 'en',
      type: 'website',
      images: [{ url: `${siteUrl}/images/og-default.jpg`, width: 1200, height: 630, alt: t('meta_title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('meta_desc'),
    },
  };
}

export default async function FirstOrderDiscountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FirstOrderDiscount' });
  const isEn = locale === 'en';
  const siteUrl = getSiteUrl();

  const faqItems = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
    { q: t('faq_q6'), a: t('faq_a6') },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  const faqJsonLdString = JSON.stringify(faqJsonLd).replace(/<\/script/gi, '<\\/script');

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLdString }} />

      {/* ===================== Hero ===================== */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24 text-center border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Percent className="h-4 w-4 text-blue-600" />
            <span className="text-xs md:text-sm font-bold text-blue-700">{t('hero_badge')}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {t('h1')}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-8 mb-8">
            {t('hero_desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 w-full sm:w-auto"
            >
              <UserPlus className="h-5 w-5" />
              {t('hero_cta_signup')}
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all w-full sm:w-auto"
            >
              {t('hero_cta_browse')}
              <ArrowLeft className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </div>

      {/* ===================== بنر اسپلیت ۱: سه قدم تا تخفیف ===================== */}
      <section className="container mx-auto px-4 max-w-6xl mt-16 md:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm mb-4">
              <Sparkles className="h-4 w-4" />
              {t('steps_kicker')}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 leading-tight">
              {t('steps_title')}
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center">1</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('step1_title')}</h3>
                  <p className="text-sm text-gray-500 leading-7">{t('step1_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center">2</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('step2_title')}</h3>
                  <p className="text-sm text-gray-500 leading-7">{t('step2_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center">3</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('step3_title')}</h3>
                  <p className="text-sm text-gray-500 leading-7">{t('step3_desc')}</p>
                </div>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-6 text-blue-600 font-bold text-sm hover:underline"
            >
              {t('hero_cta_signup')}
              <ArrowLeft className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {/* 🖼️ عکس: فایل واقعی را در public/images/ پروژه با همین اسم قرار دهید */}
          <div className="order-first md:order-last">
            <img
              src="/images/first-order-discount-signup-steps.webp"
              alt={t('steps_image_alt')}
              className="w-full aspect-square object-cover rounded-3xl border border-gray-100 shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ===================== بنر اسپلیت ۲: ارسال هدیه به خانواده ===================== */}
      <section className="container mx-auto px-4 max-w-6xl mt-16 md:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <img
              src="/images/first-order-discount-gifts-iran.webp"
              alt={t('gifts_image_alt')}
              className="w-full aspect-square object-cover rounded-3xl border border-gray-100 shadow-lg"
              loading="lazy"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 text-rose-600 font-bold text-sm mb-4">
              <Gift className="h-4 w-4" />
              {t('gifts_kicker')}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 leading-tight">
              {t('gifts_title')}
            </h2>
            <p className="text-gray-600 leading-8 text-justify mb-4">
              {t('gifts_text1')}
            </p>
            <p className="text-gray-600 leading-8 text-justify mb-6">
              {t('gifts_text2')}
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                {t('gifts_point1')}
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                {t('gifts_point2')}
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                {t('gifts_point3')}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===================== بنر اسپلیت ۳: ارسال پول برای خرجی خانواده ===================== */}
      <section className="container mx-auto px-4 max-w-6xl mt-16 md:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm mb-4">
              <Send className="h-4 w-4" />
              {t('money_kicker')}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 leading-tight">
              {t('money_title')}
            </h2>
            <p className="text-gray-600 leading-8 text-justify mb-4">
              {t('money_text1')}
            </p>
            <p className="text-gray-600 leading-8 text-justify mb-6">
              {t('money_text2')}
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                {t('money_point1')}
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                {t('money_point2')}
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                {t('money_point3')}
              </li>
            </ul>
          </div>

          <div className="order-first md:order-last">
            <img
              src="/images/first-order-discount-money-transfer.webp"
              alt={t('money_image_alt')}
              className="w-full aspect-square object-cover rounded-3xl border border-gray-100 shadow-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ===================== نوار مزایای سریع ===================== */}
      <section className="container mx-auto px-4 max-w-6xl mt-16 md:mt-24">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Percent className="h-7 w-7 mx-auto mb-3 text-yellow-300" />
              <p className="font-black text-lg mb-1">{t('perk1_title')}</p>
              <p className="text-blue-100 text-xs leading-6">{t('perk1_desc')}</p>
            </div>
            <div>
              <Truck className="h-7 w-7 mx-auto mb-3 text-yellow-300" />
              <p className="font-black text-lg mb-1">{t('perk2_title')}</p>
              <p className="text-blue-100 text-xs leading-6">{t('perk2_desc')}</p>
            </div>
            <div>
              <ShieldCheck className="h-7 w-7 mx-auto mb-3 text-yellow-300" />
              <p className="font-black text-lg mb-1">{t('perk3_title')}</p>
              <p className="text-blue-100 text-xs leading-6">{t('perk3_desc')}</p>
            </div>
            <div>
              <Globe className="h-7 w-7 mx-auto mb-3 text-yellow-300" />
              <p className="font-black text-lg mb-1">{t('perk4_title')}</p>
              <p className="text-blue-100 text-xs leading-6">{t('perk4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="container mx-auto px-4 max-w-4xl mt-16 md:mt-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-5">
            <HelpCircle className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
            {t('faq_title')}
          </h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-start gap-2 text-sm md:text-base">
                <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                {item.q}
              </h3>
              <p className="text-gray-500 leading-7 text-sm text-justify ps-7">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== CTA پایانی ===================== */}
      <section className="container mx-auto px-4 max-w-3xl mt-16 md:mt-24 text-center">
        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-[2.5rem] p-10 md:p-14">
          <Tag className="h-10 w-10 text-blue-600 mx-auto mb-6" />
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 leading-tight">
            {t('final_cta_title')}
          </h2>
          <p className="text-gray-500 leading-8 mb-8 max-w-xl mx-auto">
            {t('final_cta_desc')}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1"
          >
            <UserPlus className="h-5 w-5" />
            {t('hero_cta_signup')}
          </Link>
        </div>
      </section>
    </div>
  );
}