'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/lib/store';
import { Loader2, Copy, CheckCircle, Wallet, Info, RefreshCw, ScanLine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface PaymentMethod {
  id: string;
  title: string;
  symbol: string;
  network: string;
  address: string;
}

interface Props {
  orderId: string;
}

export default function CryptoPayment({ orderId }: Props) {
  const { cart, convertPrice, getSymbol } = useStore();
  const router = useRouter();

  // قیمت نمایشی جهت اطلاع کاربر
  const totalBaseUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const displayPrice = convertPrice(totalBaseUSD);
  const displaySymbol = getSymbol();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(true);

  // استیت‌های سرور
  const [serverRate, setServerRate] = useState<number | null>(null);
  const [payableAmount, setPayableAmount] = useState<string>('...');
  const [loadingCalc, setLoadingCalc] = useState(false);

  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 1. دریافت روش‌های پرداخت
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

  // 2. محاسبه قیمت
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
      if (!res.ok) throw new Error(data.error || 'خطا');

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

  const handlePaymentDone = () => {
    setIsChecking(true);
    setTimeout(() => {
      router.push(`/success?id=${orderId}`);
    }, 2000);
  };

  // تابع کمکی برای آیکون (دقیقاً مثل ادمین)
  const getCryptoIcon = (symbol: string) => {
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase().trim()}.png`;
  };

  if (loadingMethods) return <div className="p-10 text-center flex flex-col items-center"><Loader2 className="animate-spin mb-2" /> در حال اتصال به درگاه امن...</div>;
  if (methods.length === 0) return <div className="p-10 text-center text-red-500">درگاه موقتاً غیرفعال است.</div>;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-lg overflow-hidden font-[family-name:var(--font-vazir)]">
      
      {/* انتخاب ارز */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <h3 className="font-bold text-blue-900 mb-3 text-center">انتخاب ارز جهت پرداخت</h3>
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
              {/* آیکون کوچک داخل دکمه */}
              <img src={getCryptoIcon(method.symbol)} className="w-5 h-5" alt="" />
              <span className="uppercase">{method.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        
        {/* باکس استعلام قیمت سروری */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 space-y-3 relative overflow-hidden">
           {loadingCalc && (
             <div className="absolute inset-0 bg-gray-50/90 flex items-center justify-center z-10 backdrop-blur-sm">
               <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-xs text-blue-600 font-bold">استعلام نرخ لحظه‌ای...</span>
               </div>
             </div>
           )}

           <div className="flex justify-between items-center text-gray-500 text-sm">
             <span>ارزش سفارش (فیات):</span>
             <span className="font-mono">{displaySymbol} {displayPrice}</span>
           </div>
           
           <div className="flex justify-between items-center text-gray-900 border-t border-gray-200 pt-3">
             <div className="flex flex-col">
                <span className="font-bold text-sm flex items-center gap-1">
                    <Info className="h-4 w-4 text-blue-500"/> مبلغ قابل پرداخت:
                </span>
                
                {selectedMethod?.symbol === 'USDT' ? (
                    <span className="text-[11px] text-green-700 mt-1 bg-green-100 px-2 py-0.5 rounded-md inline-block w-fit font-medium">
                        نرخ ثابت: 1 USDT = $1 USD
                    </span>
                ) : (
                  <span className="text-[11px] text-gray-500 mt-1 bg-gray-200 px-2 py-0.5 rounded-md inline-block w-fit">
                        نرخ لحظه‌ای: 1 {selectedMethod?.symbol} ≈ ${serverRate}
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

        {/* باکس راهنمای پرداخت (ساده) */}
        <div className="text-center mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center gap-2 text-blue-800 mb-1">
                <ScanLine className="h-5 w-5" />
                <span className="font-bold text-sm">نحوه پرداخت</span>
            </div>
            <p className="text-xs text-gray-500 leading-5">
                لطفاً مبلغ فوق را با اسکن بارکد یا کپی آدرس زیر پرداخت کنید.
            </p>
        </div>

        {/* QR Code & Address */}
        {selectedMethod && (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
                
                <div className="bg-white p-3 rounded-xl border-2 border-dashed border-gray-300 mb-6 shadow-inner relative group">
                    <QRCodeSVG 
                        value={selectedMethod.address} 
                        size={180}
                        level="H"
                        includeMargin={true}
                    />
                    {/* لوگوی وسط QR */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white p-1 rounded-full shadow-sm">
                            <img src={getCryptoIcon(selectedMethod.symbol)} className="w-8 h-8" alt="" />
                        </div>
                    </div>
                </div>

                <div className="w-full mb-6">
                    {/* هدر آدرس (بهبود UX) */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">آدرس کیف پول</span>
                        <span className="font-bold text-sm text-gray-800 uppercase">{selectedMethod.symbol}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                           شبکه {selectedMethod.network}
                        </span>
                    </div>

                    <button 
                        onClick={() => handleCopy(selectedMethod.address)}
                        className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 p-3 rounded-xl transition-all group"
                    >
                        <Wallet className="h-5 w-5 text-blue-400 group-hover:text-blue-600" />
                        <span className="font-mono text-sm truncate px-2 dir-ltr">{selectedMethod.address}</span>
                        {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />}
                    </button>
                    {copied && <p className="text-center text-xs text-green-600 mt-1 font-bold animate-pulse">آدرس کپی شد!</p>}
                </div>

                <button
                    onClick={handlePaymentDone}
                    disabled={isChecking}
                    className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                    {isChecking ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                    {isChecking ? 'در حال ثبت تراکنش...' : 'پرداخت را انجام دادم'}
                </button>
                
                <button 
                    onClick={fetchSecurePrice}
                    className="mt-4 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                    <RefreshCw className="h-3 w-3" />
                    <span>بروزرسانی نرخ (استعلام مجدد)</span>
                </button>
            </div>
        )}

      </div>
    </div>
  );
}