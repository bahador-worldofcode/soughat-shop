'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { RefreshCw, Info, Calculator, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CurrencyRatesBanner() {
  const t = useTranslations('CurrencyBanner'); // اتصال به دیکشنری
  const { rates, lastRatesUpdate } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // لیست ارزها (نام‌ها از ترجمه خوانده می‌شود)
  const displayRates = [
    { code: 'EUR', name: t('currencies.EUR'), symbol: '€' },
    { code: 'GBP', name: t('currencies.GBP'), symbol: '£' },
    { code: 'SEK', name: t('currencies.SEK'), symbol: 'kr' },
  ];

  return (
    <section className="container mx-auto px-4 -mt-8 relative z-20 mb-12 font-[family-name:var(--font-vazir)]">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="font-bold">{t('title')}</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-200 bg-blue-800/50 px-3 py-1 rounded-full">
            <RefreshCw className="h-3 w-3" />
            {/* نمایش تاریخ به صورت لوکال (میلادی یا شمسی بر اساس زبان) */}
            <span>{t('last_update')}: {lastRatesUpdate ? new Date(lastRatesUpdate).toLocaleTimeString() : '...'}</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {displayRates.map((currency) => (
              <div key={currency.code} className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center group hover:border-blue-300 transition-colors">
                <div className="text-gray-500 text-xs mb-1">{currency.name}</div>
                <div className="flex justify-center items-center gap-2 dir-ltr font-mono font-bold text-lg text-gray-800">
                  <span className="text-gray-400 text-sm">1 USD =</span>
                  <span>{rates[currency.code]} {currency.symbol}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-900">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              {t('calc_title')}
            </h4>
            <p className="leading-7 opacity-90 text-justify">
              {t('calc_desc')}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs bg-white p-2 rounded-lg border border-blue-100 shadow-sm text-gray-500">
              <Info className="h-4 w-4 text-blue-500" />
              <span>{t('example')}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}