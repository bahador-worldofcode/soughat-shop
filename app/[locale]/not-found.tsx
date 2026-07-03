// app/[locale]/not-found.tsx
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SearchX, Home, Package } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function LocaleNotFound() {
  const t = await getTranslations('NotFound');

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-4 py-24 text-center font-[family-name:var(--font-vazir)]">
      <div className="bg-blue-50 p-6 rounded-full">
        <SearchX className="h-12 w-12 text-blue-500" />
      </div>

      <div className="space-y-2 max-w-md">
        <p className="text-6xl font-black text-blue-100 select-none">404</p>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500 leading-7">{t('description')}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
        >
          <Home className="h-4 w-4" />
          {t('backHome')}
        </Link>

        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
        >
          <Package className="h-4 w-4" />
          {t('viewProducts')}
        </Link>
      </div>
    </div>
  );
}