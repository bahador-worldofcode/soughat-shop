/**
 * لودینگ عمومی سطح [locale] — برای صفحاتی که اسکلت اختصاصی خودشان
 * را ندارند: تماس با ما، سبد خرید، تسویه‌حساب، پیگیری سفارش،
 * ثبت نظر، صفحه‌ی موفقیت و راهنمای کریپتو.
 *
 * توجه: طبق قرارداد Next.js، فایل loading.tsx پارامتر params
 * (از جمله locale) دریافت نمی‌کند، برای همین محتوای آن عمداً خنثی
 * و مستقل از زبان طراحی شده است.
 *
 * برای انیمیشن نوار پیشرفت پایین به این کیف‌فریم در globals.css نیاز داریم:
 *
 * @keyframes soughat-loading-bar {
 *   0%   { transform: translateX(-100%); }
 *   100% { transform: translateX(250%); }
 * }
 * .animate-loading-bar {
 *   animation: soughat-loading-bar 1.1s ease-in-out infinite;
 * }
 */
export default function LocaleLoading() {
  return (
    <div
      className="flex min-h-[65vh] w-full flex-col items-center justify-center gap-6 px-4 py-24"
      role="status"
      aria-live="polite"
    >
      {/* نشان برند با افکت پینگ ملایم به‌جای اسپینر دایره‌ای ساده */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 text-white"
            aria-hidden="true"
          >
            <path
              d="M20 12v9H4v-9M2 7h20v5H2V7Zm10 0V4a2.5 2.5 0 1 0-2.5 2.5H12Zm0 0V4a2.5 2.5 0 1 1 2.5 2.5H12Zm0 0v14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* نوار پیشرفت نامعین */}
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full w-1/3 rounded-full bg-blue-500 animate-loading-bar" />
      </div>

      <span className="sr-only">در حال بارگذاری… / Loading…</span>
    </div>
  );
}