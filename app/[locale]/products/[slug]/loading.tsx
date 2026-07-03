import Skeleton from '@/components/skeletons/Skeleton';

/**
 * اسکلت جزئیات محصول — منطبق با components/ProductClientView.tsx
 * (grid-cols-12، md:col-span-5 برای تصویر و md:col-span-7 برای اطلاعات)
 * تا هیچ پرشی هنگام جایگزینی با محتوای واقعی رخ ندهد.
 */
export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* نوار بازگشت */}
        <div className="mb-6">
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl shadow-gray-200/50 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 items-start">
            {/* تصویر محصول */}
            <div className="md:col-span-5">
              <Skeleton className="aspect-square w-full rounded-3xl" />
            </div>

            {/* اطلاعات محصول */}
            <div className="md:col-span-7 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-28 rounded-lg" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>

              <Skeleton className="h-9 w-5/6" />
              <Skeleton className="h-9 w-2/3 -mt-4" />

              <div className="p-6 md:p-8 rounded-[2rem] border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-32" />
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}