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
    <div className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden px-4 py-24">
      {/* دایره‌های محو تزئینی پس‌زمینه */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />

      <div className="relative flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/60">
          <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-blue-100 opacity-40" />
          <SearchX className="relative h-10 w-10 text-blue-600" strokeWidth={1.75} />
        </div>

        <div className="space-y-3">
          <p className="text-7xl font-black leading-none bg-gradient-to-b from-blue-600 to-blue-200 bg-clip-text text-transparent select-none">
            404
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 leading-7">{t('description')}</p>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            {t('backHome')}
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Package className="h-4 w-4" />
            {t('viewProducts')}
          </Link>
        </div>
      </div>
    </div>
  );
}