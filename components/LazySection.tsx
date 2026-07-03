'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /**
   * ارتفاع مینیمم جای‌گیر تا وقتی محتوای واقعی مانت نشده —
   * از پرش ناگهانی صفحه (layout shift) جلوگیری می‌کند
   * و اسکرول را نرم نگه می‌دارد.
   */
  minHeight?: number;
  /**
   * چقدر قبل از رسیدن واقعیِ این بخش به viewport، محتوا مانت شود (px).
   * عدد بزرگ‌تر یعنی محتوا زودتر و نامحسوس‌تر (قبل از دیده شدن) لود می‌شود.
   */
  rootMargin?: string;
  className?: string;
}

/**
 * بخش‌های سنگین صفحه (دسته‌بندی‌ها، نظرات کاربران، سوالات متداول و ...)
 * را فقط وقتی که کاربر در حال نزدیک‌شدن به آن‌هاست، مانت می‌کند.
 * دیتای سرور از قبل آماده است — فقط زمان نمایش در DOM به تعویق می‌افتد،
 * دقیقاً همان تجربه‌ی اسکرول مرحله‌به‌مرحله‌ی اپلیکیشن‌های حرفه‌ای.
 */
export default function LazySection({
  children,
  minHeight = 320,
  rootMargin = '400px 0px',
  className,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    const el = ref.current;
    if (!el) return;

    // اگر مرورگر (خیلی قدیمی) از IntersectionObserver پشتیبانی نکرد،
    // مستقیم نمایش بده تا محتوا هیچ‌وقت مخفی نماند.
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={ref} className={className} style={!isVisible ? { minHeight } : undefined}>
      {isVisible ? children : null}
    </div>
  );
}