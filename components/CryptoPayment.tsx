'use client';
import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/lib/store';
import { Loader2, Copy, CheckCircle, Wallet, Info, RefreshCw, ScanLine, AlertTriangle, MessageCircle } from 'lucide-react';
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

  const [copied, setCopied] = useState(false);
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 space-y-3 relative overflow-hidden">
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
                        {/* اصلاح خطا: اضافه کردن Fallback برای مقادیر نامشخص */}
                        {t('rate_live', { 
                            symbol: selectedMethod?.symbol || '...', 
                            rate: serverRate || 0 
                        })}
                    </span>
                )}
              </div>
             
             <div className="text-right">
                <span className="text-2xl font-bold text-blue-600 font-mono tracking-tight">
                    {payableAmount} 
                </span>
                <span className="text-sm font-bold ml-1 uppercase text-blue-600">{selectedMethod?.symbol}</span>
             </div>
           </div>
        </div>

        {/* بخش راهنمای پرداخت قبلی - کامنت شد تا حذف نشود */}
        {/*
        <div className="text-center mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center gap-2 text-blue-800 mb-1">
                <ScanLine className="h-5 w-5" />
                <span className="font-bold text-sm">{t('guide_title')}</span>
            </div>
            <p className="text-xs text-gray-500 leading-5">
                {t('guide_desc')}
            </p>
        </div>
        */}

        {selectedMethod && (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
                
                {/* 🌟 بخش جدید واتساپ برای دریافت آدرس کیف پول 🌟 */}
                <div className="text-center mb-6 bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm w-full">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center justify-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-green-700" />
                        {t('manual_pay_title')}
                    </h4>
                    <p className="text-sm text-green-800 leading-relaxed mb-5">
                        {t('manual_pay_desc')}
                    </p>
                    <a 
                        href={`https://wa.me/989168038017?text=${encodeURIComponent(t('whatsapp_message_template', { orderId: orderId }))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-4 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        <MessageCircle className="h-6 w-6" />
                        {t('btn_whatsapp')}
                    </a>
                </div>

                {/* بخش نمایش QR کد و آدرس کیف پول قبلی - کامنت شد تا چیزی حذف نشود */}
                {/* <div className="bg-white p-3 rounded-xl border-2 border-dashed border-gray-300 mb-6 shadow-inner relative group">
                    <QRCodeSVG 
                        value={selectedMethod.address} 
                        size={180}
                        level="H"
                        includeMargin={true}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white p-1 rounded-full shadow-sm">
                            <img src={getCryptoIcon(selectedMethod.symbol)} className="w-8 h-8" alt="" />
                        </div>
                    </div>
                </div>

                <div className="w-full mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">{t('wallet_address')}</span>
                        <span className="font-bold text-sm text-gray-800 uppercase">{selectedMethod.symbol}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                           {t('network')} {selectedMethod.network}
                        </span>
                    </div>

                    {selectedMethod.symbol === 'USDT' && selectedMethod.network === 'Solana' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-center animate-pulse">
                            <div className="text-sm text-amber-800 font-bold flex items-center justify-center gap-2 mb-1">
                                <AlertTriangle className="h-5 w-5" />
                                <span>{t('warning_title')}</span>
                            </div>
                            <p className="text-[11px] text-amber-700 leading-4">
                                {t('warning_desc')}
                            </p>
                        </div>
                    )}

                    <button 
                        onClick={() => handleCopy(selectedMethod.address)}
                        className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 p-3 rounded-xl transition-all group"
                    >
                        <Wallet className="h-5 w-5 text-blue-400 group-hover:text-blue-600" />
                        <span className="font-mono text-sm truncate px-2 dir-ltr">{selectedMethod.address}</span>
                        {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />}
                    </button>
                    {copied && <p className="text-center text-xs text-green-600 mt-1 font-bold animate-pulse">{t('copy_success')}</p>}
                </div>
                */}

                {/* دکمه تایید نهایی */}
                <button
                    onClick={handlePaymentDone}
                    disabled={isChecking}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                    {isChecking ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                    {isChecking ? t('btn_checking') : t('btn_confirm')}
                </button>
                
                <button 
                    onClick={fetchSecurePrice}
                    className="mt-4 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
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