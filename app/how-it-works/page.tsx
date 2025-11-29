import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, MapPin, Wallet, Gift, Truck, CheckCircle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'چطور کار می‌کند؟ | راهنمای ارسال هدیه به ایران',
  description: 'آموزش کامل مراحل خرید، پرداخت با ارز دیجیتال و پیگیری ارسال کالا به ایران در سوغات شاپ.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      title: '۱. انتخاب محصول',
      desc: 'از ویترین فروشگاه، سوغات مورد نظر خود (پسته، زعفران، صنایع دستی و...) را انتخاب کنید و به سبد خرید اضافه کنید.',
      icon: Search,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      title: '۲. ثبت آدرس گیرنده در ایران',
      desc: 'در مرحله تسویه حساب، نام، شماره موبایل و آدرس دقیق عزیزانتان در ایران را وارد کنید. نگران نباشید، اطلاعات محرمانه می‌ماند.',
      icon: MapPin,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 3,
      title: '۳. پرداخت امن با کریپتو',
      desc: 'چون ویزا کارت در ایران کار نمی‌کند، مبلغ را با تتر (USDT) یا سولانا پرداخت می‌کنید. سیستم به صورت خودکار نرخ را محاسبه می‌کند.',
      icon: Wallet,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      title: '۴. آماده‌سازی و بسته‌بندی کادویی',
      desc: 'سفارش شما در انبار تهران پردازش می‌شود. ما آن را در بسته‌بندی شیک کادویی قرار می‌دهیم و کارت پستال شما را روی آن می‌چسبانیم.',
      icon: Gift,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 5,
      title: '۵. تحویل درب منزل',
      desc: 'پیک اختصاصی ما بسته را درب منزل تحویل می‌دهد. شما می‌توانید لحظه به لحظه با کد رهگیری وضعیت را چک کنید.',
      icon: Truck,
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      
      {/* Header */}
      <div className="bg-gray-50 py-16 text-center border-b border-gray-200">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
          ارسال هدیه به ایران، <span className="text-blue-600">ساده‌تر از همیشه</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto px-4">
          بدون نیاز به حساب بانکی در ایران و بدون درگیری با گمرک و پست بین‌الملل.
          ما همه کارها را برای شما انجام می‌دهیم.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        
        {/* Steps Timeline */}
        <div className="relative">
          {/* خط اتصال (فقط در دسکتاپ) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gray-100 -translate-x-1/2 rounded-full"></div>

          <div className="space-y-12 relative z-10">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* بخش متن */}
                <div className="flex-1 text-center md:text-right bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow w-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-7 text-sm">{step.desc}</p>
                </div>

                {/* بخش آیکون (دایره وسط) */}
                <div className="relative flex-shrink-0">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute top-0 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                    {step.id}
                  </div>
                </div>

                {/* فضای خالی برای تراز شدن */}
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 bg-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 skew-y-6 transform origin-bottom-left"></div>
          
          <div className="relative z-10">
            <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-300" />
            <h2 className="text-3xl font-bold mb-4">آماده خوشحال کردن خانواده هستید؟</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              همین حالا اولین سفارش خود را ثبت کنید. تیم ما در تهران منتظر آماده‌سازی هدیه شماست.
            </p>
            <Link href="/products" className="inline-flex items-center bg-white text-blue-600 font-bold py-4 px-10 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
              مشاهده محصولات و شروع خرید
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}