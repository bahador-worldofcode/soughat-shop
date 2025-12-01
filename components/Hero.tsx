import Link from 'next/link';
import { ArrowLeft, Gift, ShieldCheck } from 'lucide-react';

interface HeroProps {
  banner?: string;
  title?: string;
  subtitle?: string;
}

export default function Hero({ banner, title, subtitle }: HeroProps) {
  // متن‌های پیش‌فرض
  const displayTitle = title || 'فاصله‌ها را با عشق پر کنید';
  const displaySubtitle = subtitle || 'تنها پلتفرم ارسال هدیه به ایران با پرداخت ارزی و کریپتو (USDT / Solana).';
  
  // اگر عکس بنر نبود، یک پلیس‌هولدر نشون بده
  const hasBanner = !!banner;

  return (
    // تغییر ۱: پس‌زمینه دیگه عکس نیست، بلکه یک رنگ گرادینت شیک هست
    <section className="relative overflow-hidden font-[family-name:var(--font-vazir)] bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 min-h-[600px] flex items-center">
      
      {/* پترن‌های تزئینی پس‌زمینه (دایره‌های محو) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* ستون ۱: متن‌ها (سمت راست در دسکتاپ) */}
          <div className="flex flex-col items-center md:items-start text-center md:text-right space-y-6 order-2 md:order-1">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm backdrop-blur-md animate-in fade-in slide-in-from-right-8 duration-700">
              <Gift className="h-4 w-4 text-yellow-400" />
              <span>ارسال مطمئن هدیه به سراسر ایران</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg">
              {displayTitle}
            </h1>

            <p className="text-lg text-blue-100 leading-relaxed max-w-lg">
              {displaySubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Link 
                href="/products" 
                className="inline-flex items-center justify-center rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-8 py-4 text-lg font-bold shadow-lg shadow-yellow-500/20 transition-all hover:-translate-y-1 w-full sm:w-auto"
              >
                شروع خرید
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Link>
              
              <Link 
                href="/how-it-works" 
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 text-lg font-medium backdrop-blur-sm transition-all w-full sm:w-auto"
              >
                <ShieldCheck className="ml-2 h-5 w-5" />
                چطور اعتماد کنم؟
              </Link>
            </div>

            {/* آمار کوچک */}
            <div className="pt-8 flex items-center gap-6 text-blue-200 text-sm border-t border-white/10 w-full justify-center md:justify-start">
                <div className="flex flex-col">
                    <span className="font-bold text-xl text-white">+۱۰۰</span>
                    <span>محصول خاص</span>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="flex flex-col">
                    <span className="font-bold text-xl text-white">۲۴h</span>
                    <span>تحویل تهران</span>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="flex flex-col">
                    <span className="font-bold text-xl text-white">۱۰۰٪</span>
                    <span>ضمانت بازگشت</span>
                </div>
            </div>
          </div>

          {/* ستون ۲: تصویر کادو (سمت چپ در دسکتاپ - بالا در موبایل) */}
          {/* تغییر مهم: اینجا عکس رو به عنوان img تگ میذاریم نه بک‌گراند */}
          <div className="relative order-1 md:order-2 flex justify-center items-center h-[300px] md:h-[500px]">
            
            {/* هاله نور پشت کادو برای اینکه کادو توی چشم بیاد */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 to-transparent blur-[60px] rounded-full transform scale-75"></div>
            
            {hasBanner ? (
                 <img 
                    src={banner} 
                    alt="Gift Box Banner" 
                    className="relative z-10 w-auto h-full max-h-[300px] md:max-h-[450px] object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-1000"
                    style={{ animation: 'float 6s ease-in-out infinite' }}
                 />
               ) : (
                 // اگر عکسی نبود، این باکس خط‌چین نشون داده میشه
                 <div className="relative z-10 w-64 h-64 flex items-center justify-center border-4 border-dashed border-white/30 rounded-3xl bg-white/5 text-white/50 text-center p-4">
                    عکس کادو (PNG) را در پنل ادمین آپلود کنید
                 </div>
               )}
          </div>

        </div>
      </div>

      {/* استایل انیمیشن شناور (معلق بودن کادو) */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </section>
  );
}