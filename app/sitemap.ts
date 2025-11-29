import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // آپدیت ساعتی

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // این خط به صورت خودکار آدرس سایت را پیدا می‌کند (چه لوکال باشد چه آدرس رایگان Vercel)
  // اگر روی سرور باشیم آدرس واقعی را می‌گیرد، اگر نه لوکال‌هاست
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 1. دریافت لیست مقالات وبلاگ
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at');

  // 2. تعریف صفحات ثابت
  const routes = [
    '',
    '/about',
    '/contact',
    '/terms',
    '/crypto-guide',
    '/products',
    '/blog',
    '/track',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 3. تعریف صفحات وبلاگ
  const blogRoutes = posts?.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || [];

  return [...routes, ...blogRoutes];
}