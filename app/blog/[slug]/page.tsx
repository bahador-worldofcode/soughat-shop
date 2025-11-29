import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { data: post } = await supabase.from('posts').select('title, content').eq('slug', decodedSlug).single();

  if (!post) return { title: 'مقاله یافت نشد' };

  return {
    title: `${post.title} | وبلاگ سوغات شاپ`,
    description: post.content ? post.content.substring(0, 160) : '',
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-[family-name:var(--font-vazir)]">
      
      {/* 1. عکس مقاله (به عنوان هدر) */}
      <div className="relative h-[250px] md:h-[400px] w-full bg-gray-200">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
             <span className="text-4xl font-bold opacity-20">Soughat Blog</span>
          </div>
        )}
        {/* سایه پایین عکس */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
      </div>

      {/* 2. بدنه اصلی (باکس سفید) */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12 max-w-4xl mx-auto border border-gray-100">
          
          {/* دکمه بازگشت */}
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 text-sm font-bold transition-colors">
            <ArrowRight className="ml-2 h-4 w-4" /> بازگشت به لیست مقالات
          </Link>

          {/* عنوان اصلی: رنگ تیره (مشکی) */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          {/* اطلاعات نویسنده و تاریخ */}
          <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm font-medium mb-8 pb-8 border-b border-gray-100">
            <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
              <Calendar className="h-4 w-4 text-blue-500" />
              {new Date(post.created_at).toLocaleDateString('fa-IR', { dateStyle: 'long' })}
            </span>
            <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
              <User className="h-4 w-4 text-blue-500" />
              نویسنده: ادمین سوغات شاپ
            </span>
          </div>
          
          {/* متن مقاله: رنگ تیره */}
          <div className="text-gray-800 leading-9 text-lg text-justify whitespace-pre-wrap">
            {post.content}
          </div>

        </div>
      </div>
      
    </div>
  );
}