import { supabase } from '@/lib/supabase';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BookOpen, Calendar, Folder, ArrowLeft, ArrowRight } from 'lucide-react';

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

  // برای افکت لوپ بی‌نهایت: دقیقاً یک کپی کامل دیگه از همون آرایه رو می‌چسبونیم
  // به انتهاش، و ترک رو از ۰ تا -۵۰٪ حرکت می‌دیم. چون نیمه‌ی دوم دقیقاً مثل
  // نیمه‌ی اوله، لحظه‌ی ریست شدن پشت سر هم کاملاً نامرئیه.
  const trackPosts = [...railPosts, ...railPosts];
  const durationSec = Math.max(22, Math.round(railPosts.length * 3.5));

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

      {/* ریل قطاری — یک نوار افقی که کارت‌ها روش پیوسته و بی‌نهایت حرکت می‌کنن */}
      {/* نکته‌ی مهم رفع باگ: این دیو الان هم overflow-hidden و هم w-full/max-w-full
          داره (قبلاً فقط "relative" بود). به‌علاوه "contain: layout paint" توی
          استایل پایین، یه مرز سخت‌گیرانه می‌سازه که هیچ‌چیز داخلش — نه در چیدمان
          و نه در رندر — از این باکس بیرون نمی‌زنه. این دقیقاً همون چیزیه که روی
          موبایل نبود و باعث می‌شد ریل از سمت چپ از کادر صفحه خارج بشه و صفحه
          به‌صورت افقی قابل‌اسکرول شه. */}
      <div className="relative w-full max-w-full overflow-hidden soughat-blog-rail">
        {/* محو شدن لبه‌ها، برای حس حرفه‌ای‌تر (کارت‌ها انگار از دل صفحه میان و میرن) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-24 md:w-32 bg-gradient-to-r from-blue-50/60 md:from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-24 md:w-32 bg-gradient-to-l from-blue-50/60 md:from-white to-transparent z-10" />

        <div className="overflow-hidden w-full max-w-full">
          <div
            dir="ltr"
            className="flex gap-5 md:gap-6 w-max blog-rail-track"
            style={{ animationDuration: `${durationSec}s` }}
          >
            {trackPosts.map((post, idx) => {
              const displayTitle = isEn ? (post.title_en || post.title) : post.title;
              const displayCategory = isEn ? (post.category_en || post.category) : post.category;
              const displayImage = isEn ? (post.image_en || post.image) : post.image;

              return (
                <Link
                  key={`${post.id}-${idx}`}
                  href={`/blog/${post.slug}`}
                  dir={isEn ? 'ltr' : 'rtl'}
                  aria-hidden={idx >= railPosts.length ? true : undefined}
                  tabIndex={idx >= railPosts.length ? -1 : undefined}
                  className="group flex-shrink-0 w-[240px] sm:w-[280px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-100 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-36 sm:h-40 bg-gray-100 overflow-hidden">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={displayTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200 text-3xl font-bold">
                        Blog
                      </div>
                    )}
                    {displayCategory && (
                      <span className="absolute top-3 inset-x-3 flex">
                        <span className="inline-flex items-center gap-1 bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <Folder className="h-3 w-3" /> {displayCategory}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
                      <Calendar className="h-3 w-3" />
                      <time>{new Date(post.created_at).toLocaleDateString(isEn ? 'en-US' : 'fa-IR')}</time>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {displayTitle}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes soughatBlogRailScroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .soughat-blog-rail {
          /* مرز سخت‌گیرانه‌ی چیدمان/رندر — نمی‌گذارد ترک داخلی روی هیچ مرورگری
             (به‌خصوص موبایل) از این باکس بیرون بزند یا روی عرض صفحه اثر بگذارد. */
          contain: layout paint;
        }
        .blog-rail-track {
          animation-name: soughatBlogRailScroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .soughat-blog-rail:hover .blog-rail-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .blog-rail-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}