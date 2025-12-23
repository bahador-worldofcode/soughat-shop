import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; 
// آپدیت ساعتی (کش تا یک ساعت می‌مونه)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // تغییر فال‌بک به دامنه جدید برای اطمینان از ساخت لینک‌های صحیح
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  // 1. دریافت لیست مقالات وبلاگ
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at');

  // 2. دریافت لیست محصولات
  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at');

  // 3. تعریف صفحات ثابت (استاتیک)
  const routes = [
    '',
    '/about',
    '/contact',
    '/terms',
    '/crypto-guide',
    '/products',
    '/blog',
    '/track',
    '/how-it-works',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 4. مپ کردن مقالات وبلاگ
  const blogRoutes = posts?.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || [];

  // 5. مپ کردن محصولات
  const productRoutes = products?.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.created_at || new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  })) || [];

  // ترکیب همه مسیرها
  return [...routes, ...blogRoutes, ...productRoutes];
}