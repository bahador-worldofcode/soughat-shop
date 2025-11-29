import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';

interface HeroProps {
  banner?: string;
  title?: string;
  subtitle?: string;
}

export default function Hero({ banner, title, subtitle }: HeroProps) {
  // ۱. متن پیش‌فرض با ذکر تتر و سولانا (طبق دستور شما)
  const displayTitle = title || 'فاصله‌ها را با عشق پر کنید';
  const displaySubtitle = subtitle || 'تنها پلتفرم ارسال هدیه به ایران با پرداخت ارزی و کریپتو (USDT / Solana).';

  return (
    <section className="relative overflow-hidden font-[family-name:var(--font-vazir)] min-h-[500px] flex items-center justify-center">
      
      {/* Background Logic */}
      {banner ? (
        <>
          {/* تصویر پس‌زمینه (بدون هیچ هاله سیاه) */}
          <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{ backgroundImage: `url('${banner}')` }}
          />
        </>
      ) : (
        // اگر عکس نبود، گرادینت ساده
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white z-0" />
      )}

      <div className="container mx-auto px-4 text-center relative z-20 pt-10">
        
        {/* Badge */}
        <div className="mx-auto mb-6 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-700 bg-blue-100/80 text-blue-800 shadow-sm border border-blue-200 backdrop-blur-sm">
          <Gift className="mr-2 h-4 w-4" />
          <span>ارسال مطمئن هدیه به سراسر ایران</span>
        </div>

        {/* Main Heading */}
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight text-slate-900 drop-shadow-2xl shadow-white">
          {displayTitle}
        </h1>

        {/* Subheading: باکس شیشه‌ای اختصاصی */}
        <div className="flex justify-center mb-10">
            <p className="max-w-2xl text-lg leading-relaxed dir-ltr text-slate-900 font-bold bg-white/40 backdrop-blur-md border border-white/50 px-6 py-3 rounded-2xl shadow-lg">
              {displaySubtitle}
            </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/products" 
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-700 transition-all w-full sm:w-auto hover:shadow-blue-500/30 hover:-translate-y-1"
          >
            مشاهده محصولات
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Link>
          
          <Link 
            href="/how-it-works" 
            className="inline-flex items-center justify-center rounded-xl border px-8 py-4 text-base font-medium transition-all w-full sm:w-auto bg-white/80 hover:bg-white text-gray-800 border-gray-300 backdrop-blur-sm shadow-sm"
          >
             چطور کار می‌کند؟
          </Link>
        </div>

      </div>
    </section>
  );
}