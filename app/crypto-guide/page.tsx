import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ShieldAlert, Smartphone, DollarSign, CheckCircle, Wallet, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'راهنمای پرداخت با ارز دیجیتال | سوغات شاپ',
  description: 'آموزش تصویری و گام‌به‌گام نحوه پرداخت با تتر (USDT) و سولانا برای ارسال هدیه به ایران. چرا امکان پرداخت با ویزا کارت وجود ندارد؟',
  keywords: ['آموزش پرداخت تتر', 'خرید با ارز دیجیتال', 'ارسال پول به ایران', 'چرا کریپتو', 'راهنمای کیف پول فانتوم'],
};

export default function CryptoGuidePage() {
  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-5xl font-bold mb-4">راهنمای ساده پرداخت با کریپتو</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            چرا نمی‌توانیم از کارت بانکی استفاده کنیم و چطور در ۳ دقیقه با ارز دیجیتال پرداخت کنیم؟
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Why Crypto Block */}
        <section className="bg-orange-50 border border-orange-100 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-orange-600" />
            چرا ویزا کارت و مستر کارت قبول نمی‌کنیم؟
          </h2>
          <p className="text-gray-700 leading-8 text-justify">
            دوست عزیز، همانطور که می‌دانید به دلیل <strong>تحریم‌های بانکی بین‌المللی</strong>، سیستم بانکی ایران به شبکه جهانی متصل نیست. به همین دلیل هیچ فروشگاه اینترنتی که کالا را در داخل ایران تحویل می‌دهد، نمی‌تواند مستقیماً از درگاه‌های بانکی خارجی استفاده کند.
          </p>
          <p className="text-gray-700 leading-8 mt-4">
            ما برای حل این مشکل و برداشتن مرزها، از <strong>تکنولوژی بلاک‌چین (ارز دیجیتال)</strong> استفاده می‌کنیم. این روش نه تنها تحریم‌ها را دور می‌زند، بلکه کارمزد آن بسیار کمتر از صرافی‌های سنتی است.
          </p>
        </section>

        {/* Step by Step Guide */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center border-b pb-4">مراحل پرداخت در ۳ دقیقه</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 font-bold px-4 py-1 rounded-bl-xl">۱</div>
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Wallet className="h-7 w-7 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-2">نصب کیف پول</h3>
            <p className="text-sm text-gray-500 text-center leading-6">
              یک کیف پول روی گوشی خود نصب کنید. پیشنهاد ما <strong>Phantom Wallet</strong> یا <strong>Trust Wallet</strong> است که بسیار ساده و امن هستند.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 font-bold px-4 py-1 rounded-bl-xl">۲</div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <DollarSign className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-2">شارژ حساب</h3>
            <p className="text-sm text-gray-500 text-center leading-6">
              مقداری <strong>Solana (SOL)</strong> یا <strong>Tether (USDT)</strong> بخرید. می‌توانید از صرافی‌هایی مثل Coinbase، Binance یا MoonPay داخل خود کیف پول استفاده کنید.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 font-bold px-4 py-1 rounded-bl-xl">۳</div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Smartphone className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-2">اسکن و پرداخت</h3>
            <p className="text-sm text-gray-500 text-center leading-6">
              در مرحله آخر خرید، یک QR Code به شما نمایش داده می‌شود. با کیف پول خود آن را اسکن کنید و دکمه تایید را بزنید. تمام!
            </p>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="bg-blue-50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white p-4 rounded-full shadow-md">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">آیا این روش امن است؟</h3>
            <p className="text-gray-600 text-sm leading-6 text-justify">
              بله، پرداخت با کریپتو یکی از امن‌ترین روش‌های دنیاست. هیچکس به حساب بانکی شما دسترسی نخواهد داشت و تراکنش شما در شبکه بلاک‌چین ثبت می‌شود که غیرقابل تغییر است. همچنین ما <Link href="/terms" className="text-blue-600 underline font-bold">تضمین بازگشت وجه</Link> داریم.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/products" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors gap-2 shadow-lg hover:shadow-xl">
            <CheckCircle className="h-5 w-5" />
            متوجه شدم، خرید را شروع کنید
          </Link>
        </div>

      </div>
    </div>
  );
}