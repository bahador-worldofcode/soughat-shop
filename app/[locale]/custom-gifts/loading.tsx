import SimplePageSkeleton from '@/components/skeletons/SimplePageSkeleton';

// از همان اسکلت مشترکی استفاده می‌کند که صفحاتی مثل trust و how-it-works
// هم استفاده می‌کنند (components/skeletons/SimplePageSkeleton.tsx) — هیچ
// فایل جدیدی برای اسکلت لازم نبود.
export default function CustomGiftsLoading() {
  return <SimplePageSkeleton cardCount={4} />;
}