import { Search, MapPin, Wallet, Gift, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'HowItWorks'});
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: t('title'),
    description: t('header_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}/how-it-works`,
      languages: {
        'fa': `${siteUrl}/fa/how-it-works`,
        'en': `${siteUrl}/en/how-it-works`,
        'x-default': `${siteUrl}/fa/how-it-works`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('header_desc'),
      url: `${siteUrl}/${locale}/how-it-works`,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'HowItWorks'});
  const isEn = locale === 'en';

  // ساخت آرایه مراحل از روی ترجمه‌ها
  const steps = [
    { id: 1, title: t('step1_title'), desc: t('step1_desc'), icon: Search, color: 'bg-blue-100 text-blue-600' },
    { id: 2, title: t('step2_title'), desc: t('step2_desc'), icon: MapPin, color: 'bg-indigo-100 text-indigo-600' },
    { id: 3, title: t('step3_title'), desc: t('step3_desc'), icon: Wallet, color: 'bg-purple-100 text-purple-600' },
    { id: 4, title: t('step4_title'), desc: t('step4_desc'), icon: Gift, color: 'bg-pink-100 text-pink-600' },
    { id: 5, title: t('step5_title'), desc: t('step5_desc'), icon: Truck, color: 'bg-green-100 text-green-600' }
  ];

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      
      {/* Header */}
      <div className="bg-gray-50 py-16 text-center border-b border-gray-200">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
          {t('header_title')}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto px-4">
          {t('header_desc')}
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        
        {/* Steps Timeline */}
        <div className="relative">
          {/* خط اتصال (فقط در دسکتاپ) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gray-100 -translate-x-1/2 rounded-full"></div>

          <div className="space-y-12 relative z-10">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* بخش متن */}
                <div className="flex-1 text-center md:text-right bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow w-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-7 text-sm">{step.desc}</p>
                </div>

                {/* بخش آیکون (دایره وسط) */}
                <div className="relative flex-shrink-0">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className={`absolute top-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${isEn ? '-left-2' : '-right-2'}`}>
                    {step.id}
                  </div>
                </div>

                {/* فضای خالی برای تراز شدن */}
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 bg-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 skew-y-6 transform origin-bottom-left"></div>
          
          <div className="relative z-10">
            <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-300" />
            <h2 className="text-3xl font-bold mb-4">{t('cta_title')}</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              {t('cta_desc')}
            </p>
            <Link href="/products" className="inline-flex items-center bg-white text-blue-600 font-bold py-4 px-10 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
              {t('cta_btn')}
              <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180 ml-2' : 'mr-2'}`} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}