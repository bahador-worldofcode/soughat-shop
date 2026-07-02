'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Globe, Search } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { isMobileNavHidden } from '@/lib/navVisibility';

export default function Header() {
  const t = useTranslations('Header');
  const locale = useLocale(); // دریافت زبان فعلی
  const isEn = locale === 'en';
  
  // دریافت متد totalItems از استور (که اکنون هوشمند شده و حواله را ۱ عدد می‌شمارد)
  const { currency, setCurrency, totalItems, fetchRates } = useStore();
  
  // محاسبه تعداد آیتم‌های سبد خرید
  const cartCount = totalItems();
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const router = useRouter();
  const pathname = usePathname();

  // در موبایل، آیتم‌های اصلی ناوبری (خانه، محصولات، سبد خرید، پیگیری، منو)
  // به نوار پایین صفحه منتقل شده‌اند. آیکون سبد خرید هدر فقط در صفحاتی که
  // آن نوار پایین نمایش داده نمی‌شود (مثل جزئیات محصول) در موبایل دیده می‌شود،
  // تا کاربر همیشه یک راه برای رسیدن به سبد خرید داشته باشد.
  const showMobileCartIcon = isMobileNavHidden(pathname);

  useEffect(() => {
    setMounted(true);
    fetchRates();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleLanguage = () => {
    const newLocale = isEn ? 'fa' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-blue-100 group-hover:scale-105 transition-transform">
             <img src="/logo.png" alt="Soughat Logo" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xl font-extrabold text-blue-600 tracking-tighter leading-none">
              Soughat Shop
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 font-bold mt-1 tracking-wide">
              {t('subtitle')}
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md items-center bg-gray-100 rounded-xl px-4 py-2 mx-4 border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all">
            <Search className="h-4 w-4 text-gray-400" />
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className={`bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 ${!isEn ? 'mr-3' : 'ml-3'}`}
            />
        </form>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            {t('home')}
          </Link>
          <Link href="/products" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            {t('products')}
          </Link>
          <Link href="/track" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            {t('track')}
          </Link>
          <Link href="/review" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            {t('review')}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          
          {/* Language Switcher Button (Desktop) - Text Based */}
          <button 
            onClick={toggleLanguage}
            className="hidden sm:flex items-center gap-2 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-200 px-4 py-1.5 rounded-xl transition-all shadow-sm hover:shadow group min-w-[80px] justify-center"
            title={!isEn ? 'Switch to English' : 'تغییر به فارسی'}
          >
            <Globe className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            {/* نمایش زبان مقصد: اگر انگلیسی هستیم دکمه فارسی را نشان بده و برعکس */}
            <span className="text-sm font-bold text-gray-600 group-hover:text-blue-700 pt-0.5">
                {isEn ? 'فارسی' : 'English'}
            </span>
          </button>

          {/* Currency Switcher (Desktop) */}
          <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-xl px-2 py-1.5 bg-gray-50 hover:bg-white transition-all shadow-sm hover:shadow cursor-pointer">
            <span className="text-xs font-bold text-gray-500">$</span>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer uppercase text-gray-700"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="SEK">SEK (kr)</option>
            </select>
          </div>

          {/* Cart Button */}
          {/* در دسکتاپ همیشه دیده می‌شود. در موبایل فقط وقتی نوار پایین
              نمایش داده نمی‌شود (مثل صفحه جزئیات محصول) ظاهر می‌شود، چون
              در بقیه صفحات دسترسی به سبد خرید از طریق نوار پایین انجام می‌شود */}
          <Link href="/cart" className={showMobileCartIcon ? 'flex' : 'hidden md:flex'}>
            <button className="relative p-2.5 hover:bg-blue-50 rounded-xl transition-colors group border border-transparent hover:border-blue-100">
              <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
              {/* بج (Badge) تعداد آیتم‌ها - حالا هوشمند شده */}
              {mounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm transform scale-100 group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
        </div>

      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3 border-b border-gray-50">
        <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-xl px-3 py-2.5 border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all">
            <Search className="h-4 w-4 text-gray-400" />
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className={`bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 ${!isEn ? 'mr-3' : 'ml-3'}`}
            />
        </form>
      </div>
    </header>
  );
}
