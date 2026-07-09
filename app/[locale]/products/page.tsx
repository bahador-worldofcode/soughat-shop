import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import ProductsClientView from '@/components/ProductsClientView';
import ProductsSEOContent from '@/components/ProductsSEOContent';
import LazySection from '@/components/LazySection';
import { stripHtmlToText } from '@/lib/sanitizeHtml';

// این صفحه چون بر اساس searchParams (دسته‌بندی/جستجو/مرتب‌سازی/صفحه) فیلتر می‌شه،
// همیشه به‌صورت داینامیک روی سرور رندر می‌شه (نه استاتیک) — دقیقاً چیزی که برای
// دیده‌شدن توسط گوگل و بات‌های هوش مصنوعی لازم داریم: HTML اولیه‌ی هر درخواست
// همیشه شامل محصولات واقعیه، نه یک صفحه‌ی خالی که بعداً با JS پر بشه.

export const revalidate = 0;

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
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single();
  return (data as Category) || null;
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
        ? (activeCategory.seo_desc || stripHtmlToText(activeCategory.description_en || activeCategory.description || '').substring(0, 160))
        : (activeCategory.seo_desc || stripHtmlToText(activeCategory.description || '').substring(0, 160)))
    : (isEn
        ? 'Browse every Soughat Shop product: Iranian sweets, handicrafts, gold, jewelry and gift cards. Pay with USDT, Bitcoin or Solana — delivered anywhere in Iran.'
        : 'همه‌ی محصولات سوغات شاپ را ببینید: شیرینی، صنایع‌دستی، طلا، جواهر و کارت هدیه ایرانی. پرداخت با تتر، بیت‌کوین یا سولانا و تحویل در سراسر ایران.');

  const canonicalPath = currentCategory !== 'all' ? `/products?category=${encodeURIComponent(currentCategory)}` : '/products';

  return {
    title,
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
  const t = await getTranslations('ProductsPage');
  // TASK-07: برای متن «خانه» و «محصولات» در BreadcrumbList از همون کلیدهای
  // موجود namespace هدر استفاده می‌کنیم — نیازی به کلید ترجمه‌ی جدید نیست.
  const tHeader = await getTranslations('Header');
  const siteUrl = getSiteUrl();

  const currentCategory = sp.category ? decodeURIComponent(sp.category).trim() : 'all';
  const currentSearch = sp.q || '';
  const currentSort: 'newest' | 'price-asc' | 'price-desc' =
    sp.sort === 'price-asc' || sp.sort === 'price-desc' ? sp.sort : 'newest';
  const currentPage = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  // ۱. دسته‌بندی‌ها (روی سرور، یک‌بار در همین رندر)
  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  const categories = (catData || []) as Category[];

  const activeCategoryInfo =
    currentCategory !== 'all' ? categories.find((c) => c.slug === currentCategory) || null : null;

  // ۲. محصولات (روی سرور، با همون فیلترهایی که قبلاً کلاینت‌ساید انجام می‌شد)
  let query = supabase.from('products').select('*', { count: 'exact' });

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

  if (currentSort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (currentSort === 'price-asc') {
    query = query.order('price', { ascending: true });
  } else if (currentSort === 'price-desc') {
    query = query.order('price', { ascending: false });
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching products (server):', error);
  }

  const products: Product[] = (data || []).map((p: any) => ({
    ...p,
    weight: p.weight || 0,
    pricing_type: p.pricing_type || 'fixed',
  }));

  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ۳. تیتر و زیرتیتر صفحه — اگر دسته‌بندی خاصی فعاله، H1 هم واقعاً همون دسته رو نشون بده
  // (به جای همیشه یک تیتر عمومی) تا محتوای صفحه با تگ title/description هم‌راستا باشه.
  const pageTitle = activeCategoryInfo
    ? (isEn ? (activeCategoryInfo.name_en || activeCategoryInfo.name) : activeCategoryInfo.name)
    : t('title');
  const pageSubtitle = activeCategoryInfo
    ? stripHtmlToText((isEn ? activeCategoryInfo.description_en : activeCategoryInfo.description) || '').substring(0, 200) || t('subtitle')
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
          تعویق بیفته، بدون اینکه از HTML اولیه‌ی صفحه حذف بشه. */}
      <LazySection minHeight={1100}>
        <ProductsSEOContent />
      </LazySection>
    </div>
  );
}