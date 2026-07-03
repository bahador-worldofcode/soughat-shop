import { clsx } from 'clsx';

/**
 * بلوک پایه‌ی اسکلت (Skeleton) — یک مستطیل خاکستری با پالس آرام.
 * تمام فایل‌های loading.tsx پروژه از همین یک کامپوننت برای ساخت
 * شکل‌های مختلف (خط متن، تصویر، دکمه و ...) استفاده می‌کنند تا:
 *   ۱. استایل و سرعت انیمیشن در کل سایت یکدست بماند
 *   ۲. اگر فردا خواستیم افکت را عوض کنیم (مثلاً shimmer)، فقط همین‌جا تغییر کند
 *
 * از prefers-reduced-motion به‌صورت خودکار پشتیبانی می‌شود چون از
 * کلاس بومی Tailwind (`animate-pulse`) استفاده شده که خودش به این
 * تنظیم سیستم‌عامل احترام می‌گذارد.
 */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx('animate-pulse rounded-lg bg-gray-200/80', className)}
      aria-hidden="true"
    />
  );
}