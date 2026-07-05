import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';
  const locales = ['fa', 'en'];

  // 1. دریافت داده‌ها
  const { data: posts } = await supabase.from('posts').select('slug, created_at');
  const { data: products } = await supabase.from('products').select('slug, created_at');

  const routes = [
    '',
    '/about',
    '/contact',
    '/terms',
    '/trust',
    '/crypto-guide',
    '/products',
    '/blog',
    '/track',
    '/how-it-works',
    '/send-money-to-iran',
  ];

  let sitemapEntries: MetadataRoute.Sitemap = [];

  // 2. تولید لینک برای هر زبان
  for (const locale of locales) {
    // صفحات ثابت
    const staticEntries = routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }));

    // بلاگ
    const blogEntries = posts?.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: post.created_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || [];

    // محصولات
    const productEntries = products?.map((product) => ({
      url: `${baseUrl}/${locale}/products/${product.slug}`,
      lastModified: product.created_at,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })) || [];

    sitemapEntries = [...sitemapEntries, ...staticEntries, ...blogEntries, ...productEntries];
  }

  return sitemapEntries;
}