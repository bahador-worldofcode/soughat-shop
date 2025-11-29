'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, RefreshCw, DollarSign, Clock, AlertCircle } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  last_updated: string;
  is_base: boolean;
}

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    const { data } = await supabase
      .from('currencies')
      .select('*')
      .order('code');
    if (data) setCurrencies(data);
    setLoading(false);
  };

  // 1. دریافت نرخ واقعی از اینترنت (API رایگان)
  const fetchFromInternet = async () => {
    setUpdating(true);
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await res.json();
      const rates = data.rates;

      // آپدیت استیت لوکال با نرخ‌های جدید
      const newCurrencies = currencies.map(c => {
        if (c.is_base) return c; // دلار تغییر نمی‌کند
        if (rates[c.code]) {
          return { ...c, rate: rates[c.code] };
        }
        return c;
      });

      setCurrencies(newCurrencies);
      alert('نرخ‌ها از بازار جهانی دریافت شد. برای اعمال در سایت دکمه "ذخیره تغییرات" را بزنید.');
    } catch (error) {
      alert('خطا در دریافت نرخ‌ها. لطفاً اتصال اینترنت را بررسی کنید یا دستی وارد کنید.');
    } finally {
      setUpdating(false);
    }
  };

  // 2. تغییر دستی نرخ
  const handleRateChange = (code: string, newRate: string) => {
    const rate = parseFloat(newRate);
    setCurrencies(currencies.map(c => c.code === code ? { ...c, rate } : c));
  };

  // 3. ذخیره در دیتابیس
  const handleSave = async () => {
    setUpdating(true);
    try {
      for (const currency of currencies) {
        await supabase
          .from('currencies')
          .update({ 
            rate: currency.rate,
            last_updated: new Date().toISOString()
          })
          .eq('code', currency.code);
      }
      await fetchCurrencies(); // رفرش برای اطمینان
      alert('تمامی نرخ‌ها با موفقیت در سایت اعمال شد.');
    } catch (error) {
      alert('خطا در ذخیره‌سازی.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center">در حال بارگذاری تابلوی صرافی...</div>;

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">مدیریت نرخ ارز</h2>
           <p className="text-sm text-gray-500">نرخ تبدیل ارزها نسبت به دلار آمریکا (USD)</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchFromInternet}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
                <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
                بروزرسانی از اینترنت
            </button>
            <button 
                onClick={handleSave}
                disabled={updating}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors"
            >
                <Save className="h-4 w-4" />
                ذخیره تغییرات
            </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p>
            قیمت محصولات در دیتابیس همیشه به <strong>دلار</strong> است. 
            سیستم با استفاده از نرخ‌های زیر، قیمت را برای مشتری تبدیل می‌کند.
            <br/>
            مثال: اگر نرخ یورو 0.95 باشد، محصول 100 دلاری برای مشتری 95 یورو نمایش داده می‌شود.
        </p>
      </div>

      {/* Rates Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currencies.map((currency) => (
            <div key={currency.code} className={`bg-white p-6 rounded-2xl border ${currency.is_base ? 'border-green-200 bg-green-50' : 'border-gray-200'} shadow-sm`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                            {currency.symbol}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{currency.name}</h3>
                            <span className="text-xs font-mono text-gray-400">{currency.code}</span>
                        </div>
                    </div>
                    {currency.is_base && <span className="bg-green-200 text-green-800 text-[10px] px-2 py-1 rounded-full font-bold">ارز پایه</span>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-500">نرخ تبدیل (به ازای 1 دلار)</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            step="0.01"
                            disabled={currency.is_base}
                            value={currency.rate}
                            onChange={(e) => handleRateChange(currency.code, e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed dir-ltr"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{currency.code}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>آخرین آپدیت: {new Date(currency.last_updated).toLocaleTimeString('fa-IR')}</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}