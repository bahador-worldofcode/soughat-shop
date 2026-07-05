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
  // دو ست کامل از کارت‌ها رو پشت سر هم می‌چینیم؛ چون دو ست کاملاً یکسانن،
  // وقتی حرکت به اندازه‌ی عرض یک ست کامل رسید، با «باقی‌مانده‌ی تقسیم»
  // (modulo) برمی‌گردیم به صفر. یعنی هیچ‌وقت واقعاً «تمام» نمی‌شه — همیشه
  // می‌چرخه، دقیقاً مثل چرخ‌وفلک، نه مثل قطاری که برود و دیگر برنگردد.
  const trackPosts = [...posts, ...posts];

  const trackRef = useRef<HTMLDivElement>(null);
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
    if (!track) return;

    // اندازه‌ی واقعی یک «ست کامل» کارت‌ها رو از روی خود صفحه اندازه می‌گیریم
    // (نصف عرض کل ترک، چون ترک از دو ست یکسان تشکیل شده) — همیشه دقیقه و
    // مستقل از هر باگ درصدی/جهتی (dir) توی مرورگرهای مختلف.
    const measure = () => {
      singleSetWidthRef.current = track.scrollWidth / 2;
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);

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
    };
  }, [reducedMotion]);

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
        <div
          ref={trackRef}
          dir="ltr"
          className="flex gap-5 md:gap-6 w-max"
          style={{ willChange: 'transform' }}
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
                aria-hidden={idx >= posts.length ? true : undefined}
                tabIndex={idx >= posts.length ? -1 : undefined}
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
  );
}