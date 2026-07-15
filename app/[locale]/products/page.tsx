import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import ProductsClientView from '@/components/ProductsClientView';
import ProductsSEOContent from '@/components/ProductsSEOContent';
import LazySection from '@/components/LazySection';
import { stripHtmlToText, truncateAtWordBoundary } from '@/lib/sanitizeHtml';

// این صفحه چون بر اساس searchParams (دسته‌بندی/جستجو/مرتب‌سازی/صفحه) فیلتر می‌شه،
// همیشه به‌صورت داینامیک روی سرور رندر می‌شه (نه استاتیک) — دقیقاً چیزی که برای
// دیده‌شدن توسط گوگل و بات‌های هوش مصنوعی لازم داریم: HTML اولیه‌ی هر درخواست
// همیشه شامل محصولات واقعیه، نه یک صفحه‌ی خالی که بعداً با JS پر بشه.
//
// 🆕 رفع بحران «Exceeded free resources - Fluid Active CPU» (گام ۲):
// -----------------------------------------------------------------------
// این صفحه به هیچ عنوان استاتیک/ISR نمی‌شود (و طبق «قانون هشدار» پرامپت
// شما، دست‌نخورده هم می‌ماند) چون searchParams برای فیلترها لازم است و
// خیلی از ربات‌های هوش مصنوعی اصلاً جاوااسکریپت اجرا نمی‌کنند — پس اگر
// این بخش را به fetch سمت کلاینت (SWR/React Query) تبدیل کنیم، آن‌ها
// صفحه را خالی می‌بینند و دقیقاً همان چیزی می‌شود که قانون شماره‌ی ۳
// پرامپت گفته بود «به هیچ وجه کد را تغییر نده».
//
// راه‌حلِ درست (و همانی که در پرامپت‌تان پیشنهاد شده بود): خودِ رندر شدنِ
// صفحه در هر درخواست اجتناب‌ناپذیر است، اما کوئری‌های سنگین Supabase که
// واقعاً هزینه‌ی اصلی CPU/شبکه را ایجاد می‌کنند را می‌شود جدا، با
// unstable_cache، به‌ازای هر ترکیبِ فیلتر (دسته/جستجو/مرتب‌سازی/صفحه) تا
// ۶۰ ثانیه کش کرد. یعنی اگر دو کاربر (یا گوگل‌بات و یک کاربر) دقیقاً همون
// فیلتر را در همون بازه‌ی ۶۰ ثانیه بخواهند، دومی به‌جای زدن کوئری تازه به
// Supabase، مستقیم از Data Cache خودِ Next.js جواب می‌گیرد — همون فلسفه‌ی
// دکمه‌ی «کش سایت» که همین الان در app/admin/cache/page.tsx دارید، فقط
// یک لایه عمیق‌تر و خودکار.
export const revalidate = 0;

const getCachedCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { data } = await supabase.from('categories').select('*').order('name');
    return (data || []) as Category[];
  },
  ['products-page-categories'],
  { revalidate: 60, tags: ['categories'] }
);

// توجه مهم: تمام پارامترهایی که روی نتیجه‌ی این کوئری اثر می‌گذارند (جدول
// مبدا، عبارت جستجو، زبان، دسته‌بندی، مرتب‌سازی، بازه‌ی صفحه‌بندی) باید
// حتماً به‌عنوان آرگومان به این تابع پاس داده شوند، نه این‌که از بیرون
// (closure) خوانده شوند؛ چون Next.js کلید کش را دقیقاً از روی همین
// آرگومان‌ها می‌سازد. اگر یکی از این‌ها را از بیرون بخوانیم، همه‌ی
// فیلترها با هم قاطی می‌شوند و کاربر محصولاتِ فیلترِ اشتباه را می‌بیند —
// دقیقاً همان چیزی که «قانون بدون خرابی فیچرها»ی شما ممنوع کرده.
const getCachedProducts = unstable_cache(
  async (
    sourceTable: string,
    currentSearch: string,
    isEn: boolean,
    currentCategory: string,
    currentSort: string,
    from: number,
    to: number
  ): Promise<{ data: any[]; count: number }> => {
    let query = supabase.from(sourceTable).select('*', { count: 'exact' });

    if (currentSearch) {
      if (isEn) {
        query = query.or(`title.ilike.%${currentSearch}%,title_en.ilike.%${currentSearch}%`);
      } else {
        query = query.ilike('title', `%${currentSearch}%`);
      }
    }

    if (currentCategory !== 'all') {
      query = query.eq('category', currentCategory);
    }

    if (currentSort === 'featured') {
      query = query.order('category_rank', { ascending: true }).order('created_at', { ascending: false });
    } else if (currentSort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (currentSort === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (currentSort === 'price-desc') {
      query = query.order('price', { ascending: false });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;

    // 🆕 عمداً اینجا throw می‌کنیم (نه return با error داخلش): اگر خطای
    // موقتِ Supabase را return کنیم، unstable_cache همان خطا/نتیجه‌ی خالی
    // را هم تا ۶۰ ثانیه کش می‌کند و کاربرهای بعدی هم صفحه‌ی خالی می‌بینند.
    // با throw کردن، Next.js این نتیجه را اصلاً کش نمی‌کند و درخواستِ بعدی
    // دوباره تلاش می‌کند؛ خطا پایین‌تر در همان جایی که همیشه بود گرفته می‌شود.
    if (error) {
      throw new Error(error.message);
    }

    return { data: data || [], count: count || 0 };
  },
  ['products-page-list'],
  { revalidate: 60, tags: ['products-list'] }
);

interface Product {
  id: string;
  title: string;
  title_en?: string;
  price: number;
  image: string;
  slug: string;
  category: string;
  created_at?: string;
  pricing_type?: string;
  weight?: number;
}

interface Category {
  id: string;
  name: string;
  name_en?: string;
  slug: string;
  icon_url?: string;
  description?: string;
  description_en?: string;
  seo_title?: string;
  seo_desc?: string;
  seo_desc_en?: string;
}

const PAGE_SIZE = 12;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; sort?: string; page?: string }>;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';
}

async function getActiveCategory(categorySlug: string | undefined): Promise<Category | null> {
  if (!categorySlug || categorySlug === 'all') return null;
  // 🆕 به‌جای یک کوئری جداگانه‌ی «فقط همین دسته»، از همون لیستِ کشِ‌شده‌ی
  // دسته‌بندی‌ها استفاده می‌کنیم (که چند خط پایین‌تر در خودِ صفحه هم دوباره
  // لازم است) — یعنی این تابع دیگر یک کوئری اضافه به Supabase نمی‌زند.
  const categories = await getCachedCategories();
  return categories.find((c) => c.slug === categorySlug) || null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const isEn = locale === 'en';
  const siteUrl = getSiteUrl();

  const currentCategory = sp.category ? decodeURIComponent(sp.category).trim() : 'all';
  const activeCategory = await getActiveCategory(currentCategory);

  const categoryName = activeCategory
    ? (isEn ? (activeCategory.name_en || activeCategory.name) : activeCategory.name)
    : null;

  const title = activeCategory
    ? (isEn
        ? (activeCategory.seo_title || `${categoryName} | Soughat Shop`)
        : (activeCategory.seo_title || `${categoryName} | سوغات شاپ`))
    : (isEn
        ? 'All Products | Soughat Shop - Send Gifts to Iran with Crypto'
        : 'همه‌ی محصولات | سوغات شاپ - ارسال هدیه به ایران با کریپتو');

  const description = activeCategory
    ? (isEn
        ? (activeCategory.seo_desc_en || stripHtmlToText(activeCategory.description_en || activeCategory.description || '').substring(0, 160))
        : (activeCategory.seo_desc || stripHtmlToText(activeCategory.description || '').substring(0, 160)))
    : (isEn
        ? 'Browse every Soughat Shop product: Iranian sweets, handicrafts, gold, jewelry and gift cards. Pay with USDT, Bitcoin or Solana — delivered anywhere in Iran.'
        : 'همه‌ی محصولات سوغات شاپ را ببینید: شیرینی، صنایع‌دستی، طلا، جواهر و کارت هدیه ایرانی. پرداخت با تتر، بیت‌کوین یا سولانا و تحویل در سراسر ایران.');

  const canonicalPath = currentCategory !== 'all' ? `/products?category=${encodeURIComponent(currentCategory)}` : '/products';

  return {
    // 🔧 رفع باگ «۲ بار سوغات شاپ در تایتل»: متغیر title بالاتر همیشه خودش
    // شامل «| Soughat Shop» یا «| سوغات شاپ» هست (چه از activeCategory.seo_title
    // چه از رشته‌ی ثابت پیش‌فرض). اگه به‌صورت رشته‌ی ساده بدیمش، لایوت دوباره
    // template «%s | Soughat Shop» رو اضافه می‌کنه و برند دو بار تکرار میشه.
    // title.absolute یعنی «همین رو دقیقاً همین‌طوری بفرست، دست لایوت بهش نرسه».
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}${canonicalPath}`,
      type: 'website',
      locale: locale === 'fa' ? 'fa' : 'en',
      siteName: 'Soughat Shop',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}${canonicalPath}`,
      languages: {
        fa: `${siteUrl}/fa${canonicalPath}`,
        en: `${siteUrl}/en${canonicalPath}`,
      },
    },
  };
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const isEn = locale === 'en';

  // 🆕 خودِ این صفحه به‌خاطر searchParams همیشه داینامیک می‌ماند (طبق طراحیِ
  // درستِ فعلی)، اما صدا زدنِ این خط ضرری ندارد و برای هماهنگی با بقیه‌ی
  // صفحات، طبق توصیه‌ی next-intl، همچنان انجام می‌شود.
  setRequestLocale(locale);

  const t = await getTranslations('ProductsPage');
  // TASK-07: برای متن «خانه» و «محصولات» در BreadcrumbList از همون کلیدهای
  // موجود namespace هدر استفاده می‌کنیم — نیازی به کلید ترجمه‌ی جدید نیست.
  const tHeader = await getTranslations('Header');
  const siteUrl = getSiteUrl();

  const currentCategory = sp.category ? decodeURIComponent(sp.category).trim() : 'all';
  const currentSearch = sp.q || '';
  // 🆕 مرتب‌سازی «پیشنهادی» (featured) پیش‌فرض جدیده. «جدیدترین‌ها» (newest)
  // حذف نشده، فقط دیگه پیش‌فرض نیست و کاربر باید صریحاً از دراپ‌داون انتخابش کنه.
  const currentSort: 'featured' | 'newest' | 'price-asc' | 'price-desc' =
    sp.sort === 'newest' || sp.sort === 'price-asc' || sp.sort === 'price-desc' ? sp.sort : 'featured';
  const currentPage = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  // ۱. دسته‌بندی‌ها (روی سرور، از Data Cache — حداکثر ۶۰ ثانیه کهنه)
  const categories = await getCachedCategories();

  const activeCategoryInfo =
    currentCategory !== 'all' ? categories.find((c) => c.slug === currentCategory) || null : null;

  // ۲. محصولات (روی سرور، با همون فیلترهایی که قبلاً کلاینت‌ساید انجام می‌شد)
  //
  // 🆕 رفع باگ «یک‌نواختی صفحه‌ی همه‌ی محصولات»: وقتی مرتب‌سازی روی حالت
  // پیش‌فرض «پیشنهادی» (featured) باشه، به‌جای جدول products مستقیم، از یک
  // View به اسم products_diversified می‌خونیم که دقیقاً همون ستون‌های جدول
  // اصلی رو داره به‌علاوه‌ی یک ستون محاسبه‌شده‌ی category_rank (یعنی «این
  // محصول، چندمین محصولِ تازه‌ی همین دسته‌بندیه؟» — جدیدترینِ هر دسته رتبه‌ی
  // ۱، دومین‌جدیدترین رتبه‌ی ۲ و...). با مرتب‌سازی روی (category_rank,
  // created_at) به‌جای created_at خام، محصولاتِ همه‌ی دسته‌بندی‌ها به‌طور
  // طبیعی با هم قاطی می‌شن (اول جدیدترینِ هر دسته، بعد دومین‌جدیدترینِ هر
  // دسته، و...) — منظم و قابل‌پیش‌بینی، نه تصادفی محض. اگه دسته‌بندی خاصی هم
  // فیلتر شده باشه، این View خودبه‌خود دقیقاً معادل «جدیدترین اول» می‌شه،
  // چون فقط یک دسته باقی می‌مونه و category_rank با ترتیب زمانی یکی می‌شه.
  // ساخت این View فقط با یک اسکریپت SQL توی Supabase انجام می‌شه (یک‌بار)،
  // جدول اصلی products اصلاً دست‌نخورده می‌مونه.
  const sourceTable = currentSort === 'featured' ? 'products_diversified' : 'products';
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let products: Product[] = [];
  let totalCount = 0;

  try {
    const { data, count } = await getCachedProducts(
      sourceTable,
      currentSearch,
      isEn,
      currentCategory,
      currentSort,
      from,
      to
    );

    products = (data || []).map((p: any) => ({
      ...p,
      weight: p.weight || 0,
      pricing_type: p.pricing_type || 'fixed',
    }));
    totalCount = count || 0;
  } catch (err) {
    console.error('Error fetching products (server):', err);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ۳. تیتر و زیرتیتر صفحه — اگر دسته‌بندی خاصی فعاله، H1 هم واقعاً همون دسته رو نشون بده
  // (به جای همیشه یک تیتر عمومی) تا محتوای صفحه با تگ title/description هم‌راستا باشه.
  const pageTitle = activeCategoryInfo
    ? (isEn ? (activeCategoryInfo.name_en || activeCategoryInfo.name) : activeCategoryInfo.name)
    : t('title');
  const pageSubtitle = activeCategoryInfo
    ? (
        (isEn ? activeCategoryInfo.seo_desc_en : activeCategoryInfo.seo_desc) ||
        truncateAtWordBoundary(
          stripHtmlToText((isEn ? activeCategoryInfo.description_en : activeCategoryInfo.description) || ''),
          200
        ) ||
        t('subtitle')
      )
    : t('subtitle');

  // ۴. Structured Data — ItemList/CollectionPage برای گوگل و بات‌های هوش مصنوعی
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    url: `${siteUrl}/${locale}/products${currentCategory !== 'all' ? `?category=${currentCategory}` : ''}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalCount,
      itemListElement: products.map((p, idx) => ({
        '@type': 'ListItem',
        position: from + idx + 1,
        url: `${siteUrl}/${locale}/products/${p.slug}`,
        name: isEn ? p.title_en || p.title : p.title,
      })),
    },
  };

  // ۵. Structured Data — BreadcrumbList (TASK-07، ROADMAP.md)
  // مسیر خانه › محصولات، و اگر دسته‌بندی خاصی فعال باشه، یک پله‌ی سوم هم
  // برای همون دسته‌بندی اضافه می‌شه.
  const breadcrumbItems: Array<{ '@type': string; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: tHeader('home'), item: `${siteUrl}/${locale}` },
    { '@type': 'ListItem', position: 2, name: tHeader('products'), item: `${siteUrl}/${locale}/products` },
  ];

  if (activeCategoryInfo) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: pageTitle,
      item: `${siteUrl}/${locale}/products?category=${encodeURIComponent(currentCategory)}`,
    });
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-[family-name:var(--font-vazir)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-white border-b border-gray-200 pt-12 pb-10 mb-2 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60 pointer-events-none"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">{pageTitle}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* ProductsClientView از useSearchParams استفاده می‌کنه؛ طبق قوانین Next.js
          هر کامپوننتی که از این هوک استفاده می‌کنه باید داخل Suspense باشه. چون
          داده‌ها همین بالا روی سرور آماده شدن، این Suspense عملاً هیچ‌وقت fallback
          رو نشون نمی‌ده — فقط برای رعایت قانون Next.js لازمه. */}
      <Suspense fallback={null}>
        <ProductsClientView
          initialProducts={products}
          categories={categories}
          currentCategory={currentCategory}
          currentSearch={currentSearch}
          currentSort={currentSort}
          currentPage={currentPage}
          totalCount={totalCount}
          totalPages={totalPages}
          activeCategoryInfo={activeCategoryInfo}
        />
      </Suspense>

      {/* بخش محتوای متنی سئو: بنر تصویری با Overlay + متن غنی + سوالات متداول.
          دقیقاً زیر کانتینر محصولات و کاملاً جدا از Hero و گرید محصولات بالا.
          با LazySection رندر می‌شه (همون الگویی که برای FAQ و HomeSEOContent
          در صفحه اصلی استفاده شده) تا هزینه‌ی رندرش تا قبل از دیده شدن به
          تعویق بیفته، بدون اینکه از HTML اولیه‌ی صفحه حذف بشه.

          🔧 رفع باگ «تکرار محتوای سئو در همه‌ی دسته‌بندی‌ها»: این کامپوننت کلاً
          استاتیکه (تیتر/پاراگراف‌ها/سوالات متداول از فایل ترجمه می‌آد، نه از
          دیتابیس دسته‌بندی) پس اگه زیر هر دسته‌بندی هم نشون داده بشه، متن‌ش
          حرف‌به‌حرف با صفحه‌ی «همه‌ی محصولات» و با بقیه‌ی دسته‌بندی‌ها یکیه —
          دقیقاً همون Duplicate Content ای که گوگل رو گیج می‌کنه. برای همین از
          این به بعد این بلوک فقط وقتی نشون داده می‌شه که کاربر توی حالت «همه‌ی
          محصولات» باشه (currentCategory === 'all'). توی صفحه‌ی هر دسته‌بندی،
          H1 + توضیح + عنوان/توضیح متا (که همین الان هم درست و مخصوص همون
          دسته‌بندی از دیتابیس خونده می‌شن) به‌تنهایی محتوای منحصربه‌فرد اون
          صفحه رو تشکیل می‌دن. */}
      {currentCategory === 'all' && (
        <LazySection minHeight={1100}>
          <ProductsSEOContent />
        </LazySection>
      )}
    </div>
  );
}