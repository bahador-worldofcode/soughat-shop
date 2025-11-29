import type { Metadata } from 'next';
import { Heart, Globe, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'درباره ما | اولین سامانه ارسال هدیه به ایران با کریپتو',
  description: 'سوغات شاپ پل ارتباطی ایرانیان خارج از کشور برای ارسال هدیه، سوغات و کمک هزینه به خانواده‌ها در ایران. بدون تحریم، سریع و مطمئن.',
  keywords: ['ارسال هدیه به ایران', 'خرید سوغات برای ایران', 'ارسال پول به ایران', 'تحویل در تهران', 'فروشگاه کریپتویی ایران'],
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      {/* Hero Section */}
      <div className="bg-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            درباره <span className="text-blue-600">سوغات شاپ</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ما اینجا هستیم تا مرزها و تحریم‌ها نتوانند جلوی مهر و محبت شما را بگیرند. 
            تخصصی‌ترین سرویس <span className="font-bold text-gray-800">ارسال هدیه به ایران</span> با قدرت بلاک‌چین.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">چرا سوغات شاپ متولد شد؟</h2>
            <p className="text-gray-600 leading-8 text-justify">
              سال‌هاست که ایرانیان مقیم خارج برای <span className="font-bold text-blue-600">ارسال پول به ایران</span> یا فرستادن یک هدیه ساده برای تولد مادر یا پدرشان با مشکلات عجیب و غریبی روبرو هستند. تحریم‌های بانکی، کارمزدهای نجومی صرافی‌ها و دیر رسیدن بسته‌ها، همیشه کام ما را تلخ کرده است.
            </p>
            <p className="text-gray-600 leading-8 text-justify">
              ما تصمیم گرفتیم با استفاده از تکنولوژی روز (ارز دیجیتال)، یک راه امن و سریع بسازیم. در سوغات شاپ، شما از هر جای دنیا (آمریکا، کانادا، اروپا و...) خرید می‌کنید و ما در کمتر از ۴۸ ساعت، سفارش را در <span className="font-bold">ایران</span> تحویل می‌دهیم.
            </p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200">
             <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg"><Globe className="h-6 w-6 text-blue-600"/></div>
                  <div>
                    <h3 className="font-bold text-gray-900">پوشش سراسری در ایران</h3>
                    <p className="text-sm text-gray-500 mt-1">ارسال به تمام شهرهای ایران از تهران تا دورترین نقاط.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg"><ShieldCheck className="h-6 w-6 text-green-600"/></div>
                  <div>
                    <h3 className="font-bold text-gray-900">تضیمن بازگشت وجه</h3>
                    <p className="text-sm text-gray-500 mt-1">اگر هدیه به دست عزیزتان در ایران نرسید، پول شما فوراً عودت داده می‌شود.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg"><Truck className="h-6 w-6 text-purple-600"/></div>
                  <div>
                    <h3 className="font-bold text-gray-900">ارسال سریع و محرمانه</h3>
                    <p className="text-sm text-gray-500 mt-1">بسته‌بندی شیک و بدون فاکتور قیمت برای گیرنده در ایران.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 text-white py-16 mt-10">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold mb-4">همین حالا عزیزان خود را در ایران خوشحال کنید</h2>
          <p className="text-gray-400 mb-8">فاصله فقط یک عدد است. ما این عدد را صفر می‌کنیم.</p>
          <Link href="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            مشاهده محصولات و ارسال به ایران
          </Link>
        </div>
      </div>
    </div>
  );
}