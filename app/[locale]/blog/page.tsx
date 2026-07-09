import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

// کش کردن دیتا برای سرعت بالا (ISR) - هر ۶۰ ثانیه
export const revalidate = 60;

// تعداد پست در هر صفحه
const POSTS_PER_PAGE = 9;

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
  params: Promise<{ locale: string }>;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';
}

// ✅ رفع باگ hreflang: قبلاً این صفحه generateMetadata مخصوص به خودش نداشت،
// پس alternates.languages رو از app/[locale]/layout.tsx به ارث می‌برد که
// به‌صورت پیش‌فرض به «/fa» و «/en» (هوم‌پیج) اشاره می‌کنه، نه به خودِ
// «/fa/blog» و «/en/blog». یعنی گوگل می‌دید که hreflang صفحه‌ی وبلاگ به
// صفحه‌ی اصلی اشاره می‌کنه — یک سیگنال گمراه‌کننده. اینجا دقیقاً مثل
// app/[locale]/products/page.tsx یک override مخصوص همین صفحه اضافه شده که
// alternates رو به آدرس واقعیِ خودِ «/blog» (و در صورت وجود صفحه‌بندی،
// «/blog?page=N») اشاره می‌ده.
export async function generateMetadata({ searchParams, params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const isEn = locale === 'en';
  const siteUrl = getSiteUrl();
  const t = await getTranslations({ locale, namespace: 'Blog' });

  const currentPage = Math.max(1, Number(sp?.page) || 1);
  const canonicalPath = currentPage > 1 ? `/blog?page=${currentPage}` : '/blog';

  const title = t('title');
  const description = t('subtitle');

  return {
    // 🔧 رفع باگ «۲ بار سوغات شاپ در تایتل»: t('title') از messages/*.json میاد
    // و مقدارش «Soughat Shop Blog» / «وبلاگ سوغات شاپ» هست — یعنی از قبل
    // شامل نام برند. اگه به‌صورت رشته‌ی ساده بدیمش، لایوت دوباره template
    // «%s | Soughat Shop» رو اضافه می‌کنه و برند دو بار تکرار میشه.
    // title.absolute یعنی «همین رو دقیقاً همین‌طوری بفرست، دست لایوت بهش نرسه».
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}${canonicalPath}`,
      languages: {
        fa: `${siteUrl}/fa${canonicalPath}`,
        en: `${siteUrl}/en${canonicalPath}`,
        'x-default': `${siteUrl}/en${canonicalPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}${canonicalPath}`,
      type: 'website',
      locale: isEn ? 'en' : 'fa',
      siteName: 'Soughat Shop',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BlogIndex({ searchParams, params }: BlogPageProps) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const t = await getTranslations({locale, namespace: 'Blog'});

  // 1. دریافت شماره صفحه از URL
  const sp = await searchParams;
  const currentPage = Number(sp?.page) || 1;

  // 2. محاسبه بازه دریافت اطلاعات (از کجا تا کجا)
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  // 3. دریافت پست‌ها با محدودیت (Range)
  const { data: posts, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // 4. محاسبه تعداد کل صفحات
  const totalPosts = count || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">{t('empty')}</p>
          </div>
        ) : (
          <>
            {/* لیست پست‌ها */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" dir={isEn ? 'ltr' : 'rtl'}>
              {posts.map((post) => {
                // انتخاب هوشمند زبان (اگر انگلیسی نبود، فارسی را نشان بده)
                const displayTitle = isEn ? (post.title_en || post.title) : post.title;
                const displaySummary = isEn ? (post.summary_en || post.summary || post.content.substring(0, 150)) : (post.summary || post.content.substring(0, 150));
                // ✅ تصویر بر اساس زبان، با بازگشت خودکار به تصویر اصلی اگر image_en خالی بود
                const displayImage = isEn ? (post.image_en || post.image) : post.image;

                return (
                  <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                    <Link href={`/blog/${post.slug}`} className="block relative h-56 bg-gray-200 overflow-hidden">
                      {displayImage ? (
                        <img 
                          src={displayImage} 
                          alt={displayTitle} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200 text-4xl font-bold">Blog</div>
                      )}
                    </Link>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <Calendar className="h-3 w-3" />
                        <time>{new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')}</time>
                      </div>
                      
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                          {displayTitle}
                        </h2>
                      </Link>
                      
                      <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-7 text-justify">
                        {displaySummary}...
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-50">
                        <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-blue-600 font-medium text-sm hover:gap-2 transition-all group">
                          {isEn ? (
                             <>
                               {t('read_more')} <ArrowRight className="ml-1 h-4 w-4 group-hover:ml-2 transition-all" />
                             </>
                          ) : (
                             <>
                               {t('read_more')} <ArrowLeft className="mr-1 h-4 w-4 group-hover:mr-2 transition-all" />
                             </>
                          )}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* کنترل‌های Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 border-t border-gray-200 pt-8" dir="ltr">
                {/* دکمه قبلی (در انگلیسی چپ، در فارسی راست) */}
                <Link
                  href={currentPage > 1 ? `/blog?page=${currentPage - 1}` : '#'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    currentPage > 1 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  {isEn ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  {t('prev')}
                </Link>

                <span className="text-sm text-gray-600 font-bold">
                  {t('page')} {currentPage} {t('of')} {totalPages}
                </span>

                {/* دکمه بعدی */}
                <Link
                  href={currentPage < totalPages ? `/blog?page=${currentPage + 1}` : '#'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    currentPage < totalPages 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                  }`}
                  aria-disabled={currentPage >= totalPages}
                >
                  {t('next')}
                  {isEn ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
