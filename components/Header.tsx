'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Globe, Search, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';

export default function Header() {
  const t = useTranslations('Header');
  const { currency, setCurrency, totalItems, fetchRates } = useStore();
  const cartCount = totalItems();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    fetchRates();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const toggleLanguage = () => {
    const currentLocale = window.location.pathname.startsWith('/en') ? 'en' : 'fa';
    const newLocale = currentLocale === 'en' ? 'fa' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  const currentLocale = typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? 'en' : 'fa';

  // لینک‌های CDN برای پرچم‌ها
  const flagIR = "https://flagcdn.com/w40/ir.png";
  const flagUS = "https://flagcdn.com/w40/us.png";

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
                className={`bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 ${currentLocale === 'fa' ? 'mr-3' : 'ml-3'}`}
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
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          
          {/* Language Switcher Button (Desktop) - FIXED FLAGS */}
          <button 
            onClick={toggleLanguage}
            className="hidden sm:flex items-center gap-2 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-200 px-3 py-1.5 rounded-xl transition-all shadow-sm hover:shadow group"
            title={currentLocale === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
          >
            {/* استفاده از تگ img استاندارد برای پرچم‌ها */}
            <div className="w-5 h-3.5 relative rounded-sm overflow-hidden shadow-sm">
                <img 
                    src={currentLocale === 'fa' ? flagUS : flagIR} 
                    alt="Language Flag" 
                    className="w-full h-full object-cover"
                />
            </div>
            <span className="text-xs font-bold text-gray-600 group-hover:text-blue-700 uppercase">
                {currentLocale === 'fa' ? 'EN' : 'FA'}
            </span>
          </button>

          {/* Currency Switcher (Desktop) */}
          <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-xl px-2 py-1.5 bg-gray-50 hover:bg-white transition-all shadow-sm hover:shadow cursor-pointer">
            <Globe className="h-4 w-4 text-gray-400" />
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
          <Link href="/cart">
            <button className="relative p-2.5 hover:bg-blue-50 rounded-xl transition-colors group border border-transparent hover:border-blue-100">
              <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm transform scale-100 group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
          
          {/* Mobile Menu Trigger */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6 text-gray-800" /> : <Menu className="h-6 w-6 text-gray-800" />}
          </button>
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
                className={`bg-transparent border-none outline-none text-sm w-full text-gray-700 ${currentLocale === 'fa' ? 'mr-3' : 'ml-3'}`}
            />
        </form>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-2 z-40 h-screen">
            <div className="flex flex-col p-4 gap-2">
                
                {/* Mobile Links */}
                {[
                  { href: '/', label: t('home') },
                  { href: '/products', label: t('products') },
                  { href: '/blog', label: t('blog') },
                  { href: '/track', label: t('track') },
                  { href: '/how-it-works', label: t('guide') },
                ].map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-gray-700 font-bold hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl flex items-center justify-between transition-colors"
                  >
                      {link.label}
                      <ChevronDown className={`h-4 w-4 text-gray-400 ${currentLocale === 'fa' ? 'rotate-90' : '-rotate-90'}`} />
                  </Link>
                ))}

                <hr className="my-2 border-gray-100" />

                {/* Mobile Language Switcher */}
                <button 
                  onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }}
                  className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 active:bg-gray-100"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🌍</span> 
                    {t('language') || 'Language'}
                  </span>
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                     <div className="w-5 h-3.5 relative rounded-sm overflow-hidden shadow-sm">
                        {/* نمایش پرچم زبان فعلی */}
                        <img 
                            src={currentLocale === 'fa' ? flagIR : flagUS} 
                            alt="Current Language Flag" 
                            className="w-full h-full object-cover"
                        />
                     </div>
                     <span className="uppercase text-xs">{currentLocale === 'fa' ? 'FA' : 'EN'}</span>
                  </div>
                </button>

                {/* Mobile Currency Switcher */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700">
                    <span className="flex items-center gap-2"><Globe className="h-4 w-4"/> {t('currency')}:</span>
                    <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="bg-transparent text-sm font-bold outline-none text-blue-700 dir-ltr"
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="SEK">SEK (kr)</option>
                    </select>
                </div>
            </div>
        </div>
      )}
    </header>
  );
}