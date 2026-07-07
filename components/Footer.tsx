import { Mail, Heart, Lock, ShieldCheck, HelpCircle, ShoppingBag, BookOpen, Package, Info, Phone, Code2, Library, Star, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// آیکون شبکه اجتماعی X (توییتر سابق) — نسخه مدرن لوگوی X
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/>
    </svg>
  );
}

// آیکون فیسبوک
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.508 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.462h-1.26c-1.243 0-1.63.771-1.63 1.562v1.876h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z"/>
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear(); // دریافت سال جاری (مثلاً 2026)

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            {/* لوگوتایپ */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-blue-100">
                      <img src="/logo.png" alt="Soughat Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-2xl font-black text-blue-700 tracking-tighter" style={{ letterSpacing: '-1px' }}>
                  Soughat Shop
                </span>
            </div>
            
            <p className="mt-4 text-sm text-gray-500 max-w-sm leading-7 text-justify">
              {t('brand_desc')}
            </p>

            {/* ایمیل رسمی سوغات شاپ */}
            <a
              href="mailto:info@soughat.shop"
              className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors font-mono"
              dir="ltr"
            >
              <Mail className="h-4 w-4" />
              info@soughat.shop
            </a>

            {/* نوار آیکون‌های کریپتو */}
            <div className="flex items-center gap-3 mt-4 opacity-90">
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png" className="w-6 h-6 hover:scale-110 transition-transform cursor-help" alt="Tether" title="USDT" />
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png" className="w-6 h-6 hover:scale-110 transition-transform cursor-help" alt="Solana" title="Solana" />
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png" className="w-6 h-6 hover:scale-110 transition-transform cursor-help grayscale hover:grayscale-0" alt="Bitcoin" title="Bitcoin" />
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png" className="w-6 h-6 hover:scale-110 transition-transform cursor-help grayscale hover:grayscale-0" alt="Ethereum" title="Ethereum" />
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{t('crypto_friendly')}</span>
            </div>
            
            {/* Socials */}
            <div className="flex items-center gap-4 mt-6">
                <a href="https://x.com/Soughatshop" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="bg-gray-50 p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-all"><XIcon /></a>
                <a href="https://www.facebook.com/share/14eJwCenVjC/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="bg-gray-50 p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><FacebookIcon /></a>
                <Link href="/contact" className="bg-gray-50 p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Mail className="h-5 w-5" /></Link>
                
                {/* لینک همکاران (Partners) */}
                <Link 
                    href="/partners" 
                    title={t('partners')}
                    className="bg-gray-50 p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                    <Library className="h-5 w-5" />
                </Link>
            </div>
          </div>

          {/* Links 1: Store */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('links_store')}</h3>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li>
                <Link href="/products" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> {t('products')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> {t('blog')}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <Package className="h-4 w-4" /> {t('track')}
                </Link>
              </li>
              <li>
                <Link href="/review" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <Star className="h-4 w-4" /> {t('review')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2: Trust & Guide */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('links_access')}</h3>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li>
                <Link href="/send-money-to-iran" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> {t('remit')}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" /> {t('guide')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> {t('terms')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <Info className="h-4 w-4" /> {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {t('contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6">
          
          {/* کپی‌رایت و ادمین */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-center">
            <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400 dir-ltr font-mono">
                {/* محاسبه خودکار سال و افزودن کپی‌رایت */}
                © {currentYear} {t('rights')}
                </p>
                {/* لینک ادمین */}
                <a href="/admin/login" className="text-gray-300 hover:text-blue-900 transition-colors p-1 opacity-50 hover:opacity-100" title={t('admin_login')}>
                <Lock className="h-3 w-3" />
                </a>
            </div>
            <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{t('made_with')}</span>
                <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
                <span>{t('for_iran')}</span>
            </div>
          </div>
          
          {/* --- امضای کیا دِو (KiyaDev Signature) --- */}
          <a 
            href="https://kiyadev.ir" 
            target="_blank"
            className="group flex items-center gap-3 bg-gray-50 hover:bg-slate-900 border border-gray-100 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-400/80">
                {t('design_by')}
              </span>
              <span className="text-xs font-bold text-gray-700 group-hover:text-white flex items-center gap-1">
                KiyaDev Team
                <Code2 className="h-3 w-3 text-blue-600 group-hover:text-blue-400" />
              </span>
            </div>
            
            <div className="h-8 w-8 bg-white group-hover:bg-white/10 rounded-lg flex items-center justify-center shadow-sm transition-colors">
               <Code2 className="h-4 w-4 text-gray-600 group-hover:text-white" />
            </div>
          </a>
          {/* -------------------------------------- */}

        </div>
      </div>
    </footer>
  );
}