// مسیر این فایل در پروژه: app/[locale]/crypto-guide/page.tsx
// این نسخه شامل ۷ عکس هم هست — جایگزین کامل نسخه‌ی قبلی (بدون عکس) کن.
// نیازی به تغییر next.config نیست چون همه‌ی عکس‌ها از public/ خود پروژه میان (لوکال، نه ریموت).

// مسیر این فایل در پروژه: app/[locale]/crypto-guide/page.tsx
// این فایل رو دقیقاً جایگزین فایل فعلی با همین مسیر بکن (Overwrite کن).
//
// همراه با این فایل، باید فایل‌های fa.json و en.json (که در همین پیام فرستادم)
// رو هم جایگزین messages/fa.json و messages/en.json کنی — چون این صفحه
// محتوایش رو از namespace به اسم CryptoGuide توی همون فایل‌ها می‌خونه.

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  HelpCircle, ShieldAlert, Smartphone, DollarSign, CheckCircle, Wallet, Lock,
  Coins, Globe2, Clock, Send, AlertTriangle, MessageCircle, BookOpen, TrendingDown,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CryptoGuide' });
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    // title.absolute یعنی «همین رو دقیقاً همین‌طوری بفرست، دست لایوت بهش نرسه» —
    // همون الگویی که در products/page.tsx و blog/page.tsx هم استفاده شده.
    title: { absolute: t('title') },
    description: t('meta_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}/crypto-guide`,
      languages: {
        'fa': `${siteUrl}/fa/crypto-guide`,
        'en': `${siteUrl}/en/crypto-guide`,
        'x-default': `${siteUrl}/en/crypto-guide`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('meta_desc'),
      url: `${siteUrl}/${locale}/crypto-guide`,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
      images: [{ url: `${siteUrl}/images/og-default.jpg`, width: 1200, height: 630, alt: t('title') }],
    },
  };
}

export default async function CryptoGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CryptoGuide' });
  const isEn = locale === 'en';

  // آیتم‌های کیف‌پول و ارز، به‌جای آرایه‌ی خام، از کلیدهای جداگانه ساخته می‌شن —
  // دقیقاً همون الگوی flat-key که خود پروژه برای step1/step2/step3 استفاده می‌کرد.
  const wallets = [1, 2, 3, 4, 5].map((n) => ({
    name: t(`wallet${n}_name`),
    desc: t(`wallet${n}_desc`),
  }));

  const steps = [1, 2, 3, 4, 5].map((n) => ({
    title: t(`step${n}_title`),
    desc: t(`step${n}_desc`),
  }));

  const faqItems = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: t(`faq_q${n}`),
    a: t(`faq_a${n}`),
  }));

  // FAQPage structured data — برای اینکه گوگل بتونه این سوال‌ها رو به‌عنوان
  // rich snippet (People Also Ask) توی نتایج جستجو نشون بده.
  const faqSchema = {
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
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('hero_title')}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">{t('hero_desc')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">

        {/* عکس هدر — کاور بصری کل صفحه */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-12 shadow-lg">
          <Image
            src="/images/crypto-guide/crypto-payment-guide-hero.webp"
            alt={isEn ? 'Guide to paying with cryptocurrency to send gifts to Iran' : 'راهنمای پرداخت با ارز دیجیتال برای ارسال هدیه به ایران'}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        {/* کریپتو چیست؟ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Coins className="h-6 w-6 text-blue-600" />
            {t('what_title')}
          </h2>
          <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden mb-6">
            <Image
              src="/images/crypto-guide/what-is-cryptocurrency-explained.webp"
              alt={isEn ? 'Simple explanation of what cryptocurrency is and how it works' : 'توضیح ساده اینکه ارز دیجیتال چیست و چطور کار می‌کند'}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          <p className="text-gray-700 leading-8 text-justify">{t('what_text_1')}</p>
          <p className="text-gray-700 leading-8 mt-4 text-justify">{t('what_text_2')}</p>
        </section>

        {/* چرا الان همه استفاده می‌کنن */}
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-blue-600 rotate-180" />
            {t('mainstream_title')}
          </h2>
          <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden mb-6">
            <Image
              src="/images/crypto-guide/mainstream-crypto-adoption-banking.webp"
              alt={isEn ? 'Growing mainstream adoption of crypto in trusted banking apps' : 'استفاده روزافزون از ارز دیجیتال در اپلیکیشن‌های بانکی معتبر'}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          <p className="text-gray-700 leading-8 text-justify">{t('mainstream_text_1')}</p>
          <p className="text-gray-700 leading-8 mt-4 text-justify">{t('mainstream_text_2')}</p>
        </section>

        {/* چرا کارت بانکی قبول نمی‌کنیم */}
        <section className="bg-orange-50 border border-orange-100 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-orange-600" />
            {t('why_title')}
          </h2>
          <p className="text-gray-700 leading-8 text-justify">{t('why_text_1')}</p>
          <p className="text-gray-700 leading-8 mt-4 text-justify">{t('why_text_2')}</p>
        </section>

        {/* کیف‌پول‌ها */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-600" />
            {t('wallets_title')}
          </h2>
          <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden mb-6">
            <Image
              src="/images/crypto-guide/crypto-wallet-options-comparison.webp"
              alt={isEn ? 'Different wallet options for paying with cryptocurrency' : 'انواع کیف‌پول برای پرداخت با ارز دیجیتال'}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          <p className="text-gray-600 mb-6">{t('wallets_intro')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wallets.map((w, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-1">{w.name}</h3>
                <p className="text-sm text-gray-500 leading-6">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ارزهای پذیرفته‌شده */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            {t('currencies_title')}
          </h2>
          <p className="text-gray-600 mb-6">{t('currencies_intro')}</p>
          <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden mb-6">
            <Image
              src="/images/crypto-guide/supported-cryptocurrencies-icons.webp"
              alt={isEn ? 'Accepted cryptocurrencies including USDT, Bitcoin, and Solana' : 'ارزهای دیجیتال قابل قبول برای پرداخت شامل تتر، بیت‌کوین و سولانا'}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-2">{t('currencies_stablecoins_title')}</h3>
              <p className="text-sm text-gray-700 leading-7">{t('currencies_stablecoins_list')}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-2">{t('currencies_major_title')}</h3>
              <p className="text-sm text-gray-700 leading-7">{t('currencies_major_list')}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">{t('currencies_note')}</p>
        </section>

        {/* کارمزد / محدودیت کشوری / زمان تایید — سه کارت کنار هم */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <DollarSign className="h-7 w-7 text-green-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{t('fees_title')}</h3>
            <p className="text-sm text-gray-500 leading-6">{t('fees_text')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <Globe2 className="h-7 w-7 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{t('restrictions_title')}</h3>
            <p className="text-sm text-gray-500 leading-6">{t('restrictions_text')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <Clock className="h-7 w-7 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">{t('confirmation_title')}</h3>
            <p className="text-sm text-gray-500 leading-6">{t('confirmation_text')}</p>
          </div>
        </section>

        {/* مراحل قدم‌به‌قدم */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center border-b pb-4">{t('steps_title')}</h2>
        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-8">
          <Image
            src="/images/crypto-guide/crypto-payment-steps-infographic.webp"
            alt={isEn ? 'Steps to pay with crypto from order placement to confirmation' : 'مراحل پرداخت با ارز دیجیتال از ثبت سفارش تا تایید'}
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-contain"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((s, i) => {
            const icons = [Send, MessageCircle, Wallet, Smartphone, CheckCircle];
            const Icon = icons[i];
            return (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 bg-blue-100 text-blue-800 font-bold px-4 py-1 ${isEn ? 'right-auto left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'}`}>
                  {i + 1}
                </div>
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Icon className="h-7 w-7 text-gray-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 text-center leading-6">{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* نحوه‌ی ارسال از صرافی */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Send className="h-6 w-6 text-blue-600" />
            {t('exchange_send_title')}
          </h2>
          <p className="text-gray-700 leading-8 text-justify">{t('exchange_send_text')}</p>
        </section>

        {/* هشدار حیاتی شبکه */}
        <section className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-12">
          <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            {t('network_warning_title')}
          </h2>
          <div className="relative w-full aspect-[12/7] rounded-xl overflow-hidden mb-4">
            <Image
              src="/images/crypto-guide/crypto-network-mismatch-warning.webp"
              alt={isEn ? 'Important warning about matching the correct network when sending crypto' : 'هشدار مهم درباره تطابق شبکه هنگام ارسال ارز دیجیتال'}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          <p className="text-red-900/80 leading-8 text-justify">{t('network_warning_text')}</p>
        </section>

        {/* امنیت */}
        <div className="bg-blue-50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="bg-white p-4 rounded-full shadow-md">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">{t('security_title')}</h3>
            <p className="text-gray-600 text-sm leading-6 text-justify">
              {t('security_desc')} <Link href="/terms" className="text-blue-600 underline font-bold">{t('security_link')}</Link>.
            </p>
          </div>
        </div>

        {/* FAQ (همون داده‌ای که توی JSON-LD بالا هم استفاده شد) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center border-b pb-4">{t('faq_title')}</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600 text-sm leading-7">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* لینک به پست وبلاگ مرتبط */}
        <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white p-4 rounded-full shadow-md">
            <BookOpen className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">{t('related_title')}</h3>
            <p className="text-gray-600 text-sm leading-6 mb-3">{t('related_text')}</p>
            <Link
              href="/blog/why-crypto-is-the-smart-way-to-send-gifts-to-iran"
              className="text-indigo-600 underline font-bold text-sm"
            >
              {isEn ? 'Why Crypto Is the Smartest Way to Send Gifts to Iran →' : 'چرا ارز دیجیتال بهترین راه ارسال هدیه به ایرانه؟ ←'}
            </Link>
          </div>
        </section>

        <div className="mt-12 text-center">
          <Link href="/products" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors gap-2 shadow-lg hover:shadow-xl">
            <CheckCircle className="h-5 w-5" />
            {t('cta_btn')}
          </Link>
        </div>

      </div>
    </div>
  );
}