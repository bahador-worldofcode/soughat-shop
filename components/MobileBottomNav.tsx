'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
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
  Loader2,
  ArrowUpRight,
  DollarSign,
  User,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { isMobileNavHidden } from '@/lib/navVisibility';
import { useAuthState } from '@/lib/useAuthState';
import NotificationBell from '@/components/NotificationBell';
import Toast from '@/components/Toast';

// آیتم‌های ثانویه (کم‌اهمیت‌تر) که به‌صورت فشرده و کوچک نمایش داده می‌شوند.
// «تماس با ما» عمداً این‌جا نیست چون به‌صورت یک دکمه‌ی برجسته‌ی جدا رندر می‌شود؛
// این تصمیم بر این اساس است که «تماس با ما» پرکاربردترین و حیاتی‌ترین اکشن برای
// کاربری‌ست که با پرداخت ارزی/بین‌مرزی کار می‌کند و بیشترین نیاز به اطمینان‌خاطر را دارد،
// در حالی که بقیه (ارسال پول، وبلاگ، راهنما، ثبت نظر، درباره ما) اکشن‌های کم‌تکرارتر و اطلاعاتی‌اند.
const QUICK_LINKS = [
  { href: '/send-money-to-iran', key: 'remit', icon: DollarSign },
  { href: '/blog', key: 'blog', icon: BookOpen },
  { href: '/how-it-works', key: 'guide', icon: HelpCircle },
  { href: '/review', key: 'review', icon: Star },
  { href: '/about', key: 'about', icon: Info },
] as const;

// نگاشت نماد ارز، برای نمایش کوتاه روی نشان (badge) تب «بیشتر»
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SEK: 'kr',
};

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

  // آیا کاربر وارد سیستم شده؟ (برای نمایش لینک پروفایل یا ورود در شیت «بیشتر»)
  const isAuthed = useAuthState();

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // isLangPending یعنی «سوییچ زبان در حال انجام است» — از useTransition
  // به‌جای یک useState دستی استفاده شده چون این مقدار دقیقاً همان لحظه‌ای که
  // ری‌اکت واقعاً منتظر رندر شدن محتوای زبان جدید است true/false می‌شود؛
  // یعنی به هیچ setTimeout حدسی نیاز نداریم.
  const [isLangPending, startLangTransition] = useTransition();
  const wasLangPending = useRef(false);

  // استیت اعلان (Toast) — هم برای تغییر زبان و هم تغییر ارز استفاده می‌شود
  const [toastMessage, setToastMessage] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastShow(true);
  };

  const router = useRouter();
  const pathname = usePathname();
  // next-intl's usePathname عمداً query string را برنمی‌گرداند؛ برای همین جدا
  // از next/navigation می‌گیریمش تا هنگام سوییچ زبان بتوانیم آن را حفظ کنیم
  // (دقیقاً همان اصلاح Header.tsx، برای هماهنگی رفتار موبایل و دسکتاپ).
  //
  // 🆕 رفع خطای بیلد «useSearchParams() should be wrapped in a suspense boundary»:
  // درست مثل Header.tsx — چون این کامپوننت هم روی همه‌ی صفحات (از لایوت
  // مشترک) رندر می‌شود، بعد از اضافه‌شدنِ generateStaticParams به
  // app/[locale]/layout.tsx، همین هوک به‌تنهایی کل بیلدِ Vercel را متوقف
  // می‌کرد. چون searchParams اینجا هم فقط داخل toggleLanguage (هنگام کلیک)
  // لازم است نه در JSX، دیگر از هوکِ useSearchParams استفاده نمی‌کنیم و
  // مستقیم از window.location.search (فقط داخل کنترل‌گر کلیک، یعنی فقط در
  // مرورگر) می‌خوانیم.

  useEffect(() => {
    setMounted(true);
  }, []);

  // با هر تغییر مسیر، شیت «بیشتر» (در صورت باز بودن) بسته شود
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // به محض این‌که سوییچ زبان واقعاً تمام شد (isLangPending از true به false رفت)،
  // شیت «بیشتر» را می‌بندیم و یک اعلان تاییدیه‌ی شیک نشان می‌دهیم. چون useTranslations
  // بعد از تمام شدن ترنزیشن خودش را با محتوای زبان جدید به‌روز می‌کند، پیام tHeader('languageChanged')
  // همین‌جا به‌طور خودکار به زبان مقصد (نه زبان قبلی) خوانده می‌شود.
  useEffect(() => {
    if (wasLangPending.current && !isLangPending) {
      setIsMenuOpen(false);
      showToast(tHeader('languageChanged'));
    }
    wasLangPending.current = isLangPending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLangPending]);

  const toggleLanguage = () => {
    if (isLangPending) return; // از تپ چندباره در حین سوییچ جلوگیری می‌کند
    const newLocale = isEn ? 'fa' : 'en';
    // رفع باگ: قبلاً فقط pathname (بدون query string) پاس داده می‌شد، برای همین
    // فیلترهایی مثل ?category=... یا ?q=... موقع سوییچ زبان پاک می‌شدند.
    // حالا query string فعلی را عیناً به مسیر مقصد اضافه می‌کنیم تا حفظ شود.
    const query = typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '';
    const target = query ? `${pathname}?${query}` : pathname;
    startLangTransition(() => {
      router.replace(target, { locale: newLocale });
    });
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value as any);
    showToast(tHeader('currencyChanged', { currency: value }));
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

      {/* شیت کشویی «بیشتر»: حساب کاربری، زبان، ارز و لینک‌های ثانویه */}
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
                aria-label={tNav('close_menu')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* حساب کاربری: اگر کاربر وارد شده، لینک به پروفایل؛ در غیر این
                صورت دکمه‌ی ورود. قبلاً هیچ راهی برای رسیدن به پروفایل یا صفحه‌ی
                ورود در نسخه‌ی موبایل سایت وجود نداشت. */}
            {isAuthed ? (
              <div className="flex items-center gap-2 mb-3">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-blue-700 active:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-bold">{tHeader('profile_aria')}</span>
                </Link>
                <NotificationBell />
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3 text-blue-700 active:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-bold">{tHeader('login')}</span>
              </Link>
            )}

            {/* سوییچر زبان: در حین سوییچ، آیکون به لودینگ تبدیل و دکمه غیرفعال می‌شود
                تا کاربر بلافاصله بفهمد تپش ثبت شده؛ تاییدیه‌ی نهایی هم به‌صورت
                Toast بعد از تمام شدن سوییچ نمایش داده می‌شود (افکت useEffect بالا) */}
            <button
              onClick={toggleLanguage}
              disabled={isLangPending}
              aria-busy={isLangPending}
              className="flex items-center justify-between w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 active:bg-gray-100 mb-3 transition-opacity disabled:opacity-70 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="flex items-center gap-2">
                {isLangPending ? (
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4 text-blue-600" />
                )}
                {tHeader('language')}
              </span>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-blue-600">
                <span>
                  {isLangPending
                    ? tHeader('switchingLanguage')
                    : (isEn ? tHeader('lang_name_fa') : tHeader('lang_name_en'))}
                </span>
              </div>
            </button>

            {/* سوییچر واحد پول: با انتخاب گزینه‌ی جدید بلافاصله یک Toast تاییدیه نشان
                داده می‌شود؛ علاوه بر این، ارز فعلی همیشه (حتی وقتی این شیت بسته است)
                به‌صورت یک نشان کوچک روی خود تب «بیشتر» در نوار پایین قابل مشاهده است
                (به بخش نوار تب پایین‌تر مراجعه کنید) */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 mb-5">
              <span className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">{CURRENCY_SYMBOLS[currency] || '$'}</span>
                {tHeader('currency')}
              </span>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="bg-transparent text-sm font-bold outline-none text-blue-700 dir-ltr cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SEK">SEK (kr)</option>
              </select>
            </div>

            {/* دکمه‌ی برجسته‌ی «تماس با ما»: تنها اکشن ثانویه‌ای که جدا و با
                وزن بصری بالاتر رندر می‌شود؛ چون در یک فروشگاه بین‌مرزی با پرداخت
                کریپتو، «راه ارتباطی سریع با پشتیبانی» بیشترین تاثیر را روی
                اطمینان‌خاطر مشتری دارد و پرتکرارترین نیاز واقعی کاربر است. */}
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl px-4 py-4 mb-5 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="bg-white/20 p-2.5 rounded-xl flex-shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{tFooter('contact')}</p>
                <p className="text-xs text-blue-100 truncate">{tNav('contactCtaSubtitle')}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 flex-shrink-0 opacity-80" />
            </Link>

            <hr className="border-gray-100 mb-4" />

            {/* لینک‌های ثانویه: فشرده‌تر و کم‌رنگ‌تر از دکمه‌ی «تماس با ما» بالا،
                چون این‌ها اطلاعاتی و کم‌تکرارترند نه یک اکشن پرکاربرد */}
            <p className="text-xs font-bold text-gray-400 mb-3">{tNav('quickLinks')}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                const label = link.key === 'about' ? tFooter(link.key) : tHeader(link.key);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-gray-500 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs font-bold truncate">{label}</span>
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

          <button onClick={() => setIsMenuOpen(true)} className={`relative ${tabClass(isMoreActive)}`}>
            <span className="relative">
              <MenuIcon className="h-5 w-5" strokeWidth={isMoreActive ? 2.5 : 2} />
              {/* نشان ارز فعلی: همیشه روی تب «بیشتر» دیده می‌شود، حتی وقتی شیت بسته است،
                  تا مشتری بدون باز کردن منو بداند سایت الان روی چه ارزی تنظیم شده */}
              <span
                dir="ltr"
                className={`absolute -top-1.5 -end-2.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white leading-none ${
                  isMoreActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {CURRENCY_SYMBOLS[currency] || currency}
              </span>
            </span>
            <span className="text-[10px] font-bold">{tNav('menu')}</span>
          </button>
        </div>
      </nav>

      {/* اعلان تاییدیه‌ی تغییر زبان/ارز؛ چون بیرون از شیت رندر می‌شود، حتی بعد از
          بسته شدن شیت هم دیده می‌ماند */}
      <Toast message={toastMessage} show={toastShow} onDone={() => setToastShow(false)} />
    </>
  );
}