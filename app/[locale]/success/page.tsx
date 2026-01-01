'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, Copy } from 'lucide-react';
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

  useEffect(() => {
    if (orderId) {
      setTrackingCode(orderId);
    } else {
      setTrackingCode('SGT-' + Math.floor(100000 + Math.random() * 900000));
    }
    clearCart();
  }, [clearCart, orderId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode);
    alert(t('copy_toast'));
  };

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700">
      
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-green-100 p-6 rounded-full">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
      <p className="text-gray-500 max-w-md mb-8">
        {t('desc')}
      </p>

      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 w-full max-w-sm mb-8 shadow-sm">
        <span className="text-xs text-gray-400 uppercase tracking-wider">{t('code_label')}</span>
        <div className="flex items-center justify-between mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <span className="text-sm font-mono font-bold text-gray-800 break-all text-left dir-ltr">
            {trackingCode || '...'}
          </span>
          <button onClick={copyToClipboard} className="text-gray-400 hover:text-blue-600 transition-colors ml-2 flex-shrink-0">
            <Copy className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {t('note')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
          href="/track" 
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-all"
        >
          <Package className={`h-5 w-5 ${isEn ? 'mr-2' : 'ml-2'}`} />
          {t('btn_track')}
        </Link>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-bold text-white shadow-lg hover:bg-blue-700 transition-all"
        >
          {t('btn_home')}
          <ArrowRight className={`h-5 w-5 ${isEn ? 'rotate-180 ml-2' : 'mr-2'}`} />
        </Link>
      </div>

    </div>
  );
}

export default function SuccessPage() {
  const t = useTranslations('Success');
  return (
    <Suspense fallback={<div className="p-20 text-center text-gray-500">{t('loading')}</div>}>
      <SuccessContent />
    </Suspense>
  );
}