import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, ArrowRight, User, Tag, Folder } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

// --- تنظیمات کش ---
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const { data: post } = await supabase
    .from('posts')
    .select('title, content, seo_title, seo_desc, summary, image')
    .eq('slug', decodedSlug)
    .single();

  if (!post) return { title: 'مقاله یافت نشد' };

  const pageTitle = post.seo_title || `${post.title} | وبلاگ سوغات شاپ`;
  const pageDesc = post.seo_desc || post.summary || post.content.substring(0, 160);

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      type: 'article',
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: post.image ? [post.image] : [],
    }
  };
}

// --- موتور پردازش متن (نسخه ۳: اضافه شدن H4) ---
const parseInlineStyles = (text: string) => {
  const parts = text.split(/(\[.*?\]\(.*?\)|https?:\/\/[^\s]+|\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    // 1. بولد
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    // 2. لینک مارک‌داون
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a 
          key={index} 
          href={linkMatch[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 font-bold hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
    }
    // 3. لینک ساده
    if (part.match(/^https?:\/\//)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 break-all hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const renderContent = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return <br key={index} />;

    // H4 (####) -> اضافه شده برای رفع مشکل شما
    if (line.startsWith('#### ')) {
        return (
          <h4 key={index} className="text-base md:text-lg font-extrabold text-gray-800 mt-6 mb-2">
            {parseInlineStyles(line.replace('#### ', ''))}
          </h4>
        );
    }

    // H3 (###)
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-lg md:text-xl font-bold text-gray-800 mt-8 mb-3 pr-2 border-r-2 border-blue-200">
          {parseInlineStyles(line.replace('### ', ''))}
        </h3>
      );
    }

    // H2 (##)
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4 border-r-4 border-blue-600 pr-4 leading-tight">
          {parseInlineStyles(line.replace('## ', ''))}
        </h2>
      );
    }

    // Lists
    const isList = line.match(/^(\d+\.|-)\s/);
    if (isList) {
        return (
            <div key={index} className="flex gap-2 mb-2 pr-4 md:pr-8 items-start">
                 <span className="text-blue-500 font-bold mt-1.5 text-xs">●</span>
                 <p className="text-gray-700 leading-8 text-justify">
                    {parseInlineStyles(line.replace(/^(\d+\.|-)\s/, ''))}
                 </p>
            </div>
        )
    }

    // Paragraph
    return (
      <p key={index} className="mb-4 leading-8 text-justify text-gray-700">
        {parseInlineStyles(line)}
      </p>
    );
  });
};

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
    image: post.image ? [post.image] : [],
    datePublished: post.created_at,
    author: {
      '@type': 'Organization',
      name: 'Soughat Shop Team'
    },
    description: post.seo_desc || post.summary,
    articleBody: post.content
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-[family-name:var(--font-vazir)]">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Header Image */}
      <div className="relative h-[300px] md:h-[450px] w-full bg-gray-900">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
             <span className="text-6xl font-black text-white">BLOG</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
            {post.category && (
                <span className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
                     <Folder className="h-3 w-3" /> {post.category}
                </span>
            )}
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg max-w-4xl">
                {post.title}
            </h1>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="container mx-auto px-4 relative z-10 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12 max-w-4xl mx-auto border border-gray-100">
          
          <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm font-medium mb-10 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              {new Date(post.created_at).toLocaleDateString('fa-IR', { dateStyle: 'long' })}
            </span>
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              نویسنده: تیم محتوای سوغات شاپ
            </span>
          </div>
          
          <article className="max-w-none">
             {renderContent(post.content)}
          </article>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-sm">
                   <Tag className="h-4 w-4" /> برچسب‌ها:
                </div>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string, idx: number) => (
                        <Link key={idx} href={`/products?q=${tag}`} className="bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors text-gray-600 px-3 py-1.5 rounded-lg text-xs">
                            #{tag}
                        </Link>
                    ))}
                </div>
            </div>
          )}

          <div className="mt-10">
             <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-bold transition-colors group">
                 <ArrowRight className="ml-2 h-4 w-4 group-hover:mr-1 transition-all" /> بازگشت به لیست مقالات
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}