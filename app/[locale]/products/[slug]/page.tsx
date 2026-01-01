import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductClientView from '@/components/ProductClientView';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation'; // لینک هوشمند
import { getTranslations } from 'next-intl/server';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const isEn = locale === 'en';
  
  // دریافت همه فیلدها برای انتخاب زبان مناسب
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!product) return { title: 'Not Found' };

  // انتخاب زبان برای سئو
  const pageTitle = isEn 
    ? (product.seo_title_en || product.title_en || product.title)
    : (product.seo_title || product.title);
    
  const pageDesc = isEn 
    ? (product.seo_desc_en || product.description_en?.substring(0, 160)) 
    : (product.seo_desc || product.description?.substring(0, 160));

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `${siteUrl}/${locale}/products/${decodedSlug}`,
      images: [{ url: product.image, width: 800, height: 800, alt: pageTitle }],
      type: 'website',
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      siteName: 'Soughat Shop',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [product.image],
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/products/${decodedSlug}`,
      languages: {
        'fa-IR': `${siteUrl}/fa/products/${decodedSlug}`,
        'en-US': `${siteUrl}/en/products/${decodedSlug}`,
      },
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const isEn = locale === 'en';
  const t = await getTranslations('Product'); // دریافت ترجمه‌ها برای دکمه بازگشت

  // 1. دریافت خود محصول (همه فیلدها)
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!product) {
    notFound();
  }

  // 2. دریافت نام دسته‌بندی
  const { data: categoryData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', product.category)
    .single();

  // 3. دریافت محصولات مرتبط
  const { data: relatedRaw } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(4);

  // --- آماده‌سازی داده‌ها بر اساس زبان ---

  // محصول اصلی
  const localizedProduct = {
    ...product,
    title: isEn ? (product.title_en || product.title) : product.title,
    description: isEn ? (product.description_en || product.description) : product.description,
    features: isEn ? (product.features_en || product.features) : product.features,
  };

  // نام دسته
  const categoryName = isEn 
    ? (categoryData?.name_en || categoryData?.name || product.category)
    : (categoryData?.name || product.category);

  // محصولات مرتبط
  const relatedProducts = relatedRaw?.map(p => ({
    id: p.id,
    title: isEn ? (p.title_en || p.title) : p.title,
    price: p.price,
    image: p.image,
    slug: p.slug
  })) || [];

  // جیسون اسکیما (برای گوگل)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: localizedProduct.title,
    image: product.image,
    description: localizedProduct.description?.substring(0, 160),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price,
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop'}/${locale}/products/${product.slug}`,
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
                <ArrowRight className={`h-4 w-4 ${isEn ? 'rotate-180 mr-1' : 'ml-1'}`} />
                {t('back_to_list')}
            </Link>
        </div>

        {/* محتوای اصلی */}
        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl shadow-gray-200/50 mb-16">
            <ProductClientView 
                product={localizedProduct} 
                categoryName={categoryName} 
                categorySlug={product.category}
                categoryIcon={categoryData?.icon_url}
                relatedProducts={relatedProducts}
            />
        </div>
      </div>
    </div>
  );
}