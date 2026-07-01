import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { productToMarkdown } from '@/lib/markdown';

export const revalidate = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!product) {
    return new NextResponse('# Not Found\n\nThis product does not exist.', {
      status: 404,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  const { data: categoryData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', product.category)
    .single();

  const isEn = locale === 'en';
  const categoryName = isEn
    ? (categoryData?.name_en || categoryData?.name || product.category)
    : (categoryData?.name || product.category);

  const markdown = productToMarkdown(product, locale, categoryName);

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}