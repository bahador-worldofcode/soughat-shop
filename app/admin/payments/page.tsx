'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, Save, Loader2, AlertTriangle, CreditCard, Network } from 'lucide-react';

interface PaymentMethod {
  id: string;
  title: string;
  symbol: string;
  network: string;
  address: string;
  is_active: boolean;
}

export default function PaymentsAdminPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setMethods(data);
    setLoading(false);
  };

  const handleUpdate = async (id: string, updates: Partial<PaymentMethod>) => {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setMethods(methods.map(m => m.id === id ? { ...m, ...updates } : m));
    } catch (err: any) {
      alert('خطا: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // تابع جادویی برای ساخت آدرس آیکون
  const getCryptoIcon = (symbol: string) => {
    // تبدیل به حروف کوچک برای پیدا کردن فایل
    const lowerSymbol = symbol.toLowerCase().trim();
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${lowerSymbol}.png`;
  };

  if (loading) return <div className="p-10 text-center">در حال دریافت اطلاعات درگاه...</div>;

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">مدیریت درگاه‌های پرداخت</h2>
           <p className="text-sm text-gray-500">تنظیمات کامل کیف پول‌ها (عنوان، شبکه و آدرس)</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-1" />
        <div>
            <h4 className="font-bold text-amber-800">نکته بسیار مهم</h4>
            <p className="text-sm text-amber-700">
                سیستم به صورت هوشمند از روی <strong>نماد (Symbol)</strong> لوگو را پیدا می‌کند. مثلاً اگر بنویسید <strong>USDT</strong>، لوگوی تتر نمایش داده می‌شود.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {methods.map((method) => (
          <div key={method.id} className={`bg-white p-6 rounded-2xl border transition-all ${method.is_active ? 'border-blue-200 shadow-md' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
            
            <div className="flex flex-col gap-4">
                
                {/* Header Row: Icon + Title + Symbol + Toggle */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-gray-100 pb-4">
                    
                    {/* آیکون هوشمند */}
                    <div className="relative w-14 h-14 flex-shrink-0">
                        <img 
                            src={getCryptoIcon(method.symbol)} 
                            alt={method.symbol}
                            className="w-full h-full object-contain drop-shadow-sm"
                            onError={(e) => {
                                // اگر عکس پیدا نشد، آیکون پیش‌فرض رو نشون بده
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        {/* آیکون جایگزین (مخفی است مگر اینکه عکس لود نشود) */}
                        <div className="hidden absolute inset-0 w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <Wallet className="h-6 w-6" />
                        </div>
                    </div>

                    {/* Inputs Row 1 */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">عنوان درگاه</label>
                            <input 
                                type="text" 
                                defaultValue={method.title}
                                onBlur={(e) => { if(e.target.value !== method.title) handleUpdate(method.id, { title: e.target.value }) }}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="مثال: Tether"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">نماد ارز (Symbol)</label>
                            <input 
                                type="text" 
                                defaultValue={method.symbol}
                                onBlur={(e) => { 
                                    // با هر بار تغییر نماد، آیکون هم آپدیت میشه
                                    if(e.target.value !== method.symbol) handleUpdate(method.id, { symbol: e.target.value }) 
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                placeholder="USDT"
                            />
                            <span className="text-[10px] text-blue-500">تایپ کنید تا لوگو بیاید</span>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">شبکه (Network)</label>
                            <input 
                                type="text" 
                                defaultValue={method.network}
                                onBlur={(e) => { if(e.target.value !== method.network) handleUpdate(method.id, { network: e.target.value }) }}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Solana"
                            />
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                        <button 
                            onClick={() => handleUpdate(method.id, { is_active: !method.is_active })}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors w-full ${
                                method.is_active 
                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                : 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                            }`}
                        >
                            {method.is_active ? 'فعال است' : 'غیرفعال'}
                        </button>
                        {savingId === method.id && (
                            <span className="text-xs text-blue-600 flex items-center gap-1 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" /> ذخیره...
                            </span>
                        )}
                    </div>
                </div>

                {/* Address Row */}
                <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">آدرس کیف پول ({method.network})</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            defaultValue={method.address}
                            onBlur={(e) => { if(e.target.value !== method.address) handleUpdate(method.id, { address: e.target.value }) }}
                            className="w-full p-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm dir-ltr focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="آدرس کیف پول را اینجا پیست کنید..."
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                             <CreditCard className="h-4 w-4" />
                        </div>
                    </div>
                </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}