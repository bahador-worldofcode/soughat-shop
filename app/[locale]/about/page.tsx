import { Heart, Globe, ShieldCheck, Truck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'About'});
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: t('title'),
    description: t('hero_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}/about`,
      languages: {
        'fa': `${siteUrl}/fa/about`,
        'en': `${siteUrl}/en/about`,
        'x-default': `${siteUrl}/en/about`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('hero_desc'),
      url: `${siteUrl}/${locale}/about`,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'About'});

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      {/* Hero Section */}
      <div className="bg-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {t('hero_title')} <span className="text-blue-600">{t('hero_brand')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('hero_desc')}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('mission_title')}</h2>
            <p className="text-gray-600 leading-8 text-justify">
              {t('mission_text_1')}
            </p>
            <p className="text-gray-600 leading-8 text-justify">
              {t('mission_text_2')}
            </p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200">
             <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg"><Globe className="h-6 w-6 text-blue-600"/></div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t('feat_global')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('feat_global_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg"><ShieldCheck className="h-6 w-6 text-green-600"/></div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t('feat_guarantee')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('feat_guarantee_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg"><Truck className="h-6 w-6 text-purple-600"/></div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t('feat_express')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('feat_express_desc')}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white py-16 mt-10">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold mb-4">{t('cta_title')}</h2>
          <p className="text-gray-400 mb-8">{t('cta_subtitle')}</p>
          <Link href="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            {t('cta_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
