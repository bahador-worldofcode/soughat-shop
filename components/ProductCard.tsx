'use client';

import { Plus, Minus, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation'; 
import { useTranslations, useLocale } from 'next-intl'; 
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  title: string;
  title_en?: string; 
  price: number;
  image: string;
  slug: string;
  pricing_type?: string; 
  weight?: number;
}

export default function ProductCard({ id, title, title_en, price, image, slug, pricing_type, weight }: ProductCardProps) {
  const t = useTranslations('ProductCard'); 
  const locale = useLocale();
  const isEn = locale === 'en';

  // نکته‌ی مهندسی (رفع لگ اسکرول + رفع باگِ کند/عدم‌آپدیت‌شدنِ قیمت هنگام تغییر ارز):
  // قبلاً اینجا `useStore()` بدون سلکتور صدا زده می‌شد، یعنی این کارت به کل
  // استور گوش می‌داد و با هر تغییر جزئی در استور (مثلاً وقتی هدر نرخ ارزها را
  // در پس‌زمینه fetch می‌کند، یا وقتی یک آیتم دیگر به سبد خرید اضافه می‌شود)
  // تمام کارت‌های محصول توی صفحه — حتی آن‌هایی که ربطی به آن تغییر نداشتند —
  // یک‌باره ری‌رندر می‌شدند؛ دقیقاً همان لحظه‌ای که کاربر داشت اسکرول می‌کرد.
  //
  // برای رفع آن، فقط توابع convertPrice/getSymbol/addToCart با سلکتور جدا
  // گرفته شده بودند. اما همین‌جا یک باگ جدید ایجاد شده بود: رفرنسِ این توابع
  // در استور هیچ‌وقت عوض نمی‌شود (خودِ تابع فقط لحظه‌ی اجرا شدن، مقدار جدید
  // currency را از استور می‌خواند)، پس از نگاه Zustand خروجیِ این سلکتورها
  // هیچ تغییری نمی‌کرد و این کارت اصلاً هنگام تغییر ارز توسط کاربر ری‌رندر
  // نمی‌شد — دقیقاً همان چیزی که فقط با رفرش کامل صفحه (یعنی mount دوباره‌ی
  // کامپوننت) درست می‌شد و در صفحه‌ی جزئیات محصول (که آنجا کل استور گرفته
  // می‌شود) دیده نمی‌شد.
  //
  // راه‌حل: علاوه بر توابع، خودِ مقدار currency (که یک مقدار ساده/primitive
  // است) هم با یک سلکتور جداگانه گرفته می‌شود. چون این مقدار فقط زمانی که
  // کاربر واقعاً ارز را عوض کند تغییر می‌کند، هم مشکلِ ری‌رندرهای بی‌مورد در
  // حین اسکرول حل‌شده باقی می‌ماند و هم قیمت بلافاصله و در همه‌ی بخش‌ها
  // (صفحه‌ی اصلی، لیست محصولات، محصولات مرتبط) آپدیت می‌شود.
  const currency = useStore((s) => s.currency);
  const convertPrice = useStore((s) => s.convertPrice);
  const getSymbol = useStore((s) => s.getSymbol);
  const addToCart = useStore((s) => s.addToCart);
  const decreaseFromCart = useStore((s) => s.decreaseFromCart);

  // 🔧 رفع باگ اصلی این تغییرات: قبلاً این کارت هیچ ایده‌ای از تعداد این
  // محصول در سبد خرید نداشت، برای همین همیشه فقط یک دکمه‌ی «+» ثابت نشان
  // می‌داد؛ حتی اگر کاربر چند بار روی آن زده بود. با یک سلکتور جدا فقط
  // quantity همین آیتم (نه کل آرایه‌ی cart) از استور خوانده می‌شود؛ یعنی:
  //  ۱) با اضافه/کم‌شدنِ همین محصول، خودِ همین کارت بلافاصله ری‌رندر و آیکون
  //     درست (پلاس/مینوس + تعداد) را نشان می‌دهد.
  //  ۲) با تغییرِ محصولات دیگر در سبد، این کارت (چون quantity خودش عوض
  //     نشده) دوباره بی‌دلیل ری‌رندر نمی‌شود.
  const quantity = useStore((s) => s.cart.find((item) => item.id === id)?.quantity ?? 0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finalPrice = convertPrice(price);
  const symbol = getSymbol();

  const displayTitle = isEn ? (title_en || title) : title;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, title, title_en, price, image, pricing_type, weight });
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    decreaseFromCart(id);
  };

  // آیا این محصول همین الان توی سبد خریدِ کاربر هست؟ (فقط بعد از mount شدن
  // در کلاینت این را حساب می‌کنیم تا با نسخه‌ی سرور یکی باشد و React خطای
  // hydration ندهد)
  const inCart = mounted && quantity > 0;

  return (
    <div
      className="group relative flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
      data-currency={currency}
    >
      
      <Link href={`/products/${slug}`} className="relative aspect-square overflow-hidden bg-gray-100 block flex-shrink-0">
        <Image
          src={image}
          alt={displayTitle}
          fill
          sizes="(max-width: 640px) 65vw, (max-width: 1024px) 45vw, 23vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* فاصله گذاری (پدینگ) کمی منعطف‌تر در موبایل، و تغییر line-clamp به ۲ برای متن‌های طولانی */}
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <Link href={`/products/${slug}`}>
            <h3 className="mb-2 text-[13px] md:text-base font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors text-start leading-snug">
                {displayTitle}
            </h3>
        </Link>
        
        <p className="text-[11px] md:text-sm text-gray-500 mb-4 text-start leading-relaxed">{t('instant_delivery')}</p>
       
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs text-gray-400 text-start">{t('final_price')}</span>
            <span className="text-lg md:text-xl font-bold text-blue-600 font-mono text-start">
              {mounted ? (
                <>
                  {symbol} {finalPrice.toFixed(2)}
                </>
              ) : (
                <>
                  $ {price.toFixed(2)}
                </>
              )}
            </span>
          </div>

          {/* اگر این محصول از قبل توی سبد خرید باشد، به‌جای دکمه‌ی ثابتِ «+»
              یک استپر کوچک (کم / تعداد / زیاد) نشان داده می‌شود؛ دقیقاً همان
              رفتاری که در فروشگاه‌های حرفه‌ای می‌بینید. */}
          {inCart ? (
            <div className="flex items-center gap-0.5 h-9 md:h-10 flex-shrink-0 rounded-full bg-gray-50 border border-gray-200 p-1 z-10">
              <button
                onClick={handleDecrease}
                aria-label={t('decrease_quantity')}
                className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition-colors hover:text-red-500 hover:bg-red-50 active:scale-95 cursor-pointer"
              >
                {quantity === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
              </button>

              <span className="w-5 text-center font-bold text-gray-800 text-xs md:text-sm tabular-nums">
                {quantity}
              </span>

              <button
                onClick={handleAddToCart}
                aria-label={t('increase_quantity')}
                className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              aria-label={t('add_to_cart')}
              className="flex h-9 w-9 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 shadow-lg active:scale-95 cursor-pointer z-10"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}