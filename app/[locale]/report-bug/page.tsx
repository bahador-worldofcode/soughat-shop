import { ArrowLeft, Bug, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import BugReportForm from '@/components/BugReportForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ReportBug' });
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: t('meta_title'),
    description: t('meta_desc'),
    // این یک صفحه‌ی پشتیبانی/عملیاتی است، نه یک صفحه‌ی سئوشده برای جذب ترافیک؛
    // برای همین از ایندکس گوگل کنار گذاشته شده (مثل پنل ادمین)
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/report-bug`,
      languages: {
        fa: `${siteUrl}/fa/report-bug`,
        en: `${siteUrl}/en/report-bug`,
        'x-default': `${siteUrl}/en/report-bug`,
      },
    },
  };
}

export default async function ReportBugPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ReportBug' });
  const isEn = locale === 'en';

  return (
    <div className="bg-gray-50 min-h-screen py-12 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bug className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto leading-relaxed">{t('subtitle')}</p>
        </div>

        <BugReportForm />

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-6">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{t('privacy_note')}</span>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-2">
            {t('back_home')}
            <ArrowLeft className={`h-3.5 w-3.5 ${isEn ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    </div>
  );
}
