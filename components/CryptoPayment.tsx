'use client';
import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Loader2, CheckCircle, Info, RefreshCw, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface PaymentMethod {
  id: string;
  title: string;
  title_en?: string;
  symbol: string;
  network: string;
  address: string;
}

interface Props {
  orderId: string;
}

export default function CryptoPayment({ orderId }: Props) {
  const t = useTranslations('CryptoPayment');
  const { cart, convertPrice, getSymbol } = useStore();
  const router = useRouter();

  const totalBaseUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const displayPrice = convertPrice(totalBaseUSD);
  const displaySymbol = getSymbol();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const [serverRate, setServerRate] = useState<number | null>(null);
  const [payableAmount, setPayableAmount] = useState<string>('...');
  const [loadingCalc, setLoadingCalc] = useState(false);

  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    async function fetchMethods() {
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true);
      
      if (data && data.length > 0) {
        setMethods(data);
        setSelectedMethod(data[0]);
      }
      setLoadingMethods(false);
    }
    fetchMethods();
  }, []);

  const fetchSecurePrice = useCallback(async () => {
    if (!selectedMethod || !orderId) return;

    setLoadingCalc(true);
    try {
      const res = await fetch('/api/crypto/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          symbol: selectedMethod.symbol
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      setPayableAmount(data.amount);
      setServerRate(data.rate);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoadingCalc(false);
    }
  }, [selectedMethod, orderId]);

  useEffect(() => {
    fetchSecurePrice();
  }, [fetchSecurePrice]);

  // ثبت نهایی و انتقال کاربر به ایستگاه پایانی (صفحه موفقیت)
  const handlePaymentDone = async () => {
    setIsChecking(true);
    try {
        await fetch('/api/orders/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: orderId,
                paymentMethod: selectedMethod?.symbol || 'Crypto'
            })
        });

        // پاکسازی حافظه برای جلوگیری از نشت اطلاعات (State Leak)
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('checkout_draft');

    } catch (e) {
        console.error('Notification failed', e);
    }

    setTimeout(() => {
      router.push(`/success?id=${orderId}`);
    }, 1000);
  };

  const getCryptoIcon = (symbol: string) => {
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase().trim()}.png`;
  };

  if (loadingMethods) return <div className="p-10 text-center flex flex-col items-center"><Loader2 className="animate-spin mb-2" /> {t('loading')}</div>;
  if (methods.length === 0) return <div className="p-10 text-center text-red-500">{t('error_inactive')}</div>;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-lg overflow-hidden font-[family-name:var(--font-vazir)]">
      
      {/* انتخاب ارز */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <h3 className="font-bold text-blue-900 mb-3 text-center">{t('select_title')}</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                selectedMethod?.id === method.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <img src={getCryptoIcon(method.symbol)} className="w-5 h-5" alt="" />
              <span className="uppercase">{method.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        
        {/* نمایش مبلغ نهایی */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-8 space-y-3 relative overflow-hidden">
           {loadingCalc && (
             <div className="absolute inset-0 bg-gray-50/90 flex items-center justify-center z-10 backdrop-blur-sm">
               <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-xs text-blue-600 font-bold">{t('loading_rate')}</span>
               </div>
             </div>
           )}

           <div className="flex justify-between items-center text-gray-500 text-sm">
             <span>{t('fiat_value')}</span>
             <span className="font-mono">{displaySymbol} {displayPrice}</span>
           </div>
           
           <div className="flex justify-between items-center text-gray-900 border-t border-gray-200 pt-3">
              <div className="flex flex-col">
                <span className="font-bold text-sm flex items-center gap-1">
                    <Info className="h-4 w-4 text-blue-500"/> {t('payable')}
                </span>
                
                {selectedMethod?.symbol === 'USDT' ? (
                    <span className="text-[11px] text-green-700 mt-1 bg-green-100 px-2 py-0.5 rounded-md inline-block w-fit font-medium">
                        {t('rate_fixed')}
                    </span>
                ) : (
                  <span className="text-[11px] text-gray-500 mt-1 bg-gray-200 px-2 py-0.5 rounded-md inline-block w-fit">
                        {t('rate_live', { 
                            symbol: selectedMethod?.symbol || '...', 
                            rate: serverRate || 0 
                        })}
                    </span>
                )}
              </div>
             
             <div className="text-right flex items-center gap-2">
                <span className="text-3xl font-black text-blue-700 font-mono tracking-tight drop-shadow-sm">
                    {payableAmount} 
                </span>
                <img src={getCryptoIcon(selectedMethod?.symbol || '')} className="w-6 h-6 object-contain" alt="" />
             </div>
           </div>
        </div>

        {selectedMethod && (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
                
                {/* پیام راهنمای مرحله بعد */}
                <div className="flex items-center justify-center gap-2 mb-6 text-blue-800 bg-blue-50 px-4 py-4 rounded-xl border border-blue-200 w-full text-center shadow-sm">
                    <ShieldCheck className="h-6 w-6 flex-shrink-0" />
                    <span className="text-sm font-bold leading-6">{t('security_msg')}</span>
                </div>

                {/* دکمه اتمام فرآیند در سایت */}
                <button
                    onClick={handlePaymentDone}
                    disabled={isChecking}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 hover:-translate-y-1"
                >
                    {isChecking ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                    {isChecking ? t('btn_checking') : t('btn_final_submit')}
                </button>
                
                <button 
                    onClick={fetchSecurePrice}
                    className="mt-6 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                    <RefreshCw className="h-3 w-3" />
                    <span>{t('refresh_rate')}</span>
                </button>
            </div>
        )}

      </div>
    </div>
  );
}