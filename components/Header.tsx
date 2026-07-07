'use client';
import { useState, useEffect, useRef, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, Globe, Search, X, Loader2, User } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { isMobileNavHidden } from '@/lib/navVisibility';
import { useAuthState } from '@/lib/useAuthState';

export default function Header() {
  const t = useTranslations('Header');
  const locale = useLocale(); // دریافت زبان فعلی
  const isEn = locale === 'en';

  // دریافت متد totalItems از استور (که اکنون هوشمند شده و حواله را ۱ عدد می‌شمارد)
  const { currency, setCurrency, totalItems, fetchRates } = useStore();

  // آیا کاربر وارد سیستم شده؟ (برای نمایش آیکون پروفایل)
  const isAuthed = useAuthState();

  // محاسبه تعداد آیتم‌های سبد خرید
  const cartCount = totalItems();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // آیا سرچ موبایل (باز شونده با تپ روی آیکون) باز است؟
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // isLangPending یعنی «سوییچ زبان در حال انجام است» — دقیقاً همان الگوی
  // MobileBottomNav.tsx (useTransition به‌جای useState دستی)، تا رفتار
  // دکمه‌ی زبان دسکتاپ و موبایل کاملاً یکسان باشد.
  const [isLangPending, startLangTransition] = useTransition();

  // isSearchPending یعنی «جستجو در حال ریدایرکت‌شدن به صفحه‌ی محصولات است»؛
  // چون router.push یک ناوبری است نه یک state محلی، useTransition دقیقاً
  // همان لحظه‌ای که React واقعاً منتظر رندر مسیر مقصد است true می‌شود.
  const [isSearchPending, startSearchTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();
  // next-intl's usePathname عمداً query string را برنمی‌گرداند؛ برای همین جدا
  // از next/navigation می‌گیریمش تا هنگام سوییچ زبان بتوانیم آن را حفظ کنیم.
  const searchParams = useSearchParams();

  // در موبایل، آیتم‌های اصلی ناوبری (خانه، محصولات، سبد خرید، پیگیری، منو)
  // به نوار پایین صفحه منتقل شده‌اند. آیکون سبد خرید هدر فقط در صفحاتی که
  // آن نوار پایین نمایش داده نمی‌شود (مثل جزئیات محصول) در موبایل دیده می‌شود،
  // تا کاربر همیشه یک راه برای رسیدن به سبد خرید داشته باشد.
  const showMobileCartIcon = isMobileNavHidden(pathname);

  useEffect(() => {
    setMounted(true);
    fetchRates();
  }, []);

  // با هر تغییر مسیر، اگر سرچ موبایل باز مانده بود، بسته شود
  useEffect(() => {
    setMobileSearchOpen(false);
  }, [pathname]);

  // با باز شدن سرچ موبایل، فوکوس خودکار روی اینپوت برای تایپ سریع‌تر
  useEffect(() => {
    if (mobileSearchOpen) mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isSearchPending) {
      startSearchTransition(() => {
        router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      });
      setMobileSearchOpen(false);
    }
  };

  const toggleLanguage = () => {
    if (isLangPending) return; // از تپ چندباره در حین سوییچ جلوگیری می‌کند
    const newLocale = isEn ? 'fa' : 'en';
    // رفع باگ: قبلاً فقط pathname (بدون query string) پاس داده می‌شد، برای همین
    // فیلترهایی مثل ?category=... یا ?q=... موقع سوییچ زبان پاک می‌شدند.
    // حالا query string فعلی را عیناً به مسیر مقصد اضافه می‌کنیم تا حفظ شود.
    const query = searchParams.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    startLangTransition(() => {
      router.replace(target, { locale: newLocale });
    });
  };

  return (
    // نکته‌ی مهندسی: در موبایل هدر دیگر sticky نیست (relative)، چون فضای نمایش
    // گوشی محدود است و ناوبری اصلی همیشه از طریق نوار پایین ثابت در دسترس
    // است؛ نیازی نیست هدر هم دائم فضای دید را اشغال کند. در دسکتاپ (md به بالا)
    // که فضای صفحه بیشتر است، رفتار قبلی (چسبیده به بالا) حفظ شده است.
    <header className="relative md:sticky md:top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4">

        {/* ============================= ردیف موبایل ============================= */}
        {/* یک ردیف باریک (۵۶ پیکسل): آیکون جستجو، لوگوی وسط‌چین، آیکون سبد خرید
            (در صورت نیاز). با تپ روی آیکون جستجو، همین ردیف به یک نوار جستجوی
            تمام‌عرض تبدیل می‌شود؛ به این ترتیب سرچ همیشه در دسترس است اما فضای
            دائمی از هدر نمی‌گیرد — الگویی که در اکثر اپ‌های موبایل مدرن دیده می‌شود.

            نکته‌ی مهم (رفع باگ): قبلاً این ردیف grid-cols-3 بود، یعنی هر سه
            ستون دقیقاً ۱/۳ عرض را می‌گرفتند و ستون وسط (لوگو) هرچه فضای متن
            برند بزرگ‌تر بود، مجبور به truncate (سه‌نقطه) می‌شد. با
            grid-cols-[1fr_auto_1fr] ستون وسط دقیقاً به اندازه‌ی محتوایش
            (آیکون + متن برند) عرض می‌گیرد و هرگز بریده نمی‌شود، و دو ستون
            کناری (۱fr) فضای باقی‌مانده را مساوی تقسیم می‌کنند تا لوگو همچنان
            دقیقاً وسط‌چین بماند. */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 md:hidden">
          {mobileSearchOpen ? (
            <form
              onSubmit={handleSearch}
              className="col-span-3 flex items-center gap-2"
            >
              <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-3 py-2 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
                {isSearchPending ? (
                  <Loader2 className="h-4 w-4 text-blue-500 flex-shrink-0 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  disabled={isSearchPending}
                  className={`bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 disabled:opacity-60 ${!isEn ? 'mr-3' : 'ml-3'}`}
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                aria-label={t('closeSearch')}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          ) : (
            <>
              <div className="flex justify-start">
                <button
                  onClick={() => setMobileSearchOpen(true)}
                  aria-label={t('search')}
                  className="p-2 -ms-2 rounded-xl text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* توجه: عمداً دیگه dir="ltr" روی این Link ثابت نیست. طبق
                  قانون کلی سایت، آیکون همیشه *بعد* از نوشته می‌آید (در
                  ترتیب خواندن)؛ چون فارسی راست‌به‌چپ است، «بعد از نوشته»
                  در فارسی یعنی سمت چپ نوشته قرار می‌گیرد و خود نوشته سمت
                  راست می‌ماند — دقیقاً برعکس انگلیسی که «بعد از نوشته»
                  یعنی سمت راست. با حذف dir ثابت، این چرخش به‌صورت طبیعی
                  و خودکار توسط جهت صفحه (rtl/ltr) انجام می‌شود. */}
              <Link href="/" className="flex items-center justify-center gap-2 flex-shrink-0">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-blue-100 flex-shrink-0">
                  <img src="/logo.png" alt="Soughat Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-base font-extrabold text-blue-600 tracking-tighter leading-none whitespace-nowrap">
                  {t('brand')}
                </span>
              </Link>

              <div className="flex justify-end">
                {showMobileCartIcon && (
                  <Link href="/cart">
                    <button className="relative p-2 -me-2 rounded-xl text-gray-600 hover:bg-blue-50 active:bg-blue-100 transition-colors">
                      <ShoppingBag className="h-5 w-5" />
                      {mounted && cartCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>

        {/* ============================= ردیف دسکتاپ ============================= */}
        <div className="hidden md:flex h-16 items-center justify-between gap-4">

          {/* Logo Section — همان dir="ltr" ثابت برای هماهنگی با نسخه موبایل
              و برند، به‌علاوه‌ی متن برند لوکالایز‌شده (t('brand')) */}
          <Link href="/" dir="ltr" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-blue-100 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Soughat Logo" className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-xl font-extrabold text-blue-600 tracking-tighter leading-none">
                {t('brand')}
              </span>
              <span className="text-[10px] md:text-xs text-gray-500 font-bold mt-1 tracking-wide">
                {t('subtitle')}
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-1 max-w-md items-center bg-gray-100 rounded-xl px-4 py-2 mx-4 border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all">
            {isSearchPending ? (
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              disabled={isSearchPending}
              className={`bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 disabled:opacity-60 ${!isEn ? 'mr-3' : 'ml-3'}`}
            />
          </form>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <Link href="/" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
              {t('home')}
            </Link>
            <Link href="/products" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
              {t('products')}
            </Link>
            <Link href="/send-money-to-iran" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
              {t('remit')}
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

            {/* Language Switcher Button — الگوی useTransition + آیکون در حال
                چرخش، دقیقاً هماهنگ با نسخه‌ی موبایل در MobileBottomNav.tsx */}
            <button
              onClick={toggleLanguage}
              disabled={isLangPending}
              aria-busy={isLangPending}
              className="flex items-center gap-2 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-200 px-4 py-1.5 rounded-xl transition-all shadow-sm hover:shadow group min-w-[80px] justify-center disabled:opacity-70 disabled:cursor-wait"
              title={!isEn ? t('switch_to_english') : t('switch_to_farsi')}
            >
              {isLangPending ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              ) : (
                <Globe className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              )}
              {/* نمایش زبان مقصد: اگر انگلیسی هستیم دکمه فارسی را نشان بده و برعکس */}
              <span className="text-sm font-bold text-gray-600 group-hover:text-blue-700 pt-0.5">
                {isLangPending ? t('switchingLanguage') : (isEn ? t('lang_name_fa') : t('lang_name_en'))}
              </span>
            </button>

            {/* Currency Switcher */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-2 py-1.5 bg-gray-50 hover:bg-white transition-all shadow-sm hover:shadow cursor-pointer">
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

            {/* Profile Button — فقط برای کاربران واردشده نمایش داده می‌شود */}
            {isAuthed && (
              <Link href="/profile" aria-label={t('profile_aria')}>
                <button className="relative p-2.5 hover:bg-blue-50 rounded-xl transition-colors group border border-transparent hover:border-blue-100">
                  <User className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                </button>
              </Link>
            )}

            {/* Cart Button */}
            <Link href="/cart">
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
      </div>
    </header>
  );
}