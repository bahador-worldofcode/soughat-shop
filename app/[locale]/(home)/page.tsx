import { Suspense } from 'react';
import Hero from "@/components/Hero";
import MarketRates from "@/components/MarketRates";
import ProductCard from "@/components/ProductCard";
import CurrencyRatesBanner from "@/components/CurrencyRatesBanner";
import FAQ from "@/components/FAQ";
import HomeSEOContent from "@/components/HomeSEOContent";
import ReviewsFeed from "@/components/ReviewsFeed";
import LazySection from "@/components/LazySection";
import BlogRail from "@/components/BlogRail";
import Skeleton from "@/components/skeletons/Skeleton";
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Layers, Sparkles, ChevronsRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export const revalidate = 60;

// ⚠️ این عدد باید همیشه دقیقاً با BATCH_SIZE داخل components/ReviewsFeed.tsx
// یکی باشد (همون تعداد نظری که هر بار لود می‌شود). اگر یکی را عوض کردی،
// آن یکی را هم عوض کن.
const REVIEWS_BATCH_SIZE = 6;

// ============================================================================
// 🆕 معماری جدید صفحه‌ی اصلی — بارگذاری «جز به جز» (Streaming per Suspense)
// ----------------------------------------------------------------------------
// قبلاً کل این صفحه یک تابع async واحد بود که ۶ کوئری جدا به Supabase را
// یکی‌یکی و پشت سر هم await می‌کرد (محصولات، دسته‌بندی‌ها، محصولات هر
// دسته، تنظیمات هیرو، نظرات اولیه، میانگین امتیازها). چون هیچ Suspense
// داخلی‌ای وجود نداشت، Next.js مجبور بود صبر کند تا *همه‌ی* این کوئری‌ها
// با هم تمام شوند و بعد کل HTML صفحه را یک‌جا بفرستد — دقیقاً همان
// «سه ثانیه صبر، بعد همه‌چیز با هم می‌پرد تو صفحه».
//
// الان هر بخش (هیرو، نرخ لحظه‌ای، جدیدترین محصولات، دسته‌بندی‌ها، نظرات)
// یک کامپوننت async مستقل و خودکفاست که کوئری خودش را می‌زند و داخل
// <Suspense> جدای خودش قرار گرفته. نتیجه: هر بخش به محض آماده‌شدنِ
// داده‌ی خودش، مستقل از بقیه، به‌صورت نرم (fade-in) وارد صفحه می‌شود —
// نه اینکه همه با هم منتظر کندترین کوئری بمانند.
// ============================================================================

// ---------------------------------------------------------------------------
// بخش ۱: هیرو (بنر اصلی)
// ---------------------------------------------------------------------------
async function HeroSection({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const { data: settingsData } = await supabase.from('site_settings').select('*');
  const settings: any = {};
  if (settingsData) {
    settingsData.forEach(item => { settings[item.key] = item.value; });
  }

  const heroTitle = isEn ? (settings['hero_title_en'] || settings['hero_title']) : settings['hero_title'];
  const heroSubtitle = isEn ? (settings['hero_subtitle_en'] || settings['hero_subtitle']) : settings['hero_subtitle'];

  return (
    <div className="animate-in fade-in duration-700">
      <Hero
        banner={settings.hero_banner}
        title={heroTitle}
        subtitle={heroSubtitle}
      />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-900 to-blue-950 min-h-[auto] md:min-h-[600px] py-12 md:py-0">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="flex-1 w-full flex flex-col items-center md:items-start gap-4">
            <div className="h-7 w-32 rounded-full bg-white/10 animate-pulse" />
            <div className="h-9 md:h-14 w-4/5 max-w-md rounded-xl bg-white/10 animate-pulse" />
            <div className="h-9 md:h-14 w-3/5 max-w-sm rounded-xl bg-white/10 animate-pulse" />
            <div className="h-4 w-full max-w-md rounded-lg bg-white/10 animate-pulse mt-2" />
            <div className="h-4 w-2/3 max-w-sm rounded-lg bg-white/10 animate-pulse" />
            <div className="flex gap-4 mt-4">
              <div className="h-14 w-40 rounded-xl bg-white/10 animate-pulse" />
              <div className="h-14 w-40 rounded-xl bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 flex justify-center w-full">
            <div className="w-56 h-56 md:w-80 md:h-80 rounded-3xl bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// بخش ۲: نوار نرخ لحظه‌ای (MarketRates خودش یک کامپوننت async مستقل با
// کوئری خودش است؛ فقط لازم بود داخل Suspense مخصوص خودش قرار بگیرد تا
// دیگر بقیه‌ی صفحه را معطل نکند)
// ---------------------------------------------------------------------------
function MarketRatesSkeleton() {
  return (
    <section className="container mx-auto px-4 -mt-6 relative z-20 mb-12">
      <div className="bg-white/80 border border-white/40 shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-slate-900 p-3 px-6 flex justify-between items-center">
          <Skeleton className="h-4 w-24 bg-slate-700" />
          <Skeleton className="h-3 w-14 bg-slate-700" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 divide-x divide-y md:divide-y-0 divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 flex flex-col items-center gap-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-2 w-8" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// بخش ۳: جدیدترین محصولات
// ---------------------------------------------------------------------------
async function NewestProductsSection({ locale }: { locale: string }) {
  const t = await getTranslations('Home');
  const isEn = locale === 'en';

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <section className="container mx-auto px-4 mb-14 md:mb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            {t('newest_title')}
          </h2>
        </div>

        {/* یک لینک واحد «مشاهده همه محصولات» که فقط با کلاس‌های ریسپانسیو ظاهرش (نه تعدادش) تغییر می‌کند؛
            همین طراحی از تکرار المان در DOM جلوگیری می‌کند تا هیچ‌وقت دوتایی دیده نشود */}
        <div className="flex items-center justify-between md:justify-end gap-4 mt-1 md:mt-0">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 md:gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 md:hover:bg-blue-50 md:px-4 md:py-2 md:rounded-xl transition-all group"
          >
            {t('view_all')}
            <ArrowLeft className={`h-4 w-4 transition-transform ${isEn ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
          </Link>

          {/* هینت اسکرول عرضی، فقط زیر sm (موبایل واقعی) */}
          <div className="flex-shrink-0 flex sm:hidden items-center justify-center w-8 h-8 rounded-full bg-blue-50/50 border border-blue-100/60 opacity-80 animate-pulse shadow-sm pointer-events-none">
            <ChevronsRight className={`h-4 w-4 text-blue-500 ${!isEn ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {(!products || products.length === 0) ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-lg">{t('products_loading')}</p>
        </div>
      ) : (
        <div className="flex gap-4 items-stretch overflow-x-auto no-scrollbar overscroll-x-contain [-webkit-overflow-scrolling:touch] -mx-4 px-4 pb-1 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0 lg:grid-cols-4">
          {products.map((product) => {
            return (
              <div
                key={product.id}
                className="w-[65%] min-w-[240px] max-w-[290px] flex-shrink-0 sm:w-auto sm:flex-none sm:contents"
              >
                <ProductCard
                  id={product.id}
                  title={product.title}
                  title_en={product.title_en}
                  price={product.price}
                  image={product.image}
                  slug={product.slug}
                  pricing_type={product.pricing_type}
                  weight={product.weight}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function NewestProductsSkeleton() {
  return (
    <section className="container mx-auto px-4 mb-14 md:mb-20">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-28 hidden sm:block" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-3 sm:p-4 h-[260px] sm:h-[300px] border border-gray-100 flex flex-col gap-3 sm:gap-4"
          >
            <Skeleton className="h-32 sm:h-40 w-full rounded-xl" />
            <Skeleton className="h-3.5 sm:h-4 w-3/4" />
            <Skeleton className="h-3.5 sm:h-4 w-1/2" />
            <div className="flex items-end justify-between mt-auto">
              <Skeleton className="h-5 sm:h-6 w-14 sm:w-16" />
              <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// بخش ۴: دسته‌بندی‌ها (Category Sections)
// نکته: LazySectionهای داخلی (content-visibility برای اسکرول روان مرورگر)
// دقیقاً مثل قبل حفظ شده‌اند؛ فقط کل بلوک حالا در Suspense خودش قرار گرفته
// تا کوئری‌اش بقیه‌ی صفحه را معطل نکند.
// ---------------------------------------------------------------------------
async function CategorySectionsBlock({ locale }: { locale: string }) {
  const t = await getTranslations('Home');
  const isEn = locale === 'en';

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const categorySections: { category: any; items: any[] }[] = [];
  if (categories && categories.length > 0) {
    const results = await Promise.all(
      categories.map((cat) =>
        supabase
          .from('products')
          .select('*')
          .eq('category', cat.slug)
          .order('created_at', { ascending: false })
          .limit(4)
      )
    );

    categories.forEach((cat, idx) => {
      const items = results[idx]?.data || [];
      if (items.length > 0) {
        categorySections.push({ category: cat, items });
      }
    });
  }

  if (categorySections.length === 0) return null;

  return (
    <LazySection minHeight={categorySections.length * 420}>
      <section className="container mx-auto px-4 mb-14 md:mb-20 animate-in fade-in duration-500">
        <div className="flex flex-col">
          {categorySections.map(({ category: cat, items }, index) => {
            const catName = isEn ? (cat.name_en || cat.name) : cat.name;
            const isLast = index === categorySections.length - 1;

            return (
              <LazySection
                key={cat.id}
                minHeight={380}
                rootMargin="600px 0px"
                className={`pb-8 md:pb-10 ${!isLast ? 'mb-8 md:mb-10 border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                      {cat.icon_url ? (
                        // توجه: عمداً از next/image استفاده نشده. آدرس آیکون توسط ادمین
                        // به‌صورت متن آزاد وارد می‌شود (می‌تواند هر دامنه یا فرمتی، از جمله
                        // SVG، باشد) و next/image برای دامنه‌های ناشناس/SVG خطای رانتایم
                        // می‌دهد. چون آیکون خیلی کوچک است، سود بهینه‌سازی ارزش این ریسک را ندارد.
                        <img
                          src={cat.icon_url}
                          alt={catName}
                          className="w-7 h-7 md:w-8 md:h-8 object-contain"
                        />
                      ) : (
                        <Layers className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                      {catName}
                    </h3>
                  </div>

                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all group"
                  >
                    <span className="hidden sm:inline">{t('view_all')}</span>
                    <span className="sm:hidden">{t('view_category')}</span>
                    <ArrowLeft className={`h-4 w-4 transition-transform ${isEn ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                  </Link>
                </div>

                <div className="flex gap-4 items-stretch overflow-x-auto no-scrollbar overscroll-x-contain [-webkit-overflow-scrolling:touch] -mx-4 px-4 pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0 md:gap-6 lg:grid-cols-4">
                  {items.map((product) => (
                    <div
                      key={product.id}
                      className="w-[65%] min-w-[240px] max-w-[290px] flex-shrink-0 sm:w-auto sm:flex-none sm:contents"
                    >
                      <ProductCard
                        id={product.id}
                        title={product.title}
                        title_en={product.title_en}
                        price={product.price}
                        image={product.image}
                        slug={product.slug}
                        pricing_type={product.pricing_type}
                        weight={product.weight}
                      />
                    </div>
                  ))}
                </div>
              </LazySection>
            );
          })}
        </div>
      </section>
    </LazySection>
  );
}

function CategorySectionsSkeleton() {
  return (
    <section className="container mx-auto px-4 mb-14 md:mb-20">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-11 w-11 md:h-12 md:w-12 rounded-2xl" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-3 sm:p-4 h-[220px] sm:h-[260px] border border-gray-100 flex flex-col gap-3"
          >
            <Skeleton className="h-28 sm:h-32 w-full rounded-xl" />
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// بخش ۵: نظرات مشتریان + JSON-LD (AggregateRating)
// ---------------------------------------------------------------------------
async function ReviewsSection() {
  const t = await getTranslations('Home');

  // ================================================================
  // نظرات مشتریان — سمت سرور خوانده می‌شود (نه فقط داخل مرورگر بعد از
  // لود صفحه)، تا گوگل و ربات‌های هوش مصنوعی که جاوااسکریپت اجرا
  // نمی‌کنند هم متن واقعی نظرات را در HTML خام ببینند، و AggregateRating
  // به‌صورت JSON-LD به گوگل داده شود. هر دو کوئری اینجا مستقل از هم‌اند
  // پس با Promise.all موازی اجرا می‌شوند (به‌جای دو await پشت سر هم).
  // ================================================================
  const [{ data: initialReviews }, { data: allApprovedRatings }] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(0, REVIEWS_BATCH_SIZE - 1),
    supabase
      .from('reviews')
      .select('rating')
      .eq('is_approved', true),
  ]);

  const reviewCount = allApprovedRatings?.length || 0;
  const averageRating = allApprovedRatings && allApprovedRatings.length > 0
    ? allApprovedRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allApprovedRatings.length
    : 0;

  const reviewsInitialHasMore = (initialReviews?.length || 0) === REVIEWS_BATCH_SIZE;

  const reviewsJsonLd = reviewCount > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Soughat Shop',
    url: 'https://soughat.shop',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    review: (initialReviews || []).slice(0, 5).map((r: any) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.sender_name || 'مشتری' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: r.comment,
      datePublished: r.created_at,
    })),
  } : null;

  // چون متن نظرات را خود مشتری می‌نویسد (نه ادمین، برخلاف محتوای بلاگ)،
  // قبل از تزریق به تگ <script>، هر دنباله‌ی "</script>" را بی‌خطر
  // می‌کنیم تا هیچ متن نظری نتواند از تگ اسکریپت خارج شده و کد اجرا کند.
  const reviewsJsonLdString = reviewsJsonLd
    ? JSON.stringify(reviewsJsonLd).replace(/<\/script/gi, '<\\/script')
    : null;

  return (
    <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-16 mt-12 animate-in fade-in duration-500">
      <div className="container mx-auto px-4">

        {/* 🆕 داده‌ی ساخت‌یافته (JSON-LD): میانگین امتیاز + چند نمونه نظر،
            برای گوگل و موتورهای هوش مصنوعی. چیزی که کاربر روی صفحه
            می‌بیند هیچ تغییری نمی‌کند — این فقط یک لایه‌ی نامرئی
            اضافه‌ست. */}
        {reviewsJsonLdString && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: reviewsJsonLdString }}
          />
        )}

        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-4">
            {t('reviews_title')}
          </h2>
          <p className="text-blue-200 text-sm mb-6">
            {t('reviews_subtitle')}
          </p>
          <Link href="/review" className="inline-block bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-8 py-3 rounded-full transition-all backdrop-blur-sm shadow-lg hover:-translate-y-1">
            {t('write_review')}
          </Link>
        </div>

        <ReviewsFeed
          initialReviews={initialReviews || []}
          initialHasMore={reviewsInitialHasMore}
        />

      </div>
    </section>
  );
}

function ReviewsSkeleton() {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-16 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 mb-12">
          <Skeleton className="h-8 w-56 bg-white/10" />
          <Skeleton className="h-4 w-72 bg-white/10" />
          <Skeleton className="h-11 w-40 rounded-full bg-white/10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-3 w-full bg-white/10" />
              <Skeleton className="h-3 w-4/5 bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// کامپوننت اصلی صفحه — حالا فقط یک «چارچوب» است؛ هیچ کوئری‌ای مستقیم
// اینجا زده نمی‌شود. هر بخش، خودش را در Suspense مخصوص خودش می‌سازد.
// ============================================================================
export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Home');

  return (
    <main className="flex flex-col min-h-screen font-[family-name:var(--font-vazir)] bg-gray-50/50">

      {/* 1. هیرو */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection locale={locale} />
      </Suspense>

      {/* 2. نرخ لحظه‌ای بالای صفحه */}
      <Suspense fallback={<MarketRatesSkeleton />}>
        <MarketRates />
      </Suspense>

      {/* 3. جدیدترین محصولات */}
      <Suspense fallback={<NewestProductsSkeleton />}>
        <NewestProductsSection locale={locale} />
      </Suspense>

      {/* 4. دسته‌بندی‌ها */}
      <Suspense fallback={<CategorySectionsSkeleton />}>
        <CategorySectionsBlock locale={locale} />
      </Suspense>

      {/* 5. نرخ لحظه‌ای ارزها — پایین‌تر از دسته‌بندی‌ها */}
      <LazySection minHeight={400}>
        <div className="bg-white py-12 border-t border-gray-200">
          <div className="container mx-auto px-4 mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">{t('rates_title')}</h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto leading-7">{t('rates_desc')}</p>
          </div>
          <div>
            <CurrencyRatesBanner />
          </div>
        </div>
      </LazySection>

      {/* 6. نظرات کاربران */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection />
      </Suspense>

      {/* 7. سوالات متداول */}
      <LazySection minHeight={700}>
        <FAQ />
      </LazySection>

      {/* 8. متن سئوی صفحه اصلی */}
      <LazySection minHeight={500}>
        <HomeSEOContent />
      </LazySection>

      {/* 9. وبلاگ — پایین‌ترین بخش صفحه، درست بالای فوتر. */}
      <LazySection minHeight={480}>
        <BlogRail />
      </LazySection>

    </main>
  );
}