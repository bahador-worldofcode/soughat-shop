'use client';

import { useEffect, useState } from 'react';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Truck,
  Menu as MenuIcon,
  X,
  Globe,
  BookOpen,
  HelpCircle,
  Star,
  Info,
  Mail,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { isMobileNavHidden } from '@/lib/navVisibility';

// آیتم‌های ثانویه‌ای که قبلاً داخل منوی همبرگری هدر بودند و الان به شیت
// «بیشتر» منتقل شده‌اند (به‌همراه دو مورد جدید: درباره ما و تماس با ما)
const QUICK_LINKS = [
  { href: '/blog', key: 'blog', icon: BookOpen },
  { href: '/how-it-works', key: 'guide', icon: HelpCircle },
  { href: '/review', key: 'review', icon: Star },
  { href: '/about', key: 'about', icon: Info },
  { href: '/contact', key: 'contact', icon: Mail },
] as const;

// مسیرهایی که با تب «بیشتر» مرتبط‌اند؛ اگر کاربر داخل یکی از این صفحات باشد
// تب «بیشتر» به‌عنوان تب فعال هایلایت می‌شود
const MORE_ACTIVE_PATHS = ['/blog', '/how-it-works', '/review', '/about', '/contact'];

export default function MobileBottomNav() {
  const tHeader = useTranslations('Header');
  const tFooter = useTranslations('Footer');
  const tNav = useTranslations('MobileNav');
  const locale = useLocale();
  const isEn = locale === 'en';

  const { currency, setCurrency, totalItems } = useStore();
  const cartCount = totalItems();

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // با هر تغییر مسیر، شیت «بیشتر» (در صورت باز بودن) بسته شود
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleLanguage = () => {
    const newLocale = isEn ? 'fa' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  // در صفحاتی مثل پنل ادمین، جزئیات محصول و تسویه‌حساب، این نوار اصلاً رندر نمی‌شود
  if (!mounted || isMobileNavHidden(pathname)) return null;

  const isHome = pathname === '/';
  const isProducts = pathname === '/products';
  const isCart = pathname === '/cart';
  const isTrack = pathname === '/track';
  const isMoreActive = isMenuOpen || MORE_ACTIVE_PATHS.some((p) => pathname?.startsWith(p));

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
      active ? 'text-blue-600' : 'text-gray-400 active:text-blue-500'
    }`;

  return (
    <>
      {/* فاصله‌گذار: ارتفاع نوار پایین را از فضای محتوای صفحه کم می‌کند تا چیزی زیر آن پنهان نشود */}
      <div className="md:hidden h-[calc(4rem+env(safe-area-inset-bottom))]" aria-hidden="true" />

      {/* پرده‌ی پشت شیت «بیشتر» */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[60] animate-sheet-overlay"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* شیت کشویی «بیشتر»: زبان، ارز و لینک‌های ثانویه */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tNav('menu')}
          dir={isEn ? 'ltr' : 'rtl'}
          className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-sheet-panel font-[family-name:var(--font-vazir)]"
        >
          <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            {/* دستگیره‌ی بصری شیت */}
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">{tNav('menu')}</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label={isEn ? 'Close menu' : 'بستن منو'}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* سوییچر زبان */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-between w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 active:bg-gray-100 mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                {tHeader('language')}
              </span>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-blue-600">
                <span>{isEn ? 'فارسی' : 'English'}</span>
              </div>
            </button>

            {/* سوییچر واحد پول */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 mb-5">
              <span className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">$</span>
                {tHeader('currency')}
              </span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-transparent text-sm font-bold outline-none text-blue-700 dir-ltr cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SEK">SEK (kr)</option>
              </select>
            </div>

            <hr className="border-gray-100 mb-4" />

            {/* لینک‌های ثانویه */}
            <p className="text-xs font-bold text-gray-400 mb-3">{tNav('quickLinks')}</p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                const label =
                  link.key === 'about' || link.key === 'contact'
                    ? tFooter(link.key)
                    : tHeader(link.key);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-600 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-bold">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* نوار تب پایین */}
      <nav
        dir={isEn ? 'ltr' : 'rtl'}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] font-[family-name:var(--font-vazir)]"
      >
        <div className="relative h-16 flex items-stretch justify-between px-1">
          <Link href="/" className={tabClass(isHome)}>
            <Home className="h-5 w-5" strokeWidth={isHome ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{tHeader('home')}</span>
          </Link>

          <Link href="/products" className={tabClass(isProducts)}>
            <LayoutGrid className="h-5 w-5" strokeWidth={isProducts ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{tHeader('products')}</span>
          </Link>

          {/* دکمه‌ی برجسته‌ی سبد خرید، الهام‌گرفته از دکمه‌ی مرکزی اپ‌های سفر مثل اسنپ */}
          <Link href="/cart" className="relative flex-1 h-full" aria-label={tNav('cart')}>
            <span
              className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-transform ${
                isCart ? 'bg-blue-700 scale-105' : 'bg-blue-600'
              }`}
            >
              <ShoppingBag className="h-6 w-6 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </span>
            <span
              className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold ${
                isCart ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {tNav('cart')}
            </span>
          </Link>

          <Link href="/track" className={tabClass(isTrack)}>
            <Truck className="h-5 w-5" strokeWidth={isTrack ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{tHeader('track')}</span>
          </Link>

          <button onClick={() => setIsMenuOpen(true)} className={tabClass(isMoreActive)}>
            <MenuIcon className="h-5 w-5" strokeWidth={isMoreActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{tNav('menu')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
