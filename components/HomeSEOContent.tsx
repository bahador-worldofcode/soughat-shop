import { MapPin, ShieldCheck, Zap, Globe, Coins, Package, Gift, Lock } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';

// 🔧 رفع باگِ «دسته‌بندی‌ها این‌جا استاتیکه»: قبلاً این‌جا یک آرایه‌ی
// هاردکد به اسم CATEGORIES بود («فقط ۱۱ دسته‌بندی») که وقتی سایت تازه
// راه افتاده بود دستی نوشته شده بود، و با اضافه‌شدنِ ۶ دسته‌بندیِ بعدی
// (جمعاً ۱۷ تا) هیچ‌وقت به‌روزرسانی نشد — چون هیچ ارتباطی با دیتابیس
// نداشت. الان این کامپوننت (که دقیقاً برای هدفِ سئو ساخته شده) مستقیم
// از همون جدولِ categories در سوپابیس می‌خونه — دقیقاً همون کوئریِ
// ساده‌ای که در بخشِ ویترینِ دسته‌بندی‌های صفحه‌ی اصلی هم استفاده
// می‌شه، بدون هیچ limit یا slice ای — پس هر دسته‌بندیِ جدیدی که در
// آینده اضافه بشه، خودکار همین‌جا هم ظاهر می‌شه، بدون نیاز به دست‌زدن
// به کد.
//
// 🔧 نکته‌ی مهم‌ترِ فنی: این کامپوننت قبلاً 'use client' بود، یعنی
// حتی اگه دسته‌بندی‌ها را با fetch سمت مرورگر هم می‌گرفتیم، باز محتوا
// فقط بعد از اجرای جاوااسکریپت در دسترس بود — دقیقاً برعکسِ چیزی که
// از یک کامپوننتِ «محتوای سئو» انتظار می‌ره (که باید همون اول، در HTML
// خام، برای گوگل و ربات‌های هوش مصنوعی موجود باشه). با تبدیلِ این
// کامپوننت به یک Server Component (حذفِ 'use client' و استفاده از
// نسخه‌ی سرورِ next-intl)، این تناقض هم رفع شد.
export default async function HomeSEOContent() {
  const t = await getTranslations('HomeSEO');
  const locale = await getLocale();
  const isEn = locale === 'en';

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, name, name_en')
    .order('name');

  // 🖼️ عکس‌ها: فایل‌های واقعی داخل public/images پروژه با همین اسم‌ها قرار دارند.
  const images = isEn
    ? [
        { src: '/images/seo-home-en-1.webp', alt: t('image_alt_1') },
        { src: '/images/seo-home-en-2.webp', alt: t('image_alt_2') },
      ]
    : [
        { src: '/images/seo-home-fa-1.webp', alt: t('image_alt_1') },
        { src: '/images/seo-home-fa-2.webp', alt: t('image_alt_2') },
      ];

  return (
    <section className="bg-white border-t border-gray-100 py-16 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Main Title & Intro */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight text-start">
            {t('main_title')}
          </h2>
          <p className="text-gray-600 leading-8 text-lg text-justify">
            {t('intro_text')}
          </p>
        </div>

        {/* How it works (SEO focused) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t('crypto_title')}
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              {t('crypto_text')}
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              {t('guarantee_title')}
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              {t('guarantee_text')}
            </p>
          </div>
        </div>

        {/* 🆕 Worldwide ordering + No fees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
            <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('global_title')}
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              {t('global_text')}
            </p>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Coins className="h-5 w-5" />
              {t('fees_title')}
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              {t('fees_text')}
            </p>
          </div>
        </div>

        {/* Coverage Area */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-red-600" />
            {t('coverage_title')}
          </h3>
          <p className="text-gray-600 leading-7 mb-6 text-start">
            {t('coverage_text')}
          </p>

          <div className="flex flex-wrap gap-3">
            {['Tehran', 'Mashhad', 'Isfahan', 'Shiraz', 'Tabriz', 'Karaj', 'Ahvaz', 'Rasht', 'Sari', 'Kerman'].map((city) => (
              <span key={city} className="bg-white px-4 py-2 rounded-lg text-sm font-bold text-gray-700 shadow-sm border border-gray-100 flex items-center gap-1">
                <Globe className="h-3 w-3 text-gray-400" />
                {city}
              </span>
            ))}
            <span className="bg-white px-4 py-2 rounded-lg text-sm text-gray-500 border border-gray-100">
              {t('cities_other')}
            </span>
          </div>
        </div>

        {/* 🆕 Categories */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            {t('categories_title')}
          </h3>
          <p className="text-gray-600 leading-7 mb-6 text-start">
            {t('categories_text')}
          </p>
          <div className="flex flex-wrap gap-3">
            {(categories || []).map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold text-blue-800 border border-blue-100 transition-colors"
              >
                {isEn ? (cat.name_en || cat.name) : cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 🆕 Occasions + Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
            <h3 className="text-xl font-bold text-rose-900 mb-3 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              {t('occasions_title')}
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              {t('occasions_text')}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('security_title')}
            </h3>
            <p className="text-gray-700 text-sm leading-7 text-justify">
              {t('security_text')}
            </p>
          </div>
        </div>

        {/* 🆕 Images — جایگزین کن با عکس‌های واقعی خودت (توضیح بالای فایل) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {images.map((img) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full h-64 object-cover rounded-2xl border border-gray-100 shadow-sm"
            />
          ))}
        </div>

        {/* Final SEO Keywords Footer */}
        <div className="mt-12 text-center text-sm text-gray-400 leading-6">
          <p>
            {t('keywords')}
          </p>
        </div>

      </div>
    </section>
  );
}