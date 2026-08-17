// مسیر این فایل در پروژه: app/[locale]/trust/page.tsx
// (این فایل جایگزین فایل فعلی همین مسیر می‌شود — کامل جایگزین کنید.)
// --------------------------------------------------------------
// بازطراحی کامل صفحه‌ی «چرا به سوغات شاپ اعتماد کنیم؟». نسخه‌ی قبلی فقط
// ۵ کارتِ کوچکِ کلی‌گو داشت («پشتیبانی انسانی»، «پرداخت امن» و…) که به
// سوالِ واقعیِ مشتری — چرا وقتی درگاه پرداختِ رسمی نداریم باید بهمون
// اعتماد کنه — هیچ جوابی نمی‌داد. این نسخه مستقیم همون سوال رو جواب
// می‌ده: چرا نبودِ درگاهِ رسمی ضعف نیست، چرا شفافیتِ تراکنش خودش دلیلِ
// اعتماده، چرا سرعت بخشی از تعهدِ ماست، و ضمانتِ بازگشتِ وجه دقیقاً
// چطور کار می‌کنه. بخشِ FAQ هم با Schema.org FAQPage به گوگل و
// ربات‌های هوش مصنوعی تزریق می‌شه — همون سوال‌هایی که مشتری‌های واقعی
// می‌پرسن، به همون ترتیب که روی صفحه می‌خونن.
// --------------------------------------------------------------
import {
  ShieldCheck,
  Heart,
  Lock,
  Headphones,
  RefreshCcw,
  Wallet,
  CheckCircle,
  ArrowLeft,
  Landmark,
  Zap,
  Eye,
  Clock,
  Calculator,
  CheckCircle2,
  FileText,
  PackageCheck,
  MessageCircle,
  Moon,
  Bot,
  Users,
  HelpCircle,
  X,
  Check,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Trust' });
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    // 🔧 رفع باگ «۲ بار سوغات شاپ در تایتل»: t('title') مقدارش
    // «Why Trust Soughat Shop?» / «چرا به سوغات شاپ اعتماد کنیم؟» هست —
    // یعنی از قبل شامل نام برند. اگه رشته‌ی ساده بدیمش، لایوت دوباره
    // template رو اضافه می‌کنه و برند دو بار تکرار میشه. title.absolute
    // یعنی «همین رو دقیقاً همین‌طوری بفرست، دست لایوت بهش نرسه».
    title: { absolute: t('title') },
    description: t('hero_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}/trust`,
      languages: {
        'fa': `${siteUrl}/fa/trust`,
        'en': `${siteUrl}/en/trust`,
        'x-default': `${siteUrl}/en/trust`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('hero_desc'),
      url: `${siteUrl}/${locale}/trust`,
      locale: locale === 'fa' ? 'fa' : 'en',
      type: 'website',
      images: [{ url: `${siteUrl}/images/og-default.jpg`, width: 1200, height: 630, alt: t('title') }],
    },
  };
}

export default async function TrustPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Trust' });
  const isEn = locale === 'en';

  // کارت‌های خلاصه‌ی سریع — همون ۵ موردِ قبلی، فقط برای نگاهِ اولِ کاربر؛
  // توضیحِ عمیق‌تر و مستدل‌تر هرکدام در بخش‌های پایین‌ترِ همین صفحه می‌آید.
  const quickFeatures = [
    { icon: RefreshCcw, color: 'text-green-600 bg-green-50', title: t('guarantee_title'), desc: t('guarantee_desc') },
    { icon: CheckCircle, color: 'text-blue-600 bg-blue-50', title: t('quality_title'), desc: t('quality_desc') },
    { icon: Lock, color: 'text-purple-600 bg-purple-50', title: t('privacy_title'), desc: t('privacy_desc') },
    { icon: Headphones, color: 'text-orange-600 bg-orange-50', title: t('support_title'), desc: t('support_desc') },
    { icon: Wallet, color: 'text-indigo-600 bg-indigo-50', title: t('secure_title'), desc: t('secure_desc') },
  ];

  const transparencySteps = [
    { icon: Clock, title: t('step1_title'), desc: t('step1_desc') },
    { icon: Calculator, title: t('step2_title'), desc: t('step2_desc') },
    { icon: CheckCircle2, title: t('step3_title'), desc: t('step3_desc') },
    { icon: FileText, title: t('step4_title'), desc: t('step4_desc') },
  ];

  const speedPoints = [
    { icon: PackageCheck, title: t('speed1_title'), desc: t('speed1_desc') },
    { icon: Zap, title: t('speed2_title'), desc: t('speed2_desc') },
    { icon: MessageCircle, title: t('speed3_title'), desc: t('speed3_desc') },
    { icon: Moon, title: t('speed4_title'), desc: t('speed4_desc') },
  ];

  const faqItems = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
    { q: t('faq_q5'), a: t('faq_a5') },
  ];

  // 🆕 Schema.org FAQPage — دقیقاً همون سوال و جوابی که روی صفحه دیده
  // می‌شه، بدون هیچ تفاوتی (طبق دستورالعمل گوگل)، تا هم در نتایج جستجو
  // به شکل آکاردئونی نمایش داده بشه، هم ربات‌های هوش مصنوعی بتونن
  // مستقیم از همین جفت‌های سوال-جواب برای پاسخ به کاربرهاشون استفاده کنن.
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
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-20 text-center border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-md mb-6 animate-in zoom-in duration-500">
            <ShieldCheck className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {t('hero_title')}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-8 mb-8">
            {t('hero_desc')}
          </p>

          {/* پیل‌های سریعِ اعتماد — خلاصه‌ی سه پیامِ اصلیِ کل صفحه در یک نگاه */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs md:text-sm font-bold text-gray-700 shadow-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              {t('hero_pill_speed')}
            </span>
            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs md:text-sm font-bold text-gray-700 shadow-sm">
              <RefreshCcw className="h-4 w-4 text-green-600" />
              {t('hero_pill_guarantee')}
            </span>
            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs md:text-sm font-bold text-gray-700 shadow-sm">
              <Bot className="h-4 w-4 text-indigo-600" />
              {t('hero_pill_ai')}
            </span>
          </div>

          {/* بج ریویوی مستقل Trustpilot */}
          <a
            href="https://www.trustpilot.com/review/soughat.shop"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 hover:bg-green-100 transition-all"
          >
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {isEn ? 'See our independent reviews on Trustpilot' : 'نظرات مستقل مشتریان ما را در Trustpilot ببینید'}
            </span>
          </a>
        </div>
      </div>

      {/* ===================== کارت‌های خلاصه (نسخه‌ی قبلی، برای نگاهِ اول) ===================== */}
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickFeatures.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${item.color}`}>
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 leading-7 text-sm text-justify">
                {item.desc}
              </p>
            </div>
          ))}

          <div className="bg-blue-600 p-8 rounded-3xl shadow-lg flex flex-col justify-center items-center text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <Heart className="h-12 w-12 mb-4 animate-pulse text-red-300 fill-red-300" />
            <h3 className="text-xl font-bold mb-2">{t('cta_card_title')}</h3>
            <p className="text-blue-100 text-sm mb-6">{t('cta_card_desc')}</p>
            <Link href="/products" className="bg-white text-blue-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all w-full flex items-center justify-center gap-2">
              {t('cta_card_btn')}
              <ArrowLeft className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </div>

      {/* ===================== بنر اسپلیت: روش سنتی در مقابل سوغات شاپ ===================== */}
      <div className="container mx-auto px-4 max-w-6xl mt-20 md:mt-28">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
            {t('compare_title')}
          </h2>
          <p className="text-gray-500 leading-8">
            {t('compare_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 md:rounded-3xl md:overflow-hidden md:shadow-xl md:border md:border-gray-100">
          {/* ستون چپ: روش سنتی */}
          <div className="bg-gray-50 rounded-3xl md:rounded-none p-8 md:p-10 border border-gray-100 md:border-0">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-6">
              <Landmark className="h-7 w-7 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-6">{t('compare_traditional_title')}</h3>
            <ul className="space-y-4">
              {[t('compare_traditional_point1'), t('compare_traditional_point2'), t('compare_traditional_point3')].map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 leading-7">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ستون راست: سوغات شاپ */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl md:rounded-none p-8 md:p-10 text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
              <Zap className="h-7 w-7 text-yellow-300" />
            </div>
            <h3 className="text-lg font-bold mb-6">{t('compare_soughat_title')}</h3>
            <ul className="space-y-4">
              {[t('compare_soughat_point1'), t('compare_soughat_point2'), t('compare_soughat_point3')].map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-blue-50 leading-7">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ===================== شفافیت قدم‌به‌قدم ===================== */}
      <div className="container mx-auto px-4 max-w-6xl mt-20 md:mt-28">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-5">
            <Eye className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
            {t('transparency_title')}
          </h2>
          <p className="text-gray-500 leading-8">
            {t('transparency_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {transparencySteps.map((step, i) => (
            <div key={i} className="relative bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
              <span className="absolute -top-3 -start-3 h-8 w-8 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                {i + 1}
              </span>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <step.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-6">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== سرعت در ذات کار ===================== */}
      <div className="container mx-auto px-4 max-w-6xl mt-20 md:mt-28">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-50 rounded-2xl mb-5">
            <Zap className="h-7 w-7 text-yellow-500" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
            {t('speed_title')}
          </h2>
          <p className="text-gray-500 leading-8">
            {t('speed_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {speedPoints.map((point, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md text-center">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center mb-4 mx-auto">
                <point.icon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{point.title}</h3>
              <p className="text-xs text-gray-500 leading-6">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== بنر بزرگ ضمانت ===================== */}
      <div className="container mx-auto px-4 max-w-6xl mt-20 md:mt-28">
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-2xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

          <div className="relative inline-flex items-center justify-center p-4 bg-white/15 rounded-full mb-6">
            <RefreshCcw className="h-10 w-10" />
          </div>
          <h2 className="relative text-2xl md:text-4xl font-black mb-5 leading-tight max-w-3xl mx-auto">
            {t('guarantee_banner_title')}
          </h2>
          <p className="relative text-green-50 leading-8 max-w-2xl mx-auto">
            {t('guarantee_banner_desc')}
          </p>
        </div>
      </div>

      {/* ===================== اعتبار و بازخورد ===================== */}
      <div className="container mx-auto px-4 max-w-4xl mt-20 md:mt-28">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-5">
            <Users className="h-7 w-7 text-indigo-600" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
            {t('reputation_title')}
          </h2>
        </div>

        <div className="space-y-6">
          <p className="text-gray-600 leading-9 text-justify text-base">
            {t('reputation_p1')}
          </p>
          <div className="flex items-start gap-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6">
            <Bot className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
            <p className="text-gray-700 leading-8 text-sm text-justify">
              {t('reputation_p2')}
            </p>
          </div>
        </div>
      </div>

      {/* ===================== سوالات متداول (FAQ) ===================== */}
      <div className="container mx-auto px-4 max-w-4xl mt-20 md:mt-28">
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
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
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
      </div>

      {/* ===================== یادداشت پایانی، صمیمی ===================== */}
      <div className="container mx-auto px-4 max-w-3xl mt-20 md:mt-28">
        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-[2.5rem] p-10 md:p-14 text-center">
          <Heart className="h-10 w-10 text-red-400 fill-red-400 mx-auto mb-6" />
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-5 leading-tight">
            {t('closing_title')}
          </h2>
          <p className="text-gray-600 leading-9 text-justify md:text-center mb-6">
            {t('closing_text')}
          </p>
          <p className="text-blue-700 font-bold text-sm">{t('closing_signature')}</p>
        </div>
      </div>

      {/* ===================== CTA پایانی ===================== */}
      <div className="container mx-auto px-4 max-w-3xl mt-14 text-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-all hover:-translate-y-1"
        >
          {t('cta_card_btn')}
          <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180' : ''}`} />
        </Link>
      </div>

    </div>
  );
}