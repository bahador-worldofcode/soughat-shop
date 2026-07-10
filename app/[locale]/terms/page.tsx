import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Terms'});
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: t('title'),
    description: t('header_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}/terms`,
      languages: {
        'fa': `${siteUrl}/fa/terms`,
        'en': `${siteUrl}/en/terms`,
        'x-default': `${siteUrl}/en/terms`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('header_desc'),
      url: `${siteUrl}/${locale}/terms`,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
      // 🔧 رفع «og:image وجود نداره»
      images: [{ url: `${siteUrl}/images/og-default.jpg`, width: 1200, height: 630, alt: t('title') }],
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Terms'});

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <ShieldCheck className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('header_desc')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-10 text-gray-700 leading-8 text-justify">
          
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t('sec1_title')}
            </h2>
            <p className="mb-4">{t('sec1_text')}</p>
            <ul className="list-disc list-inside space-y-2 bg-gray-50 p-4 rounded-lg text-sm">
              <li>{t('sec1_li1')}</li>
              <li>{t('sec1_li2')}</li>
              <li>{t('sec1_li3')}</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              {t('sec2_title')}
            </h2>
            <p>{t('sec2_text')}</p>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm ring-1 ring-blue-50">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              {t('sec3_title')}
            </h2>
            <p className="font-medium text-gray-900 mb-2">{t('sec3_subtitle')}</p>
            <p>{t('sec3_text')}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center text-sm font-bold text-blue-800">
                {t('sec3_opt1')}
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center text-sm font-bold text-green-800">
                {t('sec3_opt2')}
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('sec4_title')}</h2>
            <p>{t('sec4_text')}</p>
          </section>

        </div>

        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <p className="text-gray-500 mb-4">{t('footer_text')}</p>
          <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
             {t('footer_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
}