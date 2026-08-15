'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, Package, User, Reply, Loader2, ChevronDown, Calendar } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

// ⚠️ این عدد باید همیشه دقیقاً با REVIEWS_BATCH_SIZE داخل
// app/[locale]/(home)/page.tsx یکی باشد — چون منطقِ offset صفحه‌بندیِ
// این‌جا (وقتی نظرات از تعداد همین دسته‌ی سئو-محورِ سرور فراتر بروند)
// به آن وابسته است. اگر یکی را عوض کردی، آن یکی را هم عوض کن.
const BATCH_SIZE = 24;

// 🆕 تعداد نظری که در نگاه اول (قبل از هر کلیکی) به کاربرِ عادی نشان
// داده می‌شود. این عدد کاملاً مستقل از BATCH_SIZE بالاست: BATCH_SIZE
// تعیین می‌کند «چقدر متنِ نظر برای گوگل/هوش‌مصنوعی در HTML خام باشد»،
// در حالی که این یکی فقط «چند تا کارت در نگاهِ اول برای انسان نمایش
// داده شود» را کنترل می‌کند — این دو دلیلِ کاملاً متفاوتی دارند و عمداً
// جدا نگه داشته شده‌اند.
const VISIBLE_DEFAULT = 6;

interface ReviewsFeedProps {
  /**
   * دسته‌ی نظراتی که از سرور (Server Component) آماده رسیده — تا
   * BATCH_SIZE تا. چون این‌ها همگی در HTML اولیه‌ی صفحه حضور دارند
   * (نه فقط بعد از اجرای جاوااسکریپت)، گوگل و ربات‌های هوش مصنوعی متن
   * واقعیِ همه‌ی همین‌ها را همان لحظه‌ی اول می‌بینند و می‌خوانند.
   */
  initialReviews?: any[];
  /** آیا فراتر از همین دسته‌ی سرور، نظرِ تاییدشده‌ی دیگری هم در دیتابیس هست؟ */
  initialHasMore?: boolean;
  /** تعداد کلِ نظراتِ تاییدشده (برای نمایشِ «فلانی از فلانی نظر») */
  totalCount?: number;
}

export default function ReviewsFeed({
  initialReviews = [],
  initialHasMore = false,
  totalCount = 0,
}: ReviewsFeedProps) {
  const t = useTranslations('Home');
  const locale = useLocale();
  const isEn = locale === 'en';

  // همه‌ی نظراتی که تا این لحظه در حافظه‌ی مرورگر داریم — چه از سرور
  // آمده باشند (initialReviews) چه با کلیکِ «نظرات بیشتر» از سوپابیس
  // اضافه شده باشند.
  const [reviews, setReviews] = useState<any[]>(initialReviews);

  // چند تای اول از آرایه‌ی بالا واقعاً روی صفحه دیده می‌شوند. نکته‌ی
  // مهم: بالا بردنِ این عدد (تا سقفِ reviews.length) هیچ درخواستِ
  // جدیدی به سرور نمی‌زند — چون آن نظرات از قبل همین‌جا، در DOM،
  // حاضرند؛ فقط از حالتِ جمع‌شده به باز تبدیل می‌شوند. برای همین اولین
  // کلیکِ روی «نظرات بیشتر» (تا وقتی به ته دسته‌ی سرور برسیم) کاملاً
  // آنی است، بدون حتی یک میلی‌ثانیه لودینگ.
  const [visibleCount, setVisibleCount] = useState(
    Math.min(VISIBLE_DEFAULT, initialReviews.length)
  );

  // آیا فراتر از چیزی که همین الان در reviews داریم، نظرِ دیگری هم در
  // دیتابیس هست که باید واقعاً از سرور گرفته شود؟
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const formatReviewDate = (iso: string) => {
    try {
      const loc = isEn ? 'en-US' : 'fa-IR';
      return new Intl.DateTimeFormat(loc, { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(iso)
      );
    } catch {
      return '';
    }
  };

  const handleShowMore = async () => {
    // حالتِ ۱: هنوز نظرِ دیگری از همون دسته‌ی سرور داریم که نشون نداده‌ایم
    // — فقط بازش کن، بدون شبکه.
    if (visibleCount < reviews.length) {
      setVisibleCount((prev) => Math.min(prev + VISIBLE_DEFAULT, reviews.length));
      return;
    }

    // حالتِ ۲: همه‌ی چیزی که سرور از قبل داده بود را نشان داده‌ایم، ولی
    // در دیتابیس نظرِ بیشتری هم هست — این‌جا واقعاً یک دسته‌ی جدید از
    // سوپابیس می‌گیریم (دقیقاً همون منطقِ صفحه‌بندیِ قبلی، فقط این بار
    // با کلیکِ صریحِ کاربر، نه اسکرولِ خودکار).
    if (!hasMore) return;

    setLoadingMore(true);
    const currentOffset = reviews.length;
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(currentOffset, currentOffset + BATCH_SIZE - 1);

    if (data) {
      if (data.length < BATCH_SIZE) setHasMore(false);
      setReviews((prev) => {
        const updated = [...prev, ...data];
        setVisibleCount(Math.min(prev.length + VISIBLE_DEFAULT, updated.length));
        return updated;
      });
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  if (reviews.length === 0) return null;

  const visibleReviews = reviews.slice(0, visibleCount);
  // دکمه فقط وقتی نشون داده می‌شه که واقعاً چیزی برای نشون دادنِ بیشتر
  // مونده باشه — نه صرفاً چون تئوریاً امکانش هست. با ۵-۶ نظرِ فعلیِ
  // سایت، این دکمه اصلاً رندر نمی‌شه؛ همین‌که تعداد نظرات از
  // VISIBLE_DEFAULT بیشتر بشه، خودش ظاهر می‌شه.
  const canShowMore = visibleCount < reviews.length || hasMore;

  return (
    <div dir={isEn ? 'ltr' : 'rtl'}>
      {totalCount > VISIBLE_DEFAULT && (
        <p className="text-center text-blue-200/70 text-xs mb-6 -mt-6">
          {t('reviews_showing_count', { shown: visibleReviews.length, total: totalCount })}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl flex flex-col transition-all duration-300 hover:-translate-y-1"
          >
            {/* ستاره‌ها + تاریخ */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-400/30'}`} />
                ))}
              </div>
              {review.created_at && (
                <div className="flex items-center gap-1 text-blue-200/60 text-[10px]">
                  <Calendar className="h-3 w-3" />
                  <span>{formatReviewDate(review.created_at)}</span>
                </div>
              )}
            </div>

            {/* متن نظر */}
            <p className="text-blue-50 text-sm leading-8 mb-6 text-justify flex-1">
              "{review.comment}"
            </p>

            {/* پاسخ ادمین */}
            {review.admin_reply && (
              <div className="mb-6 bg-blue-900/40 p-4 rounded-2xl border border-blue-400/20 text-xs">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold mb-2">
                  <Reply className="h-3 w-3" /> {t('admin_reply_label')}
                </div>
                <p className="text-blue-100 leading-6 text-justify">{review.admin_reply}</p>
              </div>
            )}

            {/* اطلاعات فرستنده و اقلام */}
            <div className="mt-auto pt-4 border-t border-white/10 flex items-start gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex flex-shrink-0 items-center justify-center text-white font-bold shadow-md">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">{review.sender_name}</h4>
                <div className="text-blue-200/70 text-[10px] flex items-start gap-1">
                  <Package className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-5">{review.items_summary}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🆕 دکمه‌ی صریحِ «نظرات بیشتر» — به‌جای اسکرولِ خودکارِ قبلی.
          وقتی نظرات از قبل در حافظه هستند (تا سقفِ BATCH_SIZE)، کلیک
          کاملاً آنی است؛ فقط وقتی به ته همون دسته برسیم و واقعاً نظرِ
          بیشتری در دیتابیس باشد، یک اسپینرِ کوتاه در خودِ دکمه دیده
          می‌شود تا دسته‌ی بعدی از سرور بیاید. */}
      {canShowMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleShowMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-8 py-3 rounded-full transition-all backdrop-blur-sm shadow-lg hover:-translate-y-1 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('reviews_loading_more')}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                {t('reviews_load_more')}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}