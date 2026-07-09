import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// سایت‌مپ حداکثر هر ساعت یک‌بار دوباره ساخته می‌شه (نه در لحظه‌ی build و نه در هر
// درخواست) — همین باعث می‌شه محصولات/پست‌های جدید خیلی زود توی سایت‌مپ ظاهر بشن
// بدون این‌که هر بار به دیتابیس فشار بیاریم.
export const revalidate = 3600;

const LOCALES = ['fa', 'en'] as const;
type Locale = (typeof LOCALES)[number];

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';
}

// شکلِ ردیف‌هایی که از Supabase برای ساخت سایت‌مپ لازم داریم (فقط همون
// ستون‌هایی که توی .select() پایین درخواست می‌کنیم).
interface PostRow {
  slug: string;
  created_at: string;
  image: string | null;
  image_en: string | null;
}

interface ProductRow {
  slug: string;
  created_at: string;
  image: string | null;
}

interface CategoryRow {
  slug: string;
  created_at: string;
}

// -----------------------------------------------------------------------
// صفحات ثابت (استاتیک)
// -----------------------------------------------------------------------
// نکته‌ی مهم درباره‌ی lastModified اینجا:
// این صفحات هیچ فیلد "آخرین ویرایش" توی دیتابیس ندارن (چون محتواشون مستقیم
// توی کد نوشته شده، نه توی Supabase)، پس گذاشتن new Date() در لحظه‌ی build
// همیشه "همین الان" رو نشون می‌داد که برای گوگل بی‌معنی و غیرقابل‌اعتماده.
// به‌جاش تاریخِ واقعیِ آخرین تغییر فایل صفحه رو دستی ثبت کردیم. هر بار که
// محتوای یکی از این صفحات رو عوض کردی، همین یک تاریخ رو (پایین) آپدیت کن.
interface StaticRoute {
  path: string; // بدون locale، مثلاً '' یا '/about'
  lastMod: string; // 'YYYY-MM-DD'
  changeFreq: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}

const STATIC_ROUTES: StaticRoute[] = [
  { path: '', lastMod: '2026-07-06', changeFreq: 'daily', priority: 1 },
  { path: '/products', lastMod: '2026-07-07', changeFreq: 'daily', priority: 0.9 },
  { path: '/send-money-to-iran', lastMod: '2026-07-07', changeFreq: 'weekly', priority: 0.9 },
  { path: '/blog', lastMod: '2026-07-05', changeFreq: 'daily', priority: 0.7 },
  { path: '/crypto-guide', lastMod: '2026-07-04', changeFreq: 'monthly', priority: 0.7 },
  { path: '/how-it-works', lastMod: '2026-07-04', changeFreq: 'monthly', priority: 0.7 },
  { path: '/trust', lastMod: '2026-07-04', changeFreq: 'yearly', priority: 0.6 },
  { path: '/about', lastMod: '2026-07-04', changeFreq: 'yearly', priority: 0.6 },
  { path: '/contact', lastMod: '2026-07-07', changeFreq: 'yearly', priority: 0.6 },
  { path: '/track', lastMod: '2026-07-08', changeFreq: 'monthly', priority: 0.5 },
  { path: '/terms', lastMod: '2026-07-04', changeFreq: 'yearly', priority: 0.4 },
];

// -----------------------------------------------------------------------
// کمکی: ساخت بلاک hreflang برای یک مسیرِ بدون-زبان (مثل '/about' یا
// '/products/slug-x'). خروجی دقیقاً چیزیه که Next.js از روش تبدیل به
// <xhtml:link rel="alternate" hreflang="..."> توی خودِ sitemap.xml می‌کنه.
// x-default رو هم به en (طبق تصمیم جدید تیم برای مخاطبان بین‌المللی) اشاره می‌دیم.
// -----------------------------------------------------------------------
function buildAlternates(path: string) {
  const siteUrl = getSiteUrl();
  return {
    languages: {
      fa: `${siteUrl}/fa${path}`,
      en: `${siteUrl}/en${path}`,
      'x-default': `${siteUrl}/en${path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  // 1. دریافت داده‌ها از Supabase
  // توجه: جدول‌های products و posts فیلد updated_at ندارن (فقط created_at) —
  // پس lastmod واقعی که در دسترسمونه همون تاریخ ثبت رکورده. اگه بخوای lastmod
  // واقعاً منعکس‌کننده‌ی "آخرین ویرایش" هم باشه (نه فقط تاریخ ساخت)، باید یک
  // ستون updated_at با یک تریگر خودکار به جدول‌های products/posts اضافه کنی؛
  // این یک تغییر جدا در دیتابیسه و فعلاً روی این نسخه اعمال نشده.
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at, image, image_en');

  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at, image');

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at');

  let sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES as readonly Locale[]) {
    // ۱. صفحات ثابت
    const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
      url: `${siteUrl}/${locale}${route.path}`,
      lastModified: route.lastMod,
      changeFrequency: route.changeFreq,
      priority: route.priority,
      alternates: buildAlternates(route.path),
    }));

    // ۲. پست‌های وبلاگ
    const blogEntries: MetadataRoute.Sitemap = (posts || []).map((post: PostRow) => {
      // همون منطق انتخاب تصویر که توی app/[locale]/blog/[slug]/page.tsx و
      // app/[locale]/blog/page.tsx هم استفاده می‌شه: برای نسخه‌ی انگلیسی اول
      // image_en رو نشون بده، اگه خالی بود برگرد به image اصلی.
      const displayImage = locale === 'en' ? post.image_en || post.image : post.image;

      return {
        url: `${siteUrl}/${locale}/blog/${post.slug}`,
        lastModified: post.created_at,
        changeFrequency: 'weekly',
        priority: 0.7,
        images: displayImage ? [displayImage] : undefined,
        alternates: buildAlternates(`/blog/${post.slug}`),
      };
    });

    // ۳. صفحات محصول
    const productEntries: MetadataRoute.Sitemap = (products || []).map((product: ProductRow) => ({
      url: `${siteUrl}/${locale}/products/${product.slug}`,
      lastModified: product.created_at,
      changeFrequency: 'daily',
      priority: 0.9,
      images: product.image ? [product.image] : undefined,
      alternates: buildAlternates(`/products/${product.slug}`),
    }));

    // ۴. لیست محصولات به تفکیک دسته‌بندی
    // مهم: این آدرس‌ها عمداً به‌صورت ?category=slug باقی موندن، نه یک مسیر
    // "تمیزِ" جدید مثل /products/category/slug — چون توی این پروژه صفحه‌ای
    // با اون مسیر اصلاً وجود نداره (app/[locale]/products/page.tsx فیلتر رو
    // فقط از روی searchParams می‌خونه) و canonical واقعیِ همین صفحه هم توی
    // generateMetadata همون فایل دقیقاً همین فرمت ?category= هست. اگه این رو
    // به یک مسیر ساختگی تغییر بدیم، گوگل به یک URL می‌رسه که 404 می‌ده —
    // دقیقاً برعکسِ چیزی که می‌خوایم.
    const categoryEntries: MetadataRoute.Sitemap = (categories || []).map((cat: CategoryRow) => ({
      url: `${siteUrl}/${locale}/products?category=${encodeURIComponent(cat.slug)}`,
      lastModified: cat.created_at,
      changeFrequency: 'daily',
      priority: 0.85,
      alternates: buildAlternates(`/products?category=${encodeURIComponent(cat.slug)}`),
    }));

    sitemapEntries = [
      ...sitemapEntries,
      ...staticEntries,
      ...blogEntries,
      ...productEntries,
      ...categoryEntries,
    ];
  }

  return sitemapEntries;
}
