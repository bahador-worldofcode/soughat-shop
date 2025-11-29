import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductClientView from '@/components/ProductClientView';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// آپدیت قیمت و موجودی هر ۶۰ ثانیه یکبار (ISR)
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

// 1. تولید متاتگ‌های سئو و OpenGraph (کارت ویزیت لینک‌ها)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  // دریافت اطلاعات سئو از دیتابیس
  const { data: product } = await supabase
    .from('products')
    .select('seo_title, seo_desc, title, description, image, price')
    .eq('slug', decodedSlug)
    .single();

  if (!product) return { title: 'محصول یافت نشد' };

  // تنظیم عنوان و توضیحات (اگر فیلد سئو خالی بود، از تایتل معمولی استفاده کن)
  const pageTitle = product.seo_title || `${product.title} | ارسال هدیه به ایران`;
  const pageDesc = product.seo_desc || product.description?.substring(0, 160);
  
  // آدرس سایت (اگر متغیر محیطی نبود، آدرس ورسل رو بذار)
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat-shop.vercel.app';

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `${siteUrl}/products/${decodedSlug}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'website',
      locale: 'fa_IR', // زبان محتوای سایت فارسی است
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

// 2. کامپوننت اصلی صفحه
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!product) {
    notFound();
  }

  // --- بخش جدید: ساختار داده استاندارد گوگل (Schema Markup) ---
  // این بخش به صورت اتوماتیک اطلاعات محصول را به زبان گوگل ترجمه می‌کند
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image,
    description: product.seo_desc || product.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD', // قیمت پایه همیشه دلار است
      price: product.price,
      availability: 'https://schema.org/InStock', // محصول موجود است
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat-shop.vercel.app'}/products/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Soughat Shop'
      }
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-[family-name:var(--font-vazir)]">
      
      {/* تزریق کد مخفی اسکیما برای گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* نوار بازگشت (Breadcrumb) - دست نخورده باقی ماند */}
        <div className="mb-8">
            <Link href="/products" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowRight className="ml-1 h-4 w-4" />
                بازگشت به لیست محصولات
            </Link>
        </div>

        {/* محتوای اصلی محصول (کامپوننت کلاینت) - دست نخورده باقی ماند */}
        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl shadow-gray-200/50">
            <ProductClientView product={product} />
        </div>

      </div>
    </div>
  );
}