import Link from 'next/link';
import { ArrowLeft, Gift, ShieldCheck } from 'lucide-react';

interface HeroProps {
  banner?: string;
  title?: string;
  subtitle?: string;
}

export default function Hero({ banner, title, subtitle }: HeroProps) {
  const displayTitle = title || 'فاصله‌ها را با عشق پر کنید';
  const displaySubtitle = subtitle || 'تنها پلتفرم ارسال هدیه به ایران با پرداخت ارزی و کریپتو (USDT / Solana).';
  const hasBanner = !!banner;

  return (
    <section className="relative overflow-hidden font-[family-name:var(--font-vazir)] bg-gradient-to-br from-indigo-950 via-blue-900 to-blue-950 min-h-[auto] md:min-h-[600px] py-12 md:py-0">
      
      {/* کانتینر اصلی */}
      <div className="container mx-auto px-4 relative z-10">
        {/* اینجا جادوی اصلی اتفاق میفته: فلکس باکس دو ستونه */}
        {/* flex-col-reverse یعنی در موبایل اول عکس باشه بعد متن */}
        {/* md:flex-row یعنی در دسکتاپ متن راست باشه، عکس چپ */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
          
          {/* --- ستون ۱: متن‌ها (سمت راست) --- */}
          <div className="flex-1 text-center md:text-right w-full z-20">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-800/50 border border-blue-700 text-blue-200 text-xs md:text-sm mb-6">
              <Gift className="h-4 w-4 text-yellow-400" />
              <span>ارسال مطمئن هدیه به سراسر ایران</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 drop-shadow-lg">
              {displayTitle}
            </h1>

            <p className="text-base md:text-lg text-blue-100 leading-8 mb-8 max-w-lg mx-auto md:mx-0">
              {displaySubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                href="/products" 
                className="inline-flex items-center justify-center rounded-xl bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-8 py-4 text-base font-bold shadow-lg transition-all hover:-translate-y-1"
              >
                شروع خرید
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
              
              <Link 
                href="/how-it-works" 
                className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 text-base font-medium backdrop-blur-sm transition-all"
              >
                <ShieldCheck className="ml-2 h-5 w-5" />
                چطور اعتماد کنم؟
              </Link>
            </div>
          </div>

          {/* --- ستون ۲: تصویر کادو (سمت چپ) --- */}
          {/* این دیو کاملاً جداست و امکان نداره بره زیر متن */}
          <div className="flex-1 flex justify-center w-full relative z-10">
            
            {/* یک دایره نورانی پشت عکس برای زیبایی */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-blue-500/30 blur-[70px] rounded-full pointer-events-none"></div>
            
            {hasBanner ? (
                 <img 
                    src={banner} 
                    alt="Gift Box" 
                    // این کلاس‌ها سایز رو کنترل می‌کنن که کل صفحه رو نگیره
                    // object-contain: عکس رو برش نزن و کامل نشون بده
                    className="relative w-auto h-auto max-w-[250px] md:max-w-[450px] max-h-[300px] md:max-h-[500px] object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-700 hover:scale-105 transition-transform"
                 />
               ) : (
                 // اگر عکسی نبود این رو نشون میده
                 <div className="relative z-10 w-64 h-64 flex items-center justify-center border-2 border-dashed border-white/20 rounded-3xl bg-white/5 text-white/50 p-4 text-center text-sm">
                    تصویر کادو (PNG) را در تنظیمات پنل ادمین آپلود کنید
                 </div>
               )}
          </div>

        </div>
      </div>
    </section>
  );
}