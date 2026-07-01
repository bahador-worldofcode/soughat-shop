import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { postToMarkdown } from '@/lib/markdown';

export const revalidate = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!post) {
    return new NextResponse('# Not Found\n\nThis article does not exist.', {
      status: 404,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  const markdown = postToMarkdown(post, locale);

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}