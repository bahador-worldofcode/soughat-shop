import Skeleton from '@/components/skeletons/Skeleton';

/**
 * اسکلت لیست وبلاگ — منطبق با چیدمان app/[locale]/blog/page.tsx:
 * عنوان و زیرعنوان وسط‌چین در بالا، سپس گرید ۳ ستونه‌ی کارت‌های مقاله.
 */
export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-3 mb-16">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <Skeleton className="h-56 w-full rounded-none" />
              <div className="p-6 flex flex-col gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
                <div className="space-y-2 mt-1">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-4/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}