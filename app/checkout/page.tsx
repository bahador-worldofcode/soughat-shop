'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, User, ArrowLeft, ShieldCheck, ShoppingCart, ChevronLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
// ایمپورت کردن کامپوننت پرداخت
import CryptoPayment from '@/components/CryptoPayment';

export default function CheckoutPage() {
  const { cart, totalPrice, getSymbol } = useStore();
  const total = totalPrice();
  const symbol = getSymbol();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // استیت برای مدیریت مرحله (1: فرم آدرس، 2: پرداخت)
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    postalCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // به جای آلرت، به مرحله پرداخت می‌رویم
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold">سبد خرید خالی است</h1>
        <Link href="/" className="text-blue-600 mt-4 block hover:underline">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
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
        
        {/* ستون راست: محتوا بر اساس مرحله تغییر می‌کند */}
        <div className="lg:col-span-2">
          
          {step === 1 ? (
            /* --- مرحله ۱: فرم آدرس --- */
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-green-600 h-7 w-7" />
                اطلاعات گیرنده
              </h1>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <User className="h-4 w-4" /> نام و نام خانوادگی
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="گیرنده در ایران"
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Phone className="h-4 w-4" /> موبایل
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        dir="ltr"
                        placeholder="0912..."
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-left"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> استان و شهر
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="مثال: تهران، ونک"
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">آدرس دقیق و پلاک</label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      onChange={handleInputChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full hidden lg:flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-blue-700 transition-all mt-4"
                  >
                    <span>تایید و رفتن به پرداخت</span>
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* --- مرحله ۲: کامپوننت پرداخت --- */
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-600 h-7 w-7" />
                درگاه پرداخت کریپتو
              </h1>
              {/* فراخوانی کامپوننت جدید */}
              <CryptoPayment />
              
              <button 
                onClick={() => setStep(1)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-900 underline"
              >
                بازگشت و اصلاح آدرس
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
                  ویرایش
                </Link>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              {mounted && cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm bg-white/50 p-2 rounded border border-blue-100">
                  <span className="text-gray-700 line-clamp-1 flex-1 ml-2">{item.title}</span>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-gray-500">x{item.quantity}</span>
                    <span className="font-medium text-gray-900">{symbol} {item.price * item.quantity}</span>
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
                <span>{mounted ? `${symbol} ${total}` : '...'}</span>
              </div>
            </div>

            {/* دکمه موبایل - فقط در مرحله ۱ نمایش داده شود */}
            {step === 1 && (
              <button
                onClick={handleSubmit}
                className="w-full flex lg:hidden items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-blue-700 transition-all mt-6"
              >
                <span>تایید و پرداخت</span>
                <ArrowLeft className="h-5 w-5" />
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