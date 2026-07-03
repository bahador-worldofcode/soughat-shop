'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, ArrowRight, Copy, AlertCircle, MessageCircle, ClipboardCheck, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

function SuccessContent() {
  const t = useTranslations('Success');
  const locale = useLocale();
  const isEn = locale === 'en';

  const { clearCart } = useStore();
  const searchParams = useSearchParams(); 
  const orderId = searchParams.get('id'); 
  const [trackingCode, setTrackingCode] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // اگر آیدی سفارش وجود داشت، سبد خرید را پاک کن و کد را نمایش بده
    if (orderId) {
      setTrackingCode(orderId);
      clearCart(); 
    } else {
      // جلوگیری از تولید کدهای فیک
      setIsValid(false); 
    }
  }, [clearCart, orderId]);

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- اگر کاربر بدون سفارش وارد صفحه شد ---
  if (!isValid) {
    return (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700 font-[family-name:var(--font-vazir)]">
            <div className="mb-6 relative">
                <div className="bg-red-50 p-6 rounded-full">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {t('invalid_title')}
            </h1>
            <p className="text-gray-500 max-w-md mb-8 leading-7">
                {t('invalid_desc')}
            </p>
            <Link 
                href="/products" 
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-lg hover:bg-blue-700 transition-all"
            >
                {t('invalid_back_btn')}
            </Link>
        </div>
    )
  }

  // --- عنوان و توضیح صفحه از فایل‌های ترجمه (namespace: Success) ---
  const pageTitle = t('registered_title');
  const pageDesc = t('registered_desc');

  // --- نمایش صفحه برای سفارشات معتبر ---
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700 font-[family-name:var(--font-vazir)]">
      
      {/* آیکون آبی (ثبت سفارش) به جای تیک سبز (پرداخت) */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-blue-100 p-6 rounded-full border-4 border-white shadow-sm">
          <ClipboardCheck className="h-14 w-14 text-blue-600" />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">{pageTitle}</h1>
      <p className="text-gray-600 max-w-md mb-8 leading-8">
        {pageDesc}
      </p>

      {/* باکس نمایش کد پیگیری */}
      <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 w-full max-w-md mb-8 shadow-sm relative overflow-hidden">
        {/* افکت نوری پس‌زمینه باکس */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

        <span className="relative z-10 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full mb-3 inline-block">
            {t('tracking_code_label')}
        </span>
        <div className="relative z-10 flex items-center justify-between mt-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <span className="text-sm font-mono font-bold text-gray-800 break-all text-left dir-ltr">
            {trackingCode || '...'}
          </span>
          <button 
            onClick={copyToClipboard} 
            className={`ml-3 flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border shadow-sm hover:shadow active:scale-95 transition-all text-xs font-bold ${
              copied 
                ? 'bg-green-50 border-green-200 text-green-600' 
                : 'bg-white border-gray-200 text-gray-400 hover:text-blue-600'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>{t('copied_label')}</span>
              </>
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* دکمه‌های اکشن */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        
        {/* دکمه اصلی واتساپ */}
        <a 
            href={`https://wa.me/989168038017?text=${encodeURIComponent(t('whatsapp_order_msg', { code: trackingCode }))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-4 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-200 hover:-translate-y-1"
        >
            <MessageCircle className="h-6 w-6" />
            {t('whatsapp_get_address_btn')}
        </a>

        {/* دکمه‌های فرعی پیگیری و بازگشت */}
        <div className="flex gap-4">
            <Link 
              href="/track" 
              className="flex-1 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Package className={`h-4 w-4 ${isEn ? 'mr-2' : 'ml-2'}`} />
              {t('btn_track')}
            </Link>
            
            <Link 
              href="/" 
              className="flex-1 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              {t('btn_home')}
              <ArrowRight className={`h-4 w-4 ${isEn ? 'rotate-180 ml-2' : 'mr-2'}`} />
            </Link>
        </div>
      </div>

    </div>
  );
}

export default function SuccessPage() {
  const t = useTranslations('Success');
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-500 font-[family-name:var(--font-vazir)]">{t('loading')}</div>}>
      <SuccessContent />
    </Suspense>
  );
}