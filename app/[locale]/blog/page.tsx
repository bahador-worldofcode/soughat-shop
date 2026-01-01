import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';

// کش کردن دیتا برای سرعت بالا (ISR) - هر ۶۰ ثانیه
export const revalidate = 60;

// تعداد پست در هر صفحه
const POSTS_PER_PAGE = 9;

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogIndex({ searchParams }: BlogPageProps) {
  // 1. دریافت شماره صفحه از URL
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">وبلاگ سوغات شاپ</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            جدیدترین مقالات درباره ارسال پول، خرید سوغات و راهنمای مهاجران
          </p>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">هنوز مقاله‌ای منتشر نشده است (یا صفحه‌ای وجود ندارد).</p>
          </div>
        ) : (
          <>
            {/* لیست پست‌ها */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                  <Link href={`/blog/${post.slug}`} className="block relative h-56 bg-gray-200 overflow-hidden">
                    {post.image ? (
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200 text-4xl font-bold">Blog</div>
                    )}
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <Calendar className="h-3 w-3" />
                      <time>{new Date(post.created_at).toLocaleDateString('fa-IR')}</time>
                    </div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-7">
                      {post.summary || post.content.substring(0, 150)}...
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-blue-600 font-medium text-sm hover:gap-2 transition-all">
                        ادامه مطلب <ArrowLeft className="mr-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* کنترل‌های Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 border-t border-gray-200 pt-8">
                {/* دکمه قبلی */}
                <Link
                  href={currentPage > 1 ? `/blog?page=${currentPage - 1}` : '#'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    currentPage > 1 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  <ArrowRight className="h-4 w-4" /> صفحه قبل
                </Link>

                <span className="text-sm text-gray-600 font-bold">
                  صفحه {currentPage} از {totalPages}
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
                  صفحه بعد <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}