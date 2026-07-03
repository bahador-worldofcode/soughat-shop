import Skeleton from './Skeleton';

/**
 * اسکلت مشترک برای صفحات محتوایی ساده و کم‌تغییر سایت:
 * درباره‌ما، همکاران، اعتماد مشتری، چگونه کار می‌کند، قوانین.
 *
 * همه‌ی این صفحات از یک الگوی مشابه پیروی می‌کنند: یک بخش Hero
 * وسط‌چین در بالا و یک شبکه از کارت‌ها/بخش‌ها در پایین. به همین
 * دلیل به‌جای تکرار کد در ۵ فایل loading.tsx جدا، یک اسکلت مشترک
 * ساخته شده تا نگهداری آن در آینده ساده‌تر باشد.
 *
 * cardCount: تعداد کارت‌های اسکلت در گرید پایین (پیش‌فرض ۳)
 */
export default function SimplePageSkeleton({ cardCount = 3 }: { cardCount?: number }) {
  return (
    <div className="min-h-screen bg-white pb-20 font-[family-name:var(--font-vazir)]">
      {/* بخش Hero */}
      <div className="bg-blue-50/60 py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col items-center text-center gap-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-8 md:h-11 w-3/4 max-w-lg" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-2/3 max-w-sm" />
        </div>
      </div>

      {/* شبکه‌ی کارت‌ها */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4"
            >
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}