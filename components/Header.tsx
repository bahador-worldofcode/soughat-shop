'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, Globe, Search } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Header() {
  const { currency, setCurrency, totalItems, fetchRates } = useStore();
  const cartCount = totalItems();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const router = useRouter();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-blue-100 group-hover:scale-105 transition-transform">
             {/* اصلاح شد: استفاده از فایل استاتیک لوگو */}
             <img src="/logo.png" alt="Soughat Logo" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xl font-extrabold text-blue-600 tracking-tighter leading-none">
              Soughat Shop
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 font-bold mt-1 tracking-wide">
              ارسال هدیه به ایران
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md items-center bg-gray-100 rounded-lg px-3 py-1.5 mx-4 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
            <Search className="h-4 w-4 text-gray-400" />
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در بین محصولات..."
                className="bg-transparent border-none outline-none text-sm w-full mr-2 text-gray-700 placeholder-gray-400"
            />
        </form>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            خانه
          </Link>
          <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            محصولات
          </Link>
          <Link href="/track" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            پیگیری
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          
          {/* Currency Switcher (Desktop) */}
          <div className="hidden sm:flex items-center gap-1 border rounded-lg px-2 py-1 bg-gray-50 hover:bg-gray-100 transition-colors">
            <Globe className="h-4 w-4 text-gray-500" />
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-transparent text-sm font-medium outline-none cursor-pointer uppercase text-gray-700"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="SEK">SEK (kr)</option>
            </select>
          </div>

          <Link href="/cart">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group">
              <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
          
          {/* Mobile Menu Trigger */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
          </button>
        </div>

      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-lg px-3 py-2 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
            <Search className="h-4 w-4 text-gray-400" />
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو..."
                className="bg-transparent border-none outline-none text-sm w-full mr-2 text-gray-700"
            />
        </form>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg animate-in fade-in slide-in-from-top-2 z-40">
            <div className="flex flex-col p-4 gap-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium hover:text-blue-600 flex items-center justify-between border-b border-gray-50 pb-2">
                    خانه
                </Link>
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium hover:text-blue-600 flex items-center justify-between border-b border-gray-50 pb-2">
                    محصولات
                </Link>
                <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium hover:text-blue-600 flex items-center justify-between border-b border-gray-50 pb-2">
                    وبلاگ
                </Link>
                <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium hover:text-blue-600 flex items-center justify-between border-b border-gray-50 pb-2">
                    پیگیری سفارش
                </Link>
                <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium hover:text-blue-600 flex items-center justify-between border-b border-gray-50 pb-2">
                    راهنمای خرید
                </Link>

                {/* Currency Switcher for Mobile */}
                <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-500 flex items-center gap-2"><Globe className="h-4 w-4"/> واحد پول:</span>
                    <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none"
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