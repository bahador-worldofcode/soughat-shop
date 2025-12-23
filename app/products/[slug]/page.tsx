import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductClientView from '@/components/ProductClientView';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const { data: product } = await supabase
    .from('products')
    .select('seo_title, seo_desc, title, description, image, price')
    .eq('slug', decodedSlug)
    .single();

  if (!product) return { title: 'محصول یافت نشد' };

  const pageTitle = product.seo_title || `${product.title} | ارسال هدیه به ایران`;
  const pageDesc = product.seo_desc || product.description?.substring(0, 160);
  // اصلاح آدرس سایت برای متاتگ‌ها
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `${siteUrl}/products/${decodedSlug}`,
      images: [{ url: product.image, width: 800, height: 800, alt: product.title }],
      type: 'website',
      locale: 'fa_IR',
      siteName: 'Soughat Shop',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [product.image],
    },
    alternates: {
      canonical: `${siteUrl}/products/${decodedSlug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // 1. دریافت خود محصول
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!product) {
    notFound();
  }

  // 2. دریافت نام فارسی دسته‌بندی
  const { data: categoryData } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('slug', product.category)
    .single();

  // 3. دریافت محصولات مرتبط (هم‌دسته، به جز خودش) - حداکثر 4 تا
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('id, title, price, image, slug')
    .eq('category', product.category)
    .neq('id', product.id) // خودش رو نیاره
    .limit(4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image,
    description: product.seo_desc || product.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price,
      availability: 'https://schema.org/InStock',
      // اصلاح آدرس در اسکیما مارک‌آپ (برای گوگل)
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop'}/products/${product.slug}`,
      seller: { '@type': 'Organization', name: 'Soughat Shop' }
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-[family-name:var(--font-vazir)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* نوار بازگشت */}
        <div className="mb-6 flex items-center justify-between">
            <Link href="/products" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowRight className="ml-1 h-4 w-4" />
                بازگشت به لیست
            </Link>
        </div>

        {/* محتوای اصلی */}
        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl shadow-gray-200/50 mb-16">
            <ProductClientView 
                product={product} 
                categoryName={categoryData?.name || product.category} 
                categorySlug={product.category}
                relatedProducts={relatedProducts || []}
            />
        </div>
      </div>
    </div>
  );
}