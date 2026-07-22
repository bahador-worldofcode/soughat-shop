import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, ArrowRight, ArrowLeft, User, Tag, Folder } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PostContent from '@/components/PostContent';
import ShareButtons from '@/components/ShareButtons';

// --- تنظیمات کش ---
export const revalidate = 60;

// 🆕 رفع بحران «Exceeded free resources - Fluid Active CPU» (گام ۱):
// -----------------------------------------------------------------------
// این تابع، اسلاگِ همه‌ی پست‌های وبلاگ را در زمان Build از Supabase می‌خواند
// و به Next.js می‌گوید همین الان (نه در لحظه‌ی درخواستِ کاربر) HTML همه‌ی
// این صفحات را برای هر دو زبان بسازد. چون این صفحه زیرِ app/[locale]/layout.tsx
// قرار دارد و آن لایوت خودش generateStaticParams برای fa/en دارد، Next.js
// خودکار این اسلاگ‌ها را با هر دو زبان ترکیب می‌کند (یعنی /fa/blog/x و
// /en/blog/x هر دو ساخته می‌شوند) — نیازی نیست خودمان locale را اینجا
// دوباره برگردانیم.
//
// اگر پستِ جدیدی بعد از آخرین Build اضافه شود، در این آرایه نیست؛ نگران
// نباشید — dynamicParams پیش‌فرض Next.js روی true است، یعنی همان اولین
// بازدیدکننده‌ی آن پست جدید، صفحه را می‌سازد و از آن به بعد هم مثل بقیه
// ایستا/کش می‌ماند.
export async function generateStaticParams() {
  const { data: posts } = await supabase.from('posts').select('slug');
  return (posts || []).map((post) => ({ slug: post.slug }));
}

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

  // ✅ تصویر انگلیسی با بازگشت خودکار به تصویر اصلی در صورت خالی بودن image_en
  const displayImage = isEn ? (post.image_en || post.image) : post.image;

  // ✅ تگ‌ها هم برای متای سئو و هم برای اشتراک‌گذاری خودکار (Open Graph) لازم‌اند
  const pageTags: string[] = isEn ? (post.tags_en || post.tags || []) : (post.tags || []);

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';
  const pageUrl = `${siteUrl}/${locale}/blog/${decodedSlug}`;

  return {
    // 🔧 رفع باگ «۲ بار سوغات شاپ در تایتل»: pageTitle از دیتابیس (seo_title
    // پست وبلاگ) میاد و طبق پروتکل تولید محتوا از قبل شامل «| سوغات شاپ» هست.
    // اگه اینجا فقط یک رشته‌ی ساده بدیم، لایوت (app/[locale]/layout.tsx)
    // دوباره template «%s | Soughat Shop» رو روش اعمال می‌کنه و نتیجه دو بار
    // نام برند میشه. با title.absolute این تایتل را همون‌طور که هست، بدون
    // دست‌کاری توسط لایوت، مستقیم می‌فرستیم.
    title: { absolute: pageTitle },
    description: pageDesc,
    keywords: pageTags,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: pageUrl,
      siteName: 'Soughat Shop',
      type: 'article',
      images: displayImage ? [{ url: displayImage, width: 1200, height: 630, alt: pageTitle }] : [],
      tags: pageTags,
      // ✅ اصلاح مهم: حذف IR و US برای تارگت جهانی
      locale: isEn ? 'en' : 'fa',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: displayImage ? [displayImage] : [],
    },
    // ✅ اصلاح مهم: اضافه کردن Hreflang برای سئوی بین‌المللی
    alternates: {
      canonical: pageUrl,
      languages: {
        'fa': `${siteUrl}/fa/blog/${decodedSlug}`,
        'en': `${siteUrl}/en/blog/${decodedSlug}`,
      },
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const isEn = locale === 'en';

  // 🆕 رفع بحران CPU: باید قبل از هر getTranslations صدا زده شود تا این
  // صفحه واقعاً به‌صورت ایستا/ISR سرو شود، نه SSR کامل در هر درخواست.
  setRequestLocale(locale);

  const t = await getTranslations('Blog');
  // TASK-07: برای متن «خانه» و «وبلاگ» در BreadcrumbList از همون کلیدهای
  // موجود namespace هدر استفاده می‌کنیم — نیازی به کلید ترجمه‌ی جدید نیست.
  const tHeader = await getTranslations('Header');

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
  // ✅ تصویر انگلیسی با بازگشت خودکار به تصویر اصلی در صورت خالی بودن image_en
  const displayImage = isEn ? (post.image_en || post.image) : post.image;

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';
  const pageUrl = `${siteUrl}/${locale}/blog/${decodedSlug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: displayTitle,
    image: displayImage ? [displayImage] : [],
    datePublished: post.created_at,
    author: {
      '@type': 'Organization',
      name: 'Soughat Shop Team'
    },
    articleBody: displayContent,
    // ✅ اصلاح مهم: زبان عمومی
    inLanguage: isEn ? 'en' : 'fa'
  };

  // TASK-07 (ROADMAP.md): BreadcrumbList Schema — مسیر خانه › بلاگ › پست
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: tHeader('home'),
        item: `${siteUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tHeader('blog'),
        item: `${siteUrl}/${locale}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: displayTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-[family-name:var(--font-vazir)]">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* 1. Header Image — بدون کراپ. کل عکس (حتی کشیده/عریض) همیشه کامل دیده می‌شود،
          چون به‌جای object-cover روی یک باکس با ارتفاع ثابت، اینجا از یک لایه‌ی
          بلورشده به‌عنوان پس‌زمینه + خود عکس با object-contain استفاده شده */}
      <div className="relative w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[480px] bg-gray-900 overflow-hidden">
        {displayImage ? (
          <>
            {/* پس‌زمینه: نسخه‌ی بلورشده‌ی همون عکس، برای پر کردن فضای خالی اطراف
                بدون نوار سیاه زشت */}
            <img
              src={displayImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-75"
            />
            <div className="absolute inset-0 bg-black/10" />
            {/* لایه‌ی اصلی: کل عکس با object-contain — هیچ‌وقت از بالا/پایین یا
                چپ/راست بریده نمی‌شود، فارغ از نسبت ابعادش */}
            <div className="absolute inset-0 p-3 sm:p-6 md:p-8">
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-full object-contain rounded-xl md:rounded-2xl shadow-2xl"
              />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <span className="text-6xl font-black text-white">BLOG</span>
          </div>
        )}
      </div>

      {/* 2. Main Content */}
      <div className="container mx-auto px-4 relative z-10 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12 max-w-4xl mx-auto border border-gray-100">

          {/* عنوان و دسته‌بندی حالا داخل کارت سفید و در جریان عادی صفحه هستند
              (دیگه روی عکس اورلی نمی‌شن)، پس توی هیچ سایزی زیر چیزی گم یا بریده نمی‌شن */}
          {displayCategory && (
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
                   <Folder className="h-3 w-3" /> {displayCategory}
              </span>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6" dir={isEn ? 'ltr' : 'rtl'}>
              {displayTitle}
          </h1>

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
             <PostContent content={displayContent} dir={isEn ? 'ltr' : 'rtl'} />
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

          {/* اشتراک‌گذاری — چون عنوان/توضیحات/عکس/تگ‌ها بالاتر توی Open Graph
              ست شدن، وقتی فقط لینک شِر بشه، خودِ شبکه‌ی اجتماعی این‌ها رو خودکار
              از صفحه می‌خونه؛ نیازی به تایپ دستی متن یا تایتل نیست */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <ShareButtons url={pageUrl} title={displayTitle} isEn={isEn} />
          </div>

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