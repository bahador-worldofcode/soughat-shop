import { Link } from '@/i18n/navigation';
import { ArrowLeft, Gift, ShieldCheck } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface HeroProps {
  banner?: string;
  title?: string;
  subtitle?: string;
}

export default function Hero({ banner, title, subtitle }: HeroProps) {
  const t = useTranslations('Home');
  const locale = useLocale();
  const isEn = locale === 'en';

  const displayTitle = title || t('hero_start'); 
  const displaySubtitle = subtitle || '';
  const hasBanner = !!banner;

  return (
    <section className="relative overflow-hidden font-[family-name:var(--font-vazir)] bg-gradient-to-br from-indigo-950 via-blue-900 to-blue-950 min-h-[auto] md:min-h-[600px] py-12 md:py-0">
      
      {/* کانتینر اصلی */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
          
          {/* --- ستون ۱: متن‌ها --- */}
          <div className="flex-1 text-center md:text-start w-full z-20"> 
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-800/50 border border-blue-700 text-blue-200 text-xs md:text-sm mb-6 mx-auto md:mx-0">
              <Gift className="h-4 w-4 text-yellow-400" />
              <span>Soughat Shop</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 drop-shadow-lg">
              {displayTitle}
            </h1>

            <p className="text-xs sm:text-base md:text-lg text-blue-100 leading-8 mb-8 max-w-full md:max-w-none mx-auto md:mx-0">
              {displaySubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                href="/products" 
                className="inline-flex items-center justify-center rounded-xl bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-8 py-4 text-base font-bold shadow-lg transition-all hover:-translate-y-1 gap-2"
              >
                <span>{t('hero_start')}</span>
                {/* چرخش فلش بر اساس زبان */}
                <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180' : ''}`} /> 
              </Link>
              
              {/* لینک اصلاح شده به صفحه جدید Trust */}
              <Link 
                href="/trust" 
                className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 text-base font-medium backdrop-blur-sm transition-all gap-2"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>{t('hero_trust')}</span>
              </Link>
            </div>
          </div>

          {/* --- ستون ۲: تصویر کادو --- */}
          <div className="flex-1 flex justify-center w-full relative z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-blue-500/30 blur-[70px] rounded-full pointer-events-none"></div>
            
            {hasBanner ? (
                 <img 
                    src={banner} 
                    alt={t('hero_gift_alt')} 
                    className="relative w-auto h-auto max-w-[250px] md:max-w-[450px] max-h-[300px] md:max-h-[500px] object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-700 hover:scale-105 transition-transform"
                 />
               ) : (
                 <div className="relative z-10 w-64 h-64 flex items-center justify-center border-2 border-dashed border-white/20 rounded-3xl bg-white/5 text-white/50 p-4 text-center text-sm">
                    Upload Hero Image in Admin Panel
                 </div>
               )}
          </div>

        </div>
      </div>
    </section>
  );
}