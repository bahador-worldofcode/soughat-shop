'use client';

import { MapPin, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function HomeSEOContent() {
  const t = useTranslations('HomeSEO');
  const locale = useLocale();
  const isEn = locale === 'en';

  return (
    <section className="bg-white border-t border-gray-100 py-16 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Main Title & Intro */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight text-start">
            {t('main_title')}
          </h2>
          <p className="text-gray-600 leading-8 text-lg text-justify">
            {t('intro_text')}
          </p>
        </div>

        {/* How it works (SEO focused) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t('crypto_title')}
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              {t('crypto_text')}
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              {t('guarantee_title')}
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              {t('guarantee_text')}
            </p>
          </div>
        </div>

        {/* Coverage Area */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-red-600" />
            {t('coverage_title')}
          </h3>
          <p className="text-gray-600 leading-7 mb-6 text-start">
            {t('coverage_text')}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {['Tehran', 'Mashhad', 'Isfahan', 'Shiraz', 'Tabriz', 'Karaj', 'Ahvaz', 'Rasht', 'Sari', 'Kerman'].map((city) => (
              <span key={city} className="bg-white px-4 py-2 rounded-lg text-sm font-bold text-gray-700 shadow-sm border border-gray-100 flex items-center gap-1">
                <Globe className="h-3 w-3 text-gray-400" />
                {isEn ? city : city} {/* اینجا می‌توانیم نام شهرها را هم ترجمه کنیم اما فعلا انگلیسی‌ها را لیست کردم */}
              </span>
            ))}
            <span className="bg-white px-4 py-2 rounded-lg text-sm text-gray-500 border border-gray-100">
              {t('cities_other')}
            </span>
          </div>
        </div>

        {/* Final SEO Keywords Footer */}
        <div className="mt-12 text-center text-sm text-gray-400 leading-6">
          <p>
            {t('keywords')}
          </p>
        </div>

      </div>
    </section>
  );
}