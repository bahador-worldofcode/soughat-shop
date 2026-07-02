'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  /** متنی که داخل اعلان نمایش داده می‌شود */
  message: string;
  /** با true شدن این مقدار، اعلان ظاهر می‌شود (حتی اگر message عوض نشده باشد) */
  show: boolean;
  /** وقتی اعلان به‌طور کامل بسته/محو شد صدا زده می‌شود، برای ریست کردن استیت والد */
  onDone: () => void;
  /** مدت زمان نمایش قبل از محو شدن (میلی‌ثانیه) */
  duration?: number;
}

/**
 * یک اعلان (Toast) سبک و خودکفا، بدون وابستگی به کتابخانه‌ی خارجی.
 * به‌صورت fade + slide ظاهر و محو می‌شود و برای screen reader ها هم
 * با role="status" و aria-live="polite" قابل خواندن است.
 *
 * نکته: چون در تمام صفحه‌ها (هدر و نوار پایین موبایل) قابل استفاده است،
 * هر کامپوننتی که از آن استفاده می‌کند، استیت show/message خودش را نگه
 * می‌دارد؛ این کامپوننت فقط مسئول نمایش و انیمیشن است.
 */
export default function Toast({ message, show, onDone, duration = 2400 }: ToastProps) {
  // mounted: آیا المان اصلاً در DOM باشد؟ visible: آیا حالت "دیده‌شده" (فید این) را داشته باشد؟
  // این دو استیت جدا از هم هستند تا بشود قبل از حذف از DOM، انیمیشن خروج (فید اوت) را دید.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;

    setMounted(true);
    // یک فریم صبر می‌کنیم تا مرورگر state اولیه (opacity-0) را رندر کند،
    // بعد visible را true می‌کنیم تا ترنزیشن واقعاً اجرا شود (وگرنه مستقیم می‌پرد).
    const showFrame = requestAnimationFrame(() => setVisible(true));

    const hideTimer = setTimeout(() => setVisible(false), duration);
    const unmountTimer = setTimeout(() => {
      setMounted(false);
      onDone();
    }, duration + 300);

    return () => {
      cancelAnimationFrame(showFrame);
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, message]);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[100] px-4 w-full flex justify-center pointer-events-none"
    >
      <div
        className={`flex items-center gap-2 max-w-[90vw] bg-gray-900/95 backdrop-blur text-white text-sm font-bold pl-4 pr-3 py-3 rounded-2xl shadow-2xl transition-all duration-300 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
        <span className="truncate">{message}</span>
      </div>
    </div>
  );
}