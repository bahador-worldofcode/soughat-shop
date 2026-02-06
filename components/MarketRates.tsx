import { supabase } from '@/lib/supabase';
import { Coins, TrendingUp, DollarSign, Gem, Bitcoin } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function MarketRates() {
  // 1. دریافت ابزارهای ترجمه و زبان
  const t = await getTranslations('MarketRates');
  const locale = await getLocale();
  const isEn = locale === 'en';

  // 2. دریافت داده‌ها از دیتابیس Supabase
  const { data: rates } = await supabase.from('market_rates').select('*');

  // تبدیل آرایه دیتابیس به یک آبجکت برای دسترسی راحت‌تر
  const ratesMap: any = {};
  rates?.forEach(r => { ratesMap[r.key] = r.rate; });

  // 3. تنظیمات نمایشی هر آیتم (داینامیک شده با ترجمه)
  const rateConfig: any = {
    // طلا و فلزات (تومان)
    'gold_18k': { label: t('items.gold_18k'), icon: Gem, color: 'text-yellow-600', type: 'toman', sub: t('sub.gram') },
    'silver':   { label: t('items.silver'), icon: Gem, color: 'text-gray-500', type: 'toman', sub: t('sub.gram') },
    
    // ارزها (تومان)
    'usd': { label: t('items.usd'), icon: DollarSign, color: 'text-green-600', type: 'toman', sub: t('sub.free') },
    'eur': { label: t('items.eur'), icon: DollarSign, color: 'text-blue-600', type: 'toman', sub: t('sub.eu') },
    'gbp': { label: t('items.gbp'), icon: DollarSign, color: 'text-indigo-700', type: 'toman', sub: t('sub.uk') },
    'aed': { label: t('items.aed'), icon: DollarSign, color: 'text-emerald-600', type: 'toman', sub: t('sub.uae') },

    // کریپتو (دلار)
    'btc':  { label: t('items.btc'), icon: Bitcoin, color: 'text-orange-500', type: 'usd', sub: 'BTC' },
    'eth':  { label: t('items.eth'), icon: Coins, color: 'text-purple-600', type: 'usd', sub: 'ETH' },
    'sol':  { label: t('items.sol'), icon: Coins, color: 'text-cyan-600', type: 'usd', sub: 'SOL' },
    'usdt': { label: t('items.usdt'), icon: DollarSign, color: 'text-green-500', type: 'usd', sub: 'USDT' },
  };

  // ترتیب نمایش آیتم‌ها
  const displayOrder = ['gold_18k', 'usd', 'eur', 'aed', 'btc', 'usdt', 'sol', 'eth'];

  // تابع فرمت کردن قیمت‌ها بر اساس زبان
  const formatPrice = (amount: number, type: 'toman' | 'usd') => {
    if (type === 'toman') {
      // فرمت عدد بر اساس زبان کاربر (فارسی یا انگلیسی)
      return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(Math.round(amount));
    } else {
      // دلار همیشه با فرمت استاندارد انگلیسی نمایش داده شود
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
  };

  return (
    <section className="container mx-auto px-4 -mt-6 relative z-20 mb-12 font-[family-name:var(--font-vazir)]">
      <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-3 flex justify-between items-center px-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-400" />
            <span className="font-bold text-sm md:text-base">{t('title')}</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] text-slate-300 uppercase">{t('live_badge')}</span>
          </div>
        </div>

        {/* Grid Items */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 divide-x divide-x-reverse divide-y md:divide-y-0 divide-gray-100" dir={isEn ? 'ltr' : 'rtl'}>
          {displayOrder.map((key) => {
            const config = rateConfig[key];
            const price = ratesMap[key];

            if (!config) return null;

            return (
              <div key={key} className="p-4 flex flex-col items-center justify-center text-center group hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-1 mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                  <span className="text-xs font-bold text-gray-500 whitespace-nowrap">{config.label}</span>
                </div>
                
                <div className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1" dir="ltr">
                   {price ? (
                     <span>{formatPrice(price, config.type)}</span>
                   ) : (
                     <span className="text-gray-300 text-xs">{t('loading')}</span>
                   )}
                   {config.type === 'toman' && (
                     <span className="text-[10px] text-gray-400 font-normal ml-1">{t('unit_toman')}</span>
                   )}
                </div>
                
                <span className="text-[9px] text-gray-400 mt-1">{config.sub}</span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}