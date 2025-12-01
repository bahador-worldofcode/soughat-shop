import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; 
// آپدیت ساعتی (کش تا یک ساعت می‌مونه)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 1. دریافت لیست مقالات وبلاگ
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at');

  // 2. دریافت لیست محصولات (بخش جدید)
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
    '/how-it-works', // اضافه شد
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

  // 5. مپ کردن محصولات (بخش جدید)
  const productRoutes = products?.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.created_at || new Date().toISOString(),
    changeFrequency: 'daily' as const, // محصولات چون قیمت و موجودی دارن روزانه چک بشن بهتره
    priority: 0.9, // اولویت بالا برای محصولات (چون پولساز هستن)
  })) || [];

  // ترکیب همه مسیرها
  return [...routes, ...blogRoutes, ...productRoutes];
}