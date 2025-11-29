'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, Copy } from 'lucide-react';
import { useStore } from '@/lib/store';

// کامپوننت داخلی برای خواندن پارامترها (منطق اصلی)
function SuccessContent() {
  const { clearCart } = useStore();
  const searchParams = useSearchParams(); // ابزار خواندن URL
  const orderId = searchParams.get('id'); // دریافت شماره سفارش واقعی
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    // اگر شماره واقعی در آدرس بود، آن را نشان بده
    // اگر نبود (مثلاً کسی مستقیم آدرس را زد)، یک کد موقت بساز
    if (orderId) {
      setTrackingCode(orderId);
    } else {
      setTrackingCode('SGT-' + Math.floor(100000 + Math.random() * 900000));
    }

    // پاک کردن سبد خرید
    clearCart();
  }, [clearCart, orderId]);

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
        <span className="text-xs text-gray-400 uppercase tracking-wider">کد رهگیری (Order ID)</span>
        <div className="flex items-center justify-between mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
          {/* نمایش کد به صورت فونت ماشین‌تحریر و با شکستن خط اگر طولانی بود */}
          <span className="text-sm font-mono font-bold text-gray-800 break-all text-left dir-ltr">
            {trackingCode || '...'}
          </span>
          <button onClick={copyToClipboard} className="text-gray-400 hover:text-blue-600 transition-colors ml-2 flex-shrink-0">
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

// بدنه اصلی صفحه (این بخش ضروری است تا نکست‌جی‌اس ارور ندهد)
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-500">در حال دریافت رسید...</div>}>
      <SuccessContent />
    </Suspense>
  );
}