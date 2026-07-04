import { Link } from '@/i18n/navigation';
import { HelpCircle, ShieldAlert, Smartphone, DollarSign, CheckCircle, Wallet, Lock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'CryptoGuide'});
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: t('title'),
    description: t('meta_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}/crypto-guide`,
      languages: {
        'fa': `${siteUrl}/fa/crypto-guide`,
        'en': `${siteUrl}/en/crypto-guide`,
        'x-default': `${siteUrl}/fa/crypto-guide`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('meta_desc'),
      url: `${siteUrl}/${locale}/crypto-guide`,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function CryptoGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'CryptoGuide'});
  const isEn = locale === 'en';

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('hero_title')}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {t('hero_desc')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Why Crypto Block */}
        <section className="bg-orange-50 border border-orange-100 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-orange-600" />
            {t('why_title')}
          </h2>
          <p className="text-gray-700 leading-8 text-justify">
            {t('why_text_1')}
          </p>
          <p className="text-gray-700 leading-8 mt-4 text-justify">
            {t('why_text_2')}
          </p>
        </section>

        {/* Step by Step Guide */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center border-b pb-4">{t('steps_title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 bg-blue-100 text-blue-800 font-bold px-4 py-1 ${isEn ? 'right-auto left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'}`}>1</div>
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Wallet className="h-7 w-7 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-2">{t('step1_title')}</h3>
            <p className="text-sm text-gray-500 text-center leading-6">
              {t('step1_desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 bg-blue-100 text-blue-800 font-bold px-4 py-1 ${isEn ? 'right-auto left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'}`}>2</div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <DollarSign className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-2">{t('step2_title')}</h3>
            <p className="text-sm text-gray-500 text-center leading-6">
              {t('step2_desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 bg-blue-100 text-blue-800 font-bold px-4 py-1 ${isEn ? 'right-auto left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'}`}>3</div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Smartphone className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-2">{t('step3_title')}</h3>
            <p className="text-sm text-gray-500 text-center leading-6">
              {t('step3_desc')}
            </p>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="bg-blue-50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
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