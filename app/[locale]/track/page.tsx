'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation'; // لینک هوشمند
import { useTranslations, useLocale } from 'next-intl';

interface Order {
  id: string;
  status: string;
  customer_name: string;
  total_price: number;
  created_at: string;
}

export default function TrackPage() {
  const t = useTranslations('Track');
  const locale = useLocale(); // تشخیص زبان برای فرمت تاریخ
  const isEn = locale === 'en';

  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, customer_name, total_price, created_at')
        .ilike('id', `${orderId}%`)
        .single();

      if (error || !data) {
        throw new Error('Not Found');
      }

      setOrder(data);
    } catch (err: any) {
      setError(t('error_not_found'));
    } finally {
      setLoading(false);
    }
  };

  // وضعیت‌های سفارش (ترجمه شده)
  const steps = [
    { status: 'pending', label: t('steps.pending'), icon: Clock },
    { status: 'paid', label: t('steps.paid'), icon: CheckCircle },
    { status: 'sent', label: t('steps.sent'), icon: Truck },
    { status: 'delivered', label: t('steps.delivered'), icon: Package },
  ];

  const getCurrentStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex(s => s.status === status);
  };

  const currentStep = order ? getCurrentStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-2xl">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <form onSubmit={handleTrack} className="flex gap-2">
            <input 
              type="text" 
              placeholder={t('placeholder')}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 outline-none dir-ltr text-center font-mono"
            />
            <button 
              type="submit" 
              disabled={loading || !orderId}
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('btn_track')}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>

        {/* Order Result */}
        {order && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Info */}
            <div className="bg-blue-50 p-6 border-b border-blue-100 flex justify-between items-center flex-wrap gap-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">{t('result_receiver')}</span>
                <span className="font-bold text-gray-900">{order.customer_name}</span>
              </div>
              <div className="text-left">
                <span className="text-xs text-gray-500 block mb-1">{t('result_date')}</span>
                <span className="font-mono text-gray-700 dir-ltr">
                  {new Date(order.created_at).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="p-8">
              {order.status === 'cancelled' ? (
                <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <h3 className="font-bold text-red-700">{t('status_cancelled')}</h3>
                  <p className="text-red-600 text-sm mt-1">{t('status_cancelled_desc')}</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Bar Line */}
                  <div className="absolute right-4 top-0 bottom-0 w-1 bg-gray-200 rounded-full md:hidden"></div> 
                  <div className="hidden md:block absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full"></div> 
                  
                  {/* Steps */}
                  <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                    {steps.map((step, index) => {
                      const isCompleted = index <= currentStep;
                      const isCurrent = index === currentStep;
                      
                      return (
                        <div key={step.status} className="flex md:flex-col items-center gap-4 md:gap-2">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 transition-all ${
                            isCompleted 
                              ? 'bg-green-500 border-green-200 text-white' 
                              : 'bg-white border-gray-200 text-gray-300'
                          }`}>
                            <step.icon className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          
                          <div className={`md:text-center ${isCurrent ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                            <span className="text-sm">{step.label}</span>
                            {isCurrent && <span className="block text-[10px] text-blue-400 animate-pulse font-normal">{t('processing')}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
              <Link href="/contact" className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1">
                 {t('contact_support')}
              </Link>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center">
             <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className={`h-4 w-4 ${isEn ? 'rotate-180 mr-1' : 'ml-1'}`} />
                {t('btn_home') || 'بازگشت به خانه'}
             </Link>
        </div>

      </div>
    </div>
  );
}