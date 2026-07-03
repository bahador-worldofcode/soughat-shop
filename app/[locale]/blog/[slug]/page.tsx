import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, ArrowRight, ArrowLeft, User, Tag, Folder } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// --- تنظیمات کش ---
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const isEn = locale === 'en';
  
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!post) return { title: 'Post Not Found' };

  // انتخاب هوشمند متا تگ‌ها
  const pageTitle = isEn 
    ? (post.seo_title_en || post.title_en || post.title) 
    : (post.seo_title || post.title);

  const pageDesc = isEn
    ? (post.seo_desc_en || post.summary_en || post.content_en?.substring(0, 160))
    : (post.seo_desc || post.summary || post.content.substring(0, 160));

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      type: 'article',
      images: post.image ? [{ url: post.image }] : [],
      // ✅ اصلاح مهم: حذف IR و US برای تارگت جهانی
      locale: isEn ? 'en' : 'fa',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: post.image ? [post.image] : [],
    },
    // ✅ اصلاح مهم: اضافه کردن Hreflang برای سئوی بین‌المللی
    alternates: {
      canonical: `${siteUrl}/${locale}/blog/${decodedSlug}`,
      languages: {
        'fa': `${siteUrl}/fa/blog/${decodedSlug}`,
        'en': `${siteUrl}/en/blog/${decodedSlug}`,
      },
    },
  };
}

// --- موتور پردازش متن ---
const parseInlineStyles = (text: string) => {
  if (!text) return null;
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

    // H4 (####)
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
      <p key={index} className="mb-2 leading-7 text-justify text-gray-700">
        {parseInlineStyles(line)}
      </p>
    );
  });
};

export default async function BlogPost({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const isEn = locale === 'en';
  const t = await getTranslations('Blog');

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!post) {
    notFound();
  }

  // --- انتخاب محتوای مناسب بر اساس زبان ---
  const displayTitle = isEn ? (post.title_en || post.title) : post.title;
  const displayContent = isEn ? (post.content_en || post.content) : post.content;
  
  const displayCategory = isEn ? (post.category_en || post.category) : post.category;
  const displayTags = isEn ? (post.tags_en || post.tags) : post.tags;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: displayTitle,
    image: post.image ? [post.image] : [],
    datePublished: post.created_at,
    author: {
      '@type': 'Organization',
      name: 'Soughat Shop Team'
    },
    articleBody: displayContent,
    // ✅ اصلاح مهم: زبان عمومی
    inLanguage: isEn ? 'en' : 'fa'
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
            alt={displayTitle} 
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
             <span className="text-6xl font-black text-white">BLOG</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
            {displayCategory && (
                <span className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
                     <Folder className="h-3 w-3" /> {displayCategory}
                </span>
            )}
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg max-w-4xl" dir={isEn ? 'ltr' : 'rtl'}>
                {displayTitle}
            </h1>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="container mx-auto px-4 relative z-10 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12 max-w-4xl mx-auto border border-gray-100">
          
          <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm font-medium mb-10 pb-6 border-b border-gray-100" dir={isEn ? 'ltr' : 'rtl'}>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              {new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'fa-IR', { dateStyle: 'long' })}
            </span>
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              {t('author')}
            </span>
          </div>
          
          <article className="max-w-none" dir={isEn ? 'ltr' : 'rtl'}>
             {renderContent(displayContent)}
          </article>

          {displayTags && displayTags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-sm">
                   <Tag className="h-4 w-4" /> {t('tags')}
                </div>
                <div className="flex flex-wrap gap-2">
                    {displayTags.map((tag: string, idx: number) => (
                        <Link key={idx} href={`/blog`} className="bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors text-gray-600 px-3 py-1.5 rounded-lg text-xs">
                            #{tag}
                        </Link>
                    ))}
                </div>
            </div>
          )}

          <div className="mt-10" dir={isEn ? 'ltr' : 'rtl'}>
             <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-bold transition-colors group">
                 {isEn ? (
                    <>
                       <ArrowRight className="mr-2 h-4 w-4 rotate-180 group-hover:mr-3 transition-all" /> {t('back_to_blog')}
                    </>
                 ) : (
                    <>
                       <ArrowRight className="ml-2 h-4 w-4 group-hover:mr-1 transition-all" /> {t('back_to_blog')}
                    </>
                 )}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}