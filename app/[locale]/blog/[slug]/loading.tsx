import Skeleton from '@/components/skeletons/Skeleton';

/**
 * اسکلت صفحه‌ی مقاله — منطبق با app/[locale]/blog/[slug]/page.tsx:
 * تصویر هدر تمام‌عرض، سپس کارت سفید محتوا که با -mt-10 روی تصویر
 * هدر سوار می‌شود (دقیقاً مثل نسخه‌ی واقعی).
 */
export default function BlogArticleLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-[family-name:var(--font-vazir)]">
      {/* تصویر هدر */}
      <div className="relative h-[300px] md:h-[450px] w-full bg-gray-200 animate-pulse" />

      {/* محتوای اصلی */}
      <div className="container mx-auto px-4 relative z-10 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12 max-w-4xl mx-auto border border-gray-100">
          <div className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-100">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`}
              />
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex gap-2">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-14 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}