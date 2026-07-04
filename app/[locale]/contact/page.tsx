import { MapPin, Phone, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import TicketForm from '@/components/TicketForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Contact'});
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: t('title'),
    description: t('header_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}/contact`,
      languages: {
        'fa': `${siteUrl}/fa/contact`,
        'en': `${siteUrl}/en/contact`,
        'x-default': `${siteUrl}/fa/contact`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('header_desc'),
      url: `${siteUrl}/${locale}/contact`,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Contact'});
  const isEn = locale === 'en';

  return (
    <div className="bg-white min-h-screen py-12 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">{t('header_title')}</h1>
        <p className="text-gray-500 text-center mb-12">{t('header_desc')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          
          {/* کارت تماس */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className={`absolute top-0 bg-green-500 text-white text-[10px] px-2 py-1 ${isEn ? 'right-auto left-0 rounded-br-lg' : 'right-0 rounded-bl-lg'}`}>
                {t('card_phone_badge')}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{t('card_phone_title')}</h3>
            <p className="text-gray-500 text-sm mb-4">{t('card_phone_desc')}</p>
            
            <div className="flex flex-col gap-2 items-center justify-center" dir="ltr">
                <a href="tel:+989168038017" className="text-gray-900 font-bold text-lg hover:text-green-600 transition-colors font-mono">
                    +98 916 803 8017
                </a>
                <a href={`https://wa.me/989168038017?text=${encodeURIComponent(t('whatsapp_msg'))}`} target="_blank" className="text-xs inline-flex items-center text-green-600 hover:underline" dir={isEn ? 'ltr' : 'rtl'}>
                   {t('whatsapp_btn')} <ArrowLeft className={`h-3 w-3 ${isEn ? 'ml-1 rotate-180' : 'mr-1'}`} />
                </a>
            </div>
          </div>

          {/* کارت آدرس */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{t('card_address_title')}</h3>
            <p className="text-gray-500 text-sm mb-4">{t('card_address_desc')}</p>
            <span className="text-gray-700 text-sm block">{t('address_line')}</span>
          </div>

        </div>

        {/* فرم تیکت: جایگزین بخش «تیکت» که قبلاً در ویجت شناور بود.
            حالا هرکسی (چه ایرانی چه خارجی، چه واتساپ داشته باشد چه نه) می‌تواند
            همین‌جا هم شماره تماس و هم ایمیلش را بدهد تا از هر دو طریق قابل پیگیری باشد. */}
        <div className="mb-16">
          <TicketForm />
        </div>

        {/* FAQ Teaser */}
        <div className="text-center bg-blue-50 rounded-xl p-8 border border-blue-100 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('faq_title')}</h2>
          <p className="text-gray-600 mb-6">{t('faq_desc')}</p>
          <Link href="/terms" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {t('faq_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
}