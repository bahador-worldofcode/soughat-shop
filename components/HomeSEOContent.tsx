'use client';

import { MapPin, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function HomeSEOContent() {
  return (
    <section className="bg-white border-t border-gray-100 py-16 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Main Title & Intro */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
            سوغات شاپ: پل مطمئن ارسال هدیه به ایران از سراسر جهان
          </h2>
          <p className="text-gray-600 leading-8 text-lg text-justify">
            آیا تا به حال خواسته‌اید برای تولد مادر، روز پدر یا تبریک سال نو به خانواده‌تان در 
            <span className="font-bold text-gray-800"> ایران </span> 
            هدیه‌ای بفرستید اما با درهای بسته بانکی مواجه شده‌اید؟ 
            <strong>سوغات شاپ (Soughat Shop)</strong> دقیقاً برای حل همین مشکل متولد شده است. 
            ما اولین پلتفرم تخصصی هستیم که به ایرانیان مقیم خارج (کانادا، آمریکا، اروپا، انگلیس و استرالیا) امکان می‌دهد بدون نیاز به کارت‌های بانکی ایرانی و تنها با استفاده از 
            <span className="font-bold text-blue-600"> ارزهای دیجیتال (تتر و سولانا) </span>، 
            بهترین سوغات و هدایا را درب منزل عزیزانشان در ایران تحویل دهند.
          </p>
        </div>

        {/* How it works (SEO focused) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              چرا پرداخت با کریپتو؟
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              به دلیل تحریم‌های بانکی، استفاده از ویزا کارت (Visa) و مستر کارت (MasterCard) برای خرید مستقیم از فروشگاه‌های داخل ایران ممکن نیست. ما این مانع را با تکنولوژی بلاک‌چین دور زده‌ایم. شما می‌توانید مبلغ سفارش را با 
              <strong> تتر (USDT) </strong> یا <strong> سولانا (SOL) </strong> 
              پرداخت کنید. این روش نه تنها ۱۰۰٪ امن و قانونی است، بلکه کارمزد انتقال آن نزدیک به صفر است و پرداخت شما در کمتر از ۳ دقیقه تایید می‌شود.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              تضمین کیفیت و بازگشت وجه
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              ما می‌دانیم که شما هزاران کیلومتر دورتر هستید و روی کیفیت حساسید. تمام محصولات ما (از پسته و زعفران اعلاء گرفته تا صنایع دستی) از بهترین تامین‌کنندگان تهران تهیه می‌شوند. اگر سفارش شما به هر دلیلی (مفقودی یا آسیب در پست) به دست گیرنده نرسد، ما 
              <span className="font-bold"> ضمانت بازگشت ۱۰۰٪ وجه </span> 
              داریم. اعتماد شما، سرمایه ماست.
            </p>
          </div>
        </div>

        {/* Coverage Area */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-red-600" />
            پوشش سراسری ارسال به تمام شهرهای ایران
          </h3>
          <p className="text-gray-600 leading-7 mb-6">
            فرقی نمی‌کند خانواده شما در کدام شهر زندگی می‌کنند. شبکه توزیع سوغات شاپ با همکاری پست پیشتاز و پیک‌های اختصاصی، سفارش شما را در سریع‌ترین زمان ممکن تحویل می‌دهد. ما به تمام کلان‌شهرها و شهرستان‌ها خدمات می‌دهیم:
          </p>
          
          <div className="flex flex-wrap gap-3">
            {['تهران (تحویل فوری)', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'رشت', 'ساری', 'کرمان', 'یزد', 'همدان', 'بندرعباس'].map((city) => (
              <span key={city} className="bg-white px-4 py-2 rounded-lg text-sm font-bold text-gray-700 shadow-sm border border-gray-100 flex items-center gap-1">
                <Globe className="h-3 w-3 text-gray-400" />
                {city}
              </span>
            ))}
            <span className="bg-white px-4 py-2 rounded-lg text-sm text-gray-500 border border-gray-100">
              و سایر شهرهای ایران...
            </span>
          </div>
        </div>

        {/* Final SEO Keywords Footer */}
        <div className="mt-12 text-center text-sm text-gray-400 leading-6">
          <p>
            کلیدواژه‌های مرتبط: ارسال پول به ایران، خرید اینترنتی برای خانواده در ایران، ارسال کادو تولد به ایران، صرافی آنلاین هدایا، خرید پسته صادراتی برای ایران، فروشگاه آنلاین ایرانیان خارج از کشور.
          </p>
        </div>

      </div>
    </section>
  );
}