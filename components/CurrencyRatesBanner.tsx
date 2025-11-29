'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { RefreshCw, Info, DollarSign, TrendingUp, Calculator } from 'lucide-react';

export default function CurrencyRatesBanner() {
  const { rates, lastRatesUpdate } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // لیست ارزهایی که می‌خواهیم نمایش دهیم (به جز دلار که پایه است)
  const displayRates = [
    { code: 'EUR', name: 'یورو اروپا', symbol: '€' },
    { code: 'GBP', name: 'پوند انگلیس', symbol: '£' },
    { code: 'SEK', name: 'کرون سوئد', symbol: 'kr' },
  ];

  return (
    <section className="container mx-auto px-4 -mt-8 relative z-20 mb-12 font-[family-name:var(--font-vazir)]">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="font-bold">تابلوی شفافیت نرخ ارز</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-200 bg-blue-800/50 px-3 py-1 rounded-full">
            <RefreshCw className="h-3 w-3" />
            <span>آخرین بروزرسانی: {lastRatesUpdate ? new Date(lastRatesUpdate).toLocaleTimeString('fa-IR') : 'لحظاتی پیش'}</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* بخش 1: نرخ‌های زنده */}
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

          {/* بخش 2: توضیح نحوه محاسبه (شفاف‌سازی) */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-900">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              سیستم قیمت‌گذاری ما چگونه کار می‌کند؟
            </h4>
            <p className="leading-7 opacity-90 text-justify">
              برای حفظ عدالت، قیمت پایه تمام محصولات در دیتابیس ما به <strong>دلار آمریکا ($)</strong> ثبت شده است.
              <br/>
              وقتی شما واحد پول را تغییر می‌دهید، سیستم به صورت خودکار و بدون کارمزد اضافه، قیمت را در نرخ لحظه‌ای ضرب می‌کند.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs bg-white p-2 rounded-lg border border-blue-100 shadow-sm text-gray-500">
              <Info className="h-4 w-4 text-blue-500" />
              <span>مثال: محصول ۱۰ دلاری × نرخ یورو (۰.۹۵) = قیمت نهایی ۹.۵ یورو</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}