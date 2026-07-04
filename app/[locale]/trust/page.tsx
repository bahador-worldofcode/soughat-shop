import { ShieldCheck, Heart, Lock, Headphones, RefreshCcw, Wallet, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Trust'});
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: t('title'),
    description: t('hero_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}/trust`,
      languages: {
        'fa': `${siteUrl}/fa/trust`,
        'en': `${siteUrl}/en/trust`,
        'x-default': `${siteUrl}/fa/trust`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('hero_desc'),
      url: `${siteUrl}/${locale}/trust`,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function TrustPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Trust'});
  const isEn = locale === 'en';

  const features = [
    {
      icon: RefreshCcw,
      color: "text-green-600 bg-green-50",
      title: t('guarantee_title'),
      desc: t('guarantee_desc')
    },
    {
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-50",
      title: t('quality_title'),
      desc: t('quality_desc')
    },
    {
      icon: Lock,
      color: "text-purple-600 bg-purple-50",
      title: t('privacy_title'),
      desc: t('privacy_desc')
    },
    {
      icon: Headphones,
      color: "text-orange-600 bg-orange-50",
      title: t('support_title'),
      desc: t('support_desc')
    },
    {
      icon: Wallet,
      color: "text-indigo-600 bg-indigo-50",
      title: t('secure_title'),
      desc: t('secure_desc')
    }
  ];

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-20 text-center border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-md mb-6 animate-in zoom-in duration-500">
            <ShieldCheck className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            {t('hero_title')}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-8">
            {t('hero_desc')}
          </p>
        </div>
      </div>

      {/* Trust Grid */}
      <div className="container mx-auto px-4 -mt-10 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {features.map((item, idx) => (
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

          {/* Card 6: Call to Action (FIXED) */}
          <div className="bg-blue-600 p-8 rounded-3xl shadow-lg flex flex-col justify-center items-center text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <Heart className="h-12 w-12 mb-4 animate-pulse text-red-300 fill-red-300" />
            
            {/* استفاده از ترجمه به جای متن ثابت */}
            <h3 className="text-xl font-bold mb-2">{t('cta_card_title')}</h3>
            <p className="text-blue-100 text-sm mb-6">{t('cta_card_desc')}</p>
            
            <Link href="/products" className="bg-white text-blue-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all w-full flex items-center justify-center gap-2">
               {t('cta_card_btn')}
               <ArrowLeft className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}