import type { ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** ارتفاع مینیمم جای‌گیر تا از پرش صفحه (layout shift) جلوگیری شود. */
  minHeight?: number;
  /** دیگر استفاده نمی‌شود؛ فقط برای سازگاری با بقیه‌ی صفحه نگه داشته شده. */
  rootMargin?: string;
  className?: string;
}

/**
 * بخش‌های سنگین صفحه (دسته‌بندی‌ها، نظرات، سوالات متداول و ...) را با
 * content-visibility رندر می‌کند: مرورگر هزینه‌ی رندر بخش‌های خارج از دید
 * را به تعویق می‌اندازد (همان سود سرعت قبلی)، ولی برخلاف روش قبلی، محتوا
 * همیشه در HTML واقعی صفحه حاضر است — یعنی گوگل و ربات‌های هوش مصنوعی که
 * اصلاً جاوااسکریپت اجرا نمی‌کنند (مثل ChatGPT، Perplexity و...) هم آن را
 * کامل می‌بینند.
 */
export default function LazySection({
  children,
  minHeight = 320,
  className,
}: LazySectionProps) {
  return (
    <div
      className={className}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: `1px ${minHeight}px`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}