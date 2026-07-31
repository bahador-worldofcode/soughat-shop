'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * SmartImage
 * ----------------------------------------------------------------
 * چرا این کامپوننت لازم شد:
 * وقتی سهمیه‌ی ماهانه‌ی Image Optimization ورسل (که در پلن رایگان محدود
 * است) تمام می‌شود، ورسل دیگر اجازه‌ی «بهینه‌سازی» عکس‌های تازه (عکس‌هایی
 * که قبلاً حداقل یک‌بار از مسیر /_next/image رد نشده‌اند) را نمی‌دهد و
 * next/image به‌جای نمایش عکس، آیکون شکسته (broken image) نشان می‌دهد.
 * دقیقاً همین اتفاق برای عکس محصول تازه افتاد: عکس‌های قدیمی چون قبلاً
 * یک‌بار بهینه و کش شده بودند مشکلی نداشتند، ولی عکس تازه هنوز از این
 * مسیر رد نشده بود و با رسیدن به سقف سهمیه، بهینه‌سازی‌اش رد شد.
 *
 * راه‌حل: در حالت عادی از همان next/image استفاده می‌کنیم (سریع‌تر، سبک‌تر
 * و به‌خوبی کش می‌شود)، اما اگر بارگذاری آن با خطا مواجه شد (چه به‌خاطر
 * تمام‌شدن سهمیه‌ی ورسل، چه هر دلیل دیگری)، خودکار و بی‌صدا به یک تگ
 * <img> ساده سوییچ می‌کنیم که مستقیم از آدرس اصلی (سوپابیس) می‌خواند و
 * اصلاً درگیر سهمیه‌ی ورسل نمی‌شود — دقیقاً همان روشی که صفحه‌ی جزئیات
 * محصول (ProductClientView.tsx) از اول با <img> ساده استفاده می‌کرد و
 * هیچ‌وقت این مشکل را نداشت. نتیجه: از این به بعد، چه سهمیه تمام شده
 * باشد چه نه، کاربر هیچ‌وقت جای عکس محصول، آیکون شکسته نمی‌بیند.
 */
export default function SmartImage({ src, alt, fill, sizes, className, priority }: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className={fill ? `absolute inset-0 h-full w-full ${className || ''}`.trim() : className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}