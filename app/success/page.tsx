'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Copy } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function SuccessPage() {
  const { clearCart } = useStore();
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    // 1. تولید یک کد رهگیری تصادفی
    const randomCode = 'SGT-' + Math.floor(100000 + Math.random() * 900000);
    setTrackingCode(randomCode);

    // 2. پاک کردن سبد خرید (چون خرید انجام شده)
    clearCart();
  }, [clearCart]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode);
    alert('کد رهگیری کپی شد!');
  };

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700">
      
      {/* آیکون انیمیشنی */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-green-100 p-6 rounded-full">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">پرداخت با موفقیت انجام شد!</h1>
      <p className="text-gray-500 max-w-md mb-8">
        سفارش شما ثبت شد و به زودی پردازش می‌شود. 
        از اینکه سوغات شاپ را انتخاب کردید متشکریم.
      </p>

      {/* کارت کد رهگیری */}
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 w-full max-w-sm mb-8 shadow-sm">
        <span className="text-xs text-gray-400 uppercase tracking-wider">کد رهگیری سفارش</span>
        <div className="flex items-center justify-between mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <span className="text-xl font-mono font-bold text-gray-800 tracking-widest">
            {trackingCode || '...'}
          </span>
          <button onClick={copyToClipboard} className="text-gray-400 hover:text-blue-600 transition-colors">
            <Copy className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * لطفاً این کد را برای پیگیری‌های بعدی ذخیره کنید.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
          href="/track" 
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-all"
        >
          <Package className="ml-2 h-5 w-5" />
          پیگیری سفارش
        </Link>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-lg hover:bg-blue-700 transition-all"
        >
          بازگشت به خانه
          <ArrowRight className="mr-2 h-5 w-5" />
        </Link>
      </div>

    </div>
  );
}