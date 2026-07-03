/**
 * لودینگ سطح پنل ادمین. یک اسکلت هماهنگ با تم ادمین (سایدبار آبی تیره +
 * محتوای خاکستری) نشان می‌دهد تا کاربر هیچ‌وقت با صفحه‌ی کاملاً سفید
 * مواجه نشود.
 */
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-vazir)] flex w-full">
      {/* اسکلت سایدبار */}
      <aside className="w-64 bg-blue-900 hidden md:flex flex-col shadow-2xl h-screen">
        <div className="p-6 border-b border-blue-800 flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-700 rounded-lg animate-pulse" />
          <div className="h-4 w-24 bg-blue-700 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 w-full bg-blue-800/60 rounded-lg animate-pulse" />
          ))}
        </div>
      </aside>

      {/* اسکلت محتوا */}
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
          </div>
          <span className="sr-only">در حال بارگذاری… / Loading…</span>
        </div>
      </main>
    </div>
  );
}