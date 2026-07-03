/**
 * اسکلت اختصاصی صفحه‌ی اصلی — دقیقاً منطبق با چیدمان واقعی
 * Hero + MarketRates + گرید «جدیدترین محصولات».
 *
 * محل قرارگیری: app/[locale]/(home)/loading.tsx
 * (فایل app/[locale]/page.tsx هم باید به app/[locale]/(home)/page.tsx
 *  منتقل بشه — چون پرانتزها یک Route Group هستن و در آدرس URL
 *  اصلاً ظاهر نمی‌شن، یعنی آدرس همچنان همون "/" باقی می‌مونه،
 *  فقط Next.js اجازه می‌ده برای این segment یک loading.tsx
 *  جدا از بقیه‌ی صفحات (contact, cart, checkout, ...) تعریف کنیم.)
 */
import Skeleton from '@/components/skeletons/Skeleton';

export default function HomeLoading() {
  return (
    <main className="flex flex-col min-h-screen font-[family-name:var(--font-vazir)] bg-gray-50/50">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-900 to-blue-950 min-h-[auto] md:min-h-[600px] py-12 md:py-0">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
            {/* ستون متن */}
            <div className="flex-1 w-full flex flex-col items-center md:items-start gap-4">
              <div className="h-7 w-32 rounded-full bg-white/10 animate-pulse" />
              <div className="h-9 md:h-14 w-4/5 max-w-md rounded-xl bg-white/10 animate-pulse" />
              <div className="h-9 md:h-14 w-3/5 max-w-sm rounded-xl bg-white/10 animate-pulse" />
              <div className="h-4 w-full max-w-md rounded-lg bg-white/10 animate-pulse mt-2" />
              <div className="h-4 w-2/3 max-w-sm rounded-lg bg-white/10 animate-pulse" />
              <div className="flex gap-4 mt-4">
                <div className="h-14 w-40 rounded-xl bg-white/10 animate-pulse" />
                <div className="h-14 w-40 rounded-xl bg-white/5 animate-pulse" />
              </div>
            </div>

            {/* ستون تصویر */}
            <div className="flex-1 flex justify-center w-full">
              <div className="w-56 h-56 md:w-80 md:h-80 rounded-3xl bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== نوار نرخ ارز ===== */}
      <section className="container mx-auto px-4 -mt-6 relative z-20 mb-12">
        <div className="bg-white/80 border border-white/40 shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-slate-900 p-3 px-6 flex justify-between items-center">
            <Skeleton className="h-4 w-24 bg-slate-700" />
            <Skeleton className="h-3 w-14 bg-slate-700" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 divide-x divide-y md:divide-y-0 divide-gray-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 flex flex-col items-center gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-2 w-8" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== گرید «جدیدترین محصولات» ===== */}
      <section className="container mx-auto px-4 mb-14 md:mb-20">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-28 hidden sm:block" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 sm:p-4 h-[260px] sm:h-[300px] border border-gray-100 flex flex-col gap-3 sm:gap-4"
            >
              <Skeleton className="h-32 sm:h-40 w-full rounded-xl" />
              <Skeleton className="h-3.5 sm:h-4 w-3/4" />
              <Skeleton className="h-3.5 sm:h-4 w-1/2" />
              <div className="flex items-end justify-between mt-auto">
                <Skeleton className="h-5 sm:h-6 w-14 sm:w-16" />
                <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}