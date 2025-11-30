'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ShoppingCart, ChevronLeft, Loader2, Globe, FileText, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import CryptoPayment from '@/components/CryptoPayment';

export default function CheckoutPage() {
  // دریافت اطلاعات سبد خرید و تنظیمات ارزی از استور
  const { cart, totalPrice, getSymbol, convertPrice, currency } = useStore();
  // محاسبه قیمت نمایشی (برای نشان دادن به کاربر با ارز انتخابی)
  const displayTotal = totalPrice();
  const symbol = getSymbol();
  
  // محاسبه قیمت واقعی به دلار (برای ذخیره در دیتابیس به عنوان مبنا)
  const totalBaseUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderCountry: '',
    receiverName: '',
    receiverPhone: '',
    city: '',
    address: '',
    notes: '', 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- تابع جدید ثبت سفارش (ارسال به API سرور) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // *** تغییر جدید: اعتبارسنجی دستی قبل از ارسال ***
    // اگر فیلدهای ستاره‌دار خالی باشند، همینجا استوپ می‌زنیم
    if (
      !formData.senderName.trim() ||
      !formData.senderPhone.trim() ||
      !formData.senderCountry.trim() ||
      !formData.receiverName.trim() ||
      !formData.receiverPhone.trim() ||
      !formData.city.trim() ||
      !formData.address.trim()
    ) {
      alert('لطفاً تمام فیلدهای ستاره‌دار (*) را پر کنید.');
      return; // توقف تابع، اجازه نمی‌دهد به خط‌های بعدی برود
    }

    setIsSubmitting(true);

    try {
      // ارسال درخواست به API خودمان (نه مستقیم به دیتابیس)
      // این کار باعث می‌شود مشکل امنیتی RLS حل شود
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: formData.senderName,
          senderPhone: formData.senderPhone,
          senderCountry: formData.senderCountry,
          notes: formData.notes,
          receiverName: formData.receiverName,
          receiverPhone: formData.receiverPhone,
          city: formData.city,
          address: formData.address,
          items: cart,
          totalPrice: totalBaseUSD, // قیمت دلاری
          displayFiatAmount: displayTotal, // قیمتی که مشتری دیده
          displayCurrency: currency, // واحد پولی که مشتری دیده
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'خطا در ارتباط با سرور');
      }

      // اگر موفق بود، آیدی سفارش را می‌گیریم و می‌رویم مرحله پرداخت
      if (result.id) {
        setOrderId(result.id);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error: any) {
      alert('خطا در ثبت سفارش: ' + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // اگر سبد خالی بود، برگرداندن کاربر
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold">سبد خرید خالی است</h1>
        <Link href="/" className="text-blue-600 mt-4 block hover:underline">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-[family-name:var(--font-vazir)]">
      
      {/* نوار وضعیت مراحل */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto pb-2">
        <Link href="/cart" className="flex items-center hover:text-blue-600 whitespace-nowrap">
          <ShoppingCart className="h-4 w-4 ml-1" />
          سبد خرید
        </Link>
        <ChevronLeft className="h-4 w-4" />
        <span className={`${step === 1 ? 'font-bold text-blue-600' : 'text-gray-900'} whitespace-nowrap`}>اطلاعات ارسال</span>
        <ChevronLeft className="h-4 w-4" />
        <span className={`${step === 2 ? 'font-bold text-blue-600' : 'opacity-50'} whitespace-nowrap`}>پرداخت</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ستون راست (فرم و پرداخت) */}
        <div className="lg:col-span-2">
          
          {step === 1 ? (
            /* --- مرحله ۱: فرم اطلاعات --- */
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-green-600 h-7 w-7" />
                تکمیل اطلاعات سفارش
              </h1>
              
              <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* بخش ۱: اطلاعات فرستنده (شما) */}
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
                        <Globe className="h-5 w-5" />
                        ۱. اطلاعات شما (فرستنده)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">نام شما <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="senderName"
                                required
                                placeholder="نام کامل شما"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white"
                                onChange={handleInputChange}
                                value={formData.senderName}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">کشور محل اقامت <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="senderCountry"
                                required
                                placeholder="مثال: آلمان، کانادا"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white"
                                onChange={handleInputChange}
                                value={formData.senderCountry}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">شماره واتساپ / موبایل <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="senderPhone"
                                required
                                dir="ltr"
                                placeholder="+49 ..."
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white text-left font-mono"
                                onChange={handleInputChange}
                                value={formData.senderPhone}
                            />
                        </div>
                    </div>
                </div>

                {/* بخش ۲: اطلاعات گیرنده (ایران) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        ۲. اطلاعات گیرنده (در ایران)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">نام گیرنده <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="receiverName"
                                required
                                placeholder="نام تحویل گیرنده"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                onChange={handleInputChange}
                                value={formData.receiverName}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">موبایل گیرنده <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="receiverPhone"
                                required
                                dir="ltr"
                                placeholder="0912..."
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors text-left font-mono"
                                onChange={handleInputChange}
                                value={formData.receiverPhone}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">استان و شهر <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="city"
                                required
                                placeholder="مثال: تهران، شهرک غرب"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                onChange={handleInputChange}
                                value={formData.city}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">آدرس دقیق و پلاک <span className="text-red-500">*</span></label>
                            <textarea
                                name="address"
                                required
                                rows={2}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                                onChange={handleInputChange}
                                value={formData.address}
                            />
                        </div>
                    </div>
                </div>

                {/* بخش ۳: توضیحات (اختیاری) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                        <FileText className="h-5 w-5" />
                        ۳. توضیحات سفارش (اختیاری)
                    </h3>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">توضیحات تکمیلی</label>
                        <textarea
                            name="notes"
                            rows={3}
                            placeholder="متن کارت هدیه، ساعت تحویل خاص یا هر نکته‌ای که باید بدانیم..."
                            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white transition-colors"
                            onChange={handleInputChange}
                            value={formData.notes}
                            />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full hidden lg:flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all hover:-translate-y-1"
                  >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>در حال ثبت اطلاعات...</span>
                        </>
                    ) : (
                        <>
                            <span>تایید اطلاعات و رفتن به پرداخت</span>
                            <ArrowLeft className="h-5 w-5" />
                        </>
                    )}
                </button>
              </form>
            </>
          ) : (
            /* --- مرحله ۲: پرداخت --- */
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-600 h-7 w-7" />
                درگاه پرداخت کریپتو
              </h1>
              
              {/* ارسال ID واقعی سفارش به کامپوننت پرداخت */}
              <CryptoPayment orderId={orderId} />
              
              <button 
                onClick={() => setStep(1)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-900 underline"
              >
                بازگشت و اصلاح مشخصات
              </button>
            </>
          )}

        </div>

        {/* ستون چپ: فاکتور */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">سفارش شما</h3>
              {step === 1 && (
                <Link href="/cart" className="text-xs text-blue-600 hover:underline">
                  ویرایش سبد
                </Link>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              {mounted && cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm bg-white/50 p-2 rounded border border-blue-100">
                  <span className="text-gray-700 line-clamp-1 flex-1 ml-2">{item.title}</span>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-gray-500">x{item.quantity}</span>
                    <span className="font-medium text-gray-900">
                        {symbol} {convertPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-blue-200 pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-blue-800">
                 <span>هزینه ارسال</span>
                 <span className="text-green-600 font-bold">رایگان</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg text-blue-900 mt-2">
                <span>مبلغ قابل پرداخت</span>
                <span>{mounted ? `${symbol} ${displayTotal}` : '...'}</span>
              </div>
            </div>

            {step === 1 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex lg:hidden items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-all mt-6"
              >
                 {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>ثبت...</span>
                        </>
                    ) : (
                        <>
                            <span>تایید و پرداخت</span>
                            <ArrowLeft className="h-5 w-5" />
                        </>
                    )}
              </button>
            )}
            
            <p className="mt-4 text-center text-xs text-gray-400">
                تضمین بازگشت وجه در صورت نرسیدن کالا
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}