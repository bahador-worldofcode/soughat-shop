// app/[locale]/dashboard/page.tsx
// --------------------------------------------------------------
// این صفحه قبلاً یک placeholder ساده برای پنل کاربری بود.
// حالا که صفحهٔ کامل پروفایل در app/[locale]/profile/page.tsx
// ساخته شده، این مسیر فقط برای سازگاری با لینک‌های قدیمی (مثلاً
// اگر جایی بوکمارک شده یا در گوگل ایندکس شده) نگه داشته شده و
// بلافاصله کاربر را به صفحهٔ پروفایل هدایت می‌کند.
// --------------------------------------------------------------

'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );
}
