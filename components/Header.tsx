'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, Globe } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Header() {
  const { currency, setCurrency, totalItems } = useStore();
  const cartCount = totalItems();
  
  // رفع خطای Hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600 tracking-tighter">
            Soughat Shop
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            خانه
          </Link>
          <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            محصولات
          </Link>
          <Link href="/track" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            پیگیری سفارش
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          
          {/* Currency Switcher */}
          <div className="hidden sm:flex items-center gap-1 border rounded-lg px-2 py-1">
            <Globe className="h-4 w-4 text-gray-500" />
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-transparent text-sm font-medium outline-none cursor-pointer uppercase"
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
          
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-md">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>

      </div>
    </header>
  );
}