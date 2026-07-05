import { supabase } from '@/lib/supabase';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import BlogRailTrack from './BlogRailTrack';

// حداقل تعداد کارت لازم روی ریل تا حرکتش همیشه پر و روان به‌نظر برسه
// (اگر تعداد پست‌های واقعی کمتر بود، همین چندتا رو تکرار می‌کنیم)
const MIN_RAIL_CARDS = 8;

export default async function BlogRail() {
  const locale = await getLocale();
  const isEn = locale === 'en';
  const t = await getTranslations('Blog');

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!posts || posts.length === 0) return null;

  // پر کردن ریل تا حداقل تعداد لازم (با تکرار همون پست‌ها، فقط برای حرکت روان‌تر)
  let railPosts = [...posts];
  while (railPosts.length < MIN_RAIL_CARDS) {
    railPosts = [...railPosts, ...posts];
  }

  return (
    <section className="relative w-full max-w-full py-14 md:py-20 bg-gradient-to-b from-white to-blue-50/40 border-t border-gray-100 overflow-x-hidden font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
            {t('title')}
          </h2>
          <p className="text-gray-500 mt-2 max-w-xl">{t('subtitle')}</p>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 self-start md:self-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          {isEn ? 'View all articles' : 'مشاهده همه مقالات'}
          {isEn ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        </Link>
      </div>

      {/* حرکت ریل با جاوااسکریپت (BlogRailTrack) کنترل می‌شه، نه با انیمیشن
          خالص CSS. دلیلش: با جاوااسکریپت، موقعیت هر فریم از روی عرض واقعی
          چیده‌شده‌ی کارت‌ها (اندازه‌گیری‌شده از خود صفحه) و با «باقی‌مانده‌ی
          تقسیم» محاسبه می‌شه؛ یعنی هیچ‌وقت واقعاً به انتها نمی‌رسه که «تمام
          بشه» — همیشه می‌چرخه، دقیقاً مثل چرخ‌وفلک، نه مثل قطاری که برود و
          برنگردد. این روش مستقل از باگ‌های مرورگرهای موبایل با انیمیشن‌های
          درصدی/جهت‌دار (dir) هم هست. */}
      <BlogRailTrack posts={railPosts} isEn={isEn} />
    </section>
  );
}