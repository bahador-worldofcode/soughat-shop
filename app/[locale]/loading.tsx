/**
 * لودینگ عمومی سطح [locale] — این فایل به‌صورت خودکار توسط Next.js
 * دقیقاً همان لحظه‌ای که کاربر روی یک لینک کلیک می‌کند (قبل از این‌که
 * داده‌های سرور صفحه‌ی مقصد آماده شوند) نمایش داده می‌شود.
 *
 * این فایل صفحاتی را پوشش می‌دهد که اسکلت اختصاصی خودشان را ندارند:
 * صفحه‌ی خانه، تماس با ما، سبد خرید، تسویه‌حساب، پیگیری سفارش،
 * ثبت نظر، صفحه‌ی موفقیت و راهنمای کریپتو.
 *
 * توجه: طبق قرارداد Next.js، فایل loading.tsx پارامتر params
 * (از جمله locale) دریافت نمی‌کند، برای همین متن آن عمداً خنثی و
 * مستقل از زبان طراحی شده (فقط برچسب کمکی برای صفحه‌خوان‌ها).
 */
export default function LocaleLoading() {
  return (
    <div
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 py-24"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
      </div>

      {/* نقطه‌های ضربان‌دار — تقویت حس «در حال انجام»، بدون وابستگی به متن/زبان */}
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
      </div>

      <span className="sr-only">در حال بارگذاری… / Loading…</span>
    </div>
  );
}