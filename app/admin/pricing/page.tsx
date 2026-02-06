'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calculator, Save, RefreshCw, DollarSign, TrendingUp, Truck, AlertCircle, Loader2, Wifi, Gem } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  price_toman: number;
  image: string;
  pricing_type?: string; // اضافه شد برای تشخیص محصولات طلا
}

interface PricingSettings {
  dollar_rate: number;
  profit_margin: number;
  shipping_base: number;
  gold_markup_percent: number; // اضافه شد
}

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<PricingSettings>({
    dollar_rate: 100000,
    profit_margin: 25,
    shipping_base: 300000,
    gold_markup_percent: 40 // مقدار پیش‌فرض
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // 1. تنظیمات
    const { data: settingsData } = await supabase.from('site_settings').select('*');
    const newSettings: any = { ...settings };
    
    if (settingsData) {
      settingsData.forEach(item => {
        if (item.key === 'dollar_rate') newSettings.dollar_rate = Number(item.value);
        if (item.key === 'profit_margin') newSettings.profit_margin = Number(item.value);
        if (item.key === 'shipping_base') newSettings.shipping_base = Number(item.value);
        if (item.key === 'gold_markup_percent') newSettings.gold_markup_percent = Number(item.value);
      });
      setSettings(newSettings);
    }

    // 2. محصولات (pricing_type اضافه شد)
    const { data: productsData } = await supabase
      .from('products')
      .select('id, title, price, price_toman, image, pricing_type')
      .order('created_at', { ascending: false });
      
    if (productsData) setProducts(productsData);
    setLoading(false);
  };

  // 🌐 تابع دریافت نرخ تتر/دلار از API
  const fetchLiveRate = async () => {
    setFetchingRate(true);
    try {
      const response = await fetch('https://api.tetherland.com/currencies');
      const data = await response.json();
      const usdtPrice = data.data.currencies.USDT.price; 
      
      if (usdtPrice) {
        const roundedPrice = Math.ceil(Number(usdtPrice) / 100) * 100;
        setSettings({ ...settings, dollar_rate: roundedPrice });
        alert(`نرخ لحظه‌ای تتر دریافت شد: ${roundedPrice.toLocaleString()} تومان`);
      } else {
        throw new Error('فرمت پاسخ ناخوانا بود');
      }
    } catch (error) {
      console.error(error);
      alert('خطا در دریافت نرخ خودکار. لطفاً دستی وارد کنید یا فیلترشکن را بررسی کنید.');
    } finally {
      setFetchingRate(false);
    }
  };

  const calculateUSD = (tomanPrice: number) => {
    if (!tomanPrice || tomanPrice === 0) return 0;
    const cost = tomanPrice + settings.shipping_base;
    const inUSD = cost / settings.dollar_rate;
    const withProfit = inUSD * (1 + settings.profit_margin / 100);
    return Math.round(withProfit * 100) / 100;
  };

  const handleApplyChanges = async () => {
    if (!confirm(`قیمت دلار روی ${settings.dollar_rate.toLocaleString()} تومان تنظیم شده است.\nآیا مطمئن هستید که می‌خواهید قیمت محصولات عادی را بروزرسانی کنید؟\n(قیمت محصولات طلا دست‌نخورده باقی می‌ماند)`)) return;
    
    setSaving(true);
    try {
      // 1. ذخیره تمام تنظیمات (شامل ضریب طلا)
      const settingsUpdates = [
        { key: 'dollar_rate', value: String(settings.dollar_rate) },
        { key: 'profit_margin', value: String(settings.profit_margin) },
        { key: 'shipping_base', value: String(settings.shipping_base) },
        { key: 'gold_markup_percent', value: String(settings.gold_markup_percent) }, // ذخیره ضریب جدید طلا
      ];
      
      for (const item of settingsUpdates) {
        await supabase.from('site_settings').upsert(item, { onConflict: 'key' });
      }

      // 2. آپدیت محصولات عادی (محافظت از طلا)
      let updatedCount = 0;
      for (const product of products) {
        // حیاتی: اگر محصول طلا بود، از آپدیت قیمتش صرف نظر کن
        if (product.pricing_type === 'gold') continue;

        const newUSDPrice = calculateUSD(product.price_toman);
        await supabase
          .from('products')
          .update({ price_toman: product.price_toman, price: newUSDPrice })
          .eq('id', product.id);
        
        updatedCount++;
      }

      alert(`✅ تنظیمات ذخیره شد.\nتعداد ${updatedCount} محصول عادی با نرخ دلار جدید هماهنگ شدند.\nمحصولات طلا طبق فرمول خودکار آپدیت خواهند شد.`);
      await fetchData();

    } catch (error: any) {
      alert('خطا: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleProductChange = (id: string, newToman: string) => {
    const val = parseInt(newToman) || 0;
    setProducts(products.map(p => p.id === id ? { ...p, price_toman: val } : p));
  };

  if (loading) return <div className="p-10 text-center">در حال بارگذاری موتور قیمت‌گذاری...</div>;

  return (
    <div className="space-y-8 font-[family-name:var(--font-vazir)] pb-20">
      
      <div>
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            موتور قیمت‌گذاری هوشمند
         </h2>
         <p className="text-sm text-gray-500 mt-1">مدیریت نرخ ارز و محاسبه خودکار قیمت نهایی محصولات</p>
      </div>

      {/* Control Room */}
      <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-blue-700 pb-2">
            <RefreshCw className="h-5 w-5" /> متغیرهای بازار
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Dollar Rate */}
            <div>
                <label className="text-xs text-blue-200 mb-1 flex justify-between">
                    <span>نرخ روز دلار (تومان)</span>
                    <span className="text-[10px] bg-blue-800 px-2 rounded-full">قابل ویرایش</span>
                </label>
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="number" 
                            value={settings.dollar_rate}
                            onChange={(e) => setSettings({...settings, dollar_rate: Number(e.target.value)})}
                            className="w-full p-3 rounded-xl text-gray-900 font-mono font-bold text-lg outline-none focus:ring-4 focus:ring-blue-500/50"
                        />
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                    <button 
                        onClick={fetchLiveRate}
                        disabled={fetchingRate}
                        title="دریافت نرخ لحظه‌ای"
                        className="bg-blue-500 hover:bg-blue-400 text-white p-3 rounded-xl transition-colors shadow-lg disabled:opacity-50"
                    >
                        {fetchingRate ? <Loader2 className="h-6 w-6 animate-spin" /> : <Wifi className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* 2. Profit Margin (Normal) */}
            <div>
                <label className="text-xs text-blue-200 mb-1 block">سود محصولات عادی (%)</label>
                <div className="relative">
                    <input 
                        type="number" 
                        value={settings.profit_margin}
                        onChange={(e) => setSettings({...settings, profit_margin: Number(e.target.value)})}
                        className="w-full p-3 rounded-xl text-gray-900 font-mono font-bold text-lg outline-none focus:ring-4 focus:ring-blue-500/50"
                    />
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
            </div>

             {/* 3. Gold Markup (New) */}
             <div className="relative">
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse z-10">جدید</div>
                <label className="text-xs text-yellow-300 mb-1 block font-bold">ضریب امنیت طلا (%)</label>
                <div className="relative">
                    <input 
                        type="number" 
                        value={settings.gold_markup_percent}
                        onChange={(e) => setSettings({...settings, gold_markup_percent: Number(e.target.value)})}
                        className="w-full p-3 rounded-xl text-gray-900 font-mono font-bold text-lg outline-none focus:ring-4 focus:ring-yellow-500/50 border-2 border-yellow-500/50"
                    />
                    <Gem className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-600 h-5 w-5" />
                </div>
                <p className="text-[9px] text-blue-300 mt-1">شامل اجرت ساخت + سود فروشنده</p>
            </div>

            {/* 4. Shipping Cost */}
            <div>
                <label className="text-xs text-blue-200 mb-1 block">هزینه ثابت ارسال (تومان)</label>
                <div className="relative">
                    <input 
                        type="number" 
                        value={settings.shipping_base}
                        onChange={(e) => setSettings({...settings, shipping_base: Number(e.target.value)})}
                        className="w-full p-3 rounded-xl text-gray-900 font-mono font-bold text-lg outline-none focus:ring-4 focus:ring-blue-500/50"
                    />
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
            </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky top-4 z-20 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-blue-100 shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>قیمت خرید تومانی محصولات را در جدول زیر تغییر دهید.</span>
          </div>
          <button 
            onClick={handleApplyChanges}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
            {saving ? 'در حال اعمال...' : 'محاسبه و ذخیره تغییرات'}
          </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                    <th className="px-6 py-4">محصول</th>
                    <th className="px-6 py-4 w-48">قیمت خرید (تومان)</th>
                    <th className="px-6 py-4 font-mono text-xs text-gray-400">فرمول محاسبه</th>
                    <th className="px-6 py-4">قیمت فعلی</th>
                    <th className="px-6 py-4">قیمت جدید</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                    const isGold = product.pricing_type === 'gold';
                    const newCalculatedPrice = calculateUSD(product.price_toman);
                    const priceDiff = newCalculatedPrice - product.price;
                    const isCheaper = priceDiff < 0;
                    const isMoreExpensive = priceDiff > 0;

                    return (
                        <tr key={product.id} className={`hover:bg-gray-50/50 transition-colors ${isGold ? 'bg-yellow-50/30' : ''}`}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={product.image} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">{product.title}</span>
                                        {isGold && <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full mt-1 inline-block">قیمت‌گذاری طلا (خودکار)</span>}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <input 
                                    type="number" 
                                    value={product.price_toman}
                                    onChange={(e) => handleProductChange(product.id, e.target.value)}
                                    disabled={isGold} // قیمت خرید طلا اینجا ویرایش نمی‌شود (وزنی است)
                                    className={`w-full p-2 border rounded-lg text-sm font-mono focus:border-blue-500 outline-none ${isGold ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'}`}
                                />
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400 font-mono dir-ltr">
                                {isGold ? (
                                    <span className="text-yellow-600 flex items-center gap-1">
                                        <Gem className="h-3 w-3" />
                                        نرخ لحظه‌ای طلا + {settings.gold_markup_percent}%
                                    </span>
                                ) : (
                                    <span>{((product.price_toman + settings.shipping_base) / settings.dollar_rate).toFixed(2)}$ + {settings.profit_margin}%</span>
                                )}
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-600">
                                ${product.price}
                            </td>
                            <td className="px-6 py-4">
                                {isGold ? (
                                    <span className="text-xs text-gray-400">محاسبه در سرور</span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className={`font-mono font-bold text-lg ${isMoreExpensive ? 'text-red-500' : isCheaper ? 'text-green-500' : 'text-gray-800'}`}>
                                            ${newCalculatedPrice}
                                        </span>
                                        {isMoreExpensive && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">+{priceDiff.toFixed(2)}</span>}
                                        {isCheaper && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">{priceDiff.toFixed(2)}</span>}
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
}