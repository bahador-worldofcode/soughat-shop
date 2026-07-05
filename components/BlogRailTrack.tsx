'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Calendar, Folder } from 'lucide-react';

type RailPost = {
  id: string | number;
  slug: string;
  title: string;
  title_en?: string | null;
  category?: string | null;
  category_en?: string | null;
  image?: string | null;
  image_en?: string | null;
  created_at: string;
};

// سرعت حرکت ریل به پیکسل بر ثانیه — عدد بزرگ‌تر یعنی سریع‌تر
const SPEED_PX_PER_SEC = 55;

export default function BlogRailTrack({
  posts,
  isEn,
}: {
  posts: RailPost[];
  isEn: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  // دو گروه کاملاً جدا برای «ست اول» و «ست دوم» (دقیقاً یکسان) — به‌جای یک
  // آرایه‌ی تکی، تا بتونیم فاصله‌ی واقعی بینشون رو مستقیم از روی صفحه
  // اندازه بگیریم (به دلایل زیر توضیح داده شده).
  const setARef = useRef<HTMLDivElement>(null);
  const setBRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const track = trackRef.current;
    const setA = setARef.current;
    const setB = setBRef.current;
    if (!track || !setA || !setB) return;

    // نکته‌ی مهم: اینجا از track.scrollWidth استفاده نمی‌کنیم، چون توی
    // صفحه‌ی فارسی (که کل صفحه dir="rtl" است) بعضی مرورگرها مقدار
    // scrollWidth رو برای یک المان dir="ltr" که داخل یک والد dir="rtl"
    // نشسته، اشتباه گزارش می‌دهند (همون چیزی که باعث می‌شد ریل فقط توی
    // نسخه‌ی فارسی مثل قطار برود و برنگردد، ولی توی نسخه‌ی انگلیسی درست
    // کار کند). به‌جاش، فاصله‌ی واقعی بین شروع «ست اول» و «ست دوم» رو با
    // getBoundingClientRect می‌سنجیم؛ این فاصله مستقل از transform فعلیه
    // (چون هر دو گروه با هم و به‌یک‌اندازه حرکت می‌کنند) و کاملاً مستقل از
    // باگ‌های RTL/LTR مرورگرهاست — همیشه عدد درست رو می‌دهد.
    const measure = () => {
      const aLeft = setA.getBoundingClientRect().left;
      const bLeft = setB.getBoundingClientRect().left;
      const distance = Math.abs(bLeft - aLeft);
      if (distance > 0) singleSetWidthRef.current = distance;
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(setA);
    resizeObserver.observe(setB);
    window.addEventListener('resize', measure);

    let rafId: number;
    let lastTime: number | null = null;

    const step = (time: number) => {
      if (lastTime === null) lastTime = time;
      const deltaSec = (time - lastTime) / 1000;
      lastTime = time;

      if (!pausedRef.current && singleSetWidthRef.current > 0) {
        offsetRef.current += SPEED_PX_PER_SEC * deltaSec;
        // نقطه‌ی چرخ‌وفلک: به‌جای اینکه به انتها برسه و بایسته، همین که به
        // اندازه‌ی یک ست کامل جلو رفت، بی هیچ پرشی برمی‌گرده به صفر
        offsetRef.current = offsetRef.current % singleSetWidthRef.current;
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [reducedMotion]);

  // رندر یک کارت — هم برای «ست اصلی» و هم برای «ست کپی» ازش استفاده می‌کنیم
  const renderCard = (post: RailPost, idx: number, isDuplicateSet: boolean) => {
    const displayTitle = isEn ? (post.title_en || post.title) : post.title;
    const displayCategory = isEn ? (post.category_en || post.category) : post.category;
    const displayImage = isEn ? (post.image_en || post.image) : post.image;

    return (
      <Link
        key={`${post.id}-${idx}-${isDuplicateSet ? 'dup' : 'orig'}`}
        href={`/blog/${post.slug}`}
        dir={isEn ? 'ltr' : 'rtl'}
        aria-hidden={isDuplicateSet ? true : undefined}
        tabIndex={isDuplicateSet ? -1 : undefined}
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
  };

  return (
    <div
      className="relative w-full max-w-full overflow-hidden soughat-blog-rail"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* محو شدن لبه‌ها، برای حس حرفه‌ای‌تر (کارت‌ها انگار از دل صفحه میان و میرن) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-24 md:w-32 bg-gradient-to-r from-blue-50/60 md:from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-24 md:w-32 bg-gradient-to-l from-blue-50/60 md:from-white to-transparent z-10" />

      <div className="overflow-hidden w-full max-w-full">
        {/* توجه: به‌جای یک آرایه‌ی تکی و تکرارشده، اینجا دو گروه جدا (ست اول و
            ست دوم، کاملاً یکسان) داریم که با gap مشترک همین دیو بیرونی کنار هم
            قرار می‌گیرن. این ساختار اجازه می‌ده فاصله‌ی واقعی بینشون رو مستقیم
            از روی صفحه اندازه بگیریم (توضیح کامل در useEffect بالا). */}
        <div
          ref={trackRef}
          dir="ltr"
          className="flex gap-5 md:gap-6 w-max"
          style={{ willChange: 'transform' }}
        >
          <div ref={setARef} className="flex gap-5 md:gap-6">
            {posts.map((post, idx) => renderCard(post, idx, false))}
          </div>
          <div ref={setBRef} className="flex gap-5 md:gap-6" aria-hidden="true">
            {posts.map((post, idx) => renderCard(post, idx, true))}
          </div>
        </div>
      </div>
    </div>
  );
}