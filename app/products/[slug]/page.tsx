import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductClientView from '@/components/ProductClientView';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// آپدیت قیمت و موجودی هر ۶۰ ثانیه یکبار
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

// 1. تولید متاتگ‌های سئو به صورت داینامیک
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const { data: product } = await supabase
    .from('products')
    .select('seo_title, seo_desc, title, description, image')
    .eq('slug', decodedSlug)
    .single();

  if (!product) return { title: 'محصول یافت نشد' };

  return {
    title: product.seo_title || `${product.title} | خرید و ارسال به ایران`,
    description: product.seo_desc || product.description?.substring(0, 160),
    openGraph: {
      images: [product.image],
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="mb-8">
            <Link href="/products" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowRight className="ml-1 h-4 w-4" />
                بازگشت به لیست محصولات
            </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl shadow-gray-200/50">
            <ProductClientView product={product} />
        </div>

      </div>
    </div>
  );
}