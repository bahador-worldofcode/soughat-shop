import Skeleton from '@/components/skeletons/Skeleton';

/**
 * اسکلت لیست محصولات — طراحی این فایل عیناً بر اساس چیدمان واقعی
 * app/[locale]/products/page.tsx است (نوار فیلتر موبایل، سایدبار
 * دسکتاپ با سرچ/مرتب‌سازی/دسته‌بندی‌ها، و گرید کارت محصولات).
 */
export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* نوار فیلتر موبایل */}
      <div className="lg:hidden flex flex-col gap-3 mb-6">
        <Skeleton className="h-[52px] w-full rounded-2xl" />
        <Skeleton className="h-[52px] w-full rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* سایدبار دسکتاپ */}
        <aside className="hidden lg:flex lg:col-span-1 flex-col gap-6">
          <Skeleton className="h-[52px] w-full rounded-2xl" />
          <Skeleton className="h-[112px] w-full rounded-2xl" />
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </aside>

        {/* گرید محصولات */}
        <div className="lg:col-span-3 min-h-[500px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 h-[340px] border border-gray-100 flex flex-col gap-4"
              >
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-end justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}