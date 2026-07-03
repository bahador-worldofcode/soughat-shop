'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Admin route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-[family-name:var(--font-vazir)] px-4">
      <div className="flex flex-col items-center text-center gap-6 max-w-md">
        <div className="bg-red-50 p-5 rounded-full">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">خطایی در پنل مدیریت رخ داد</h1>
          <p className="text-gray-500 text-sm leading-7">
            این بخش نتونست به‌درستی بارگذاری بشه. می‌تونید دوباره تلاش کنید یا به داشبورد برگردید.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            تلاش مجدد
          </button>

          <button
            onClick={() => router.push('/admin/dashboard')}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            بازگشت به داشبورد
          </button>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-300 font-mono">کد خطا: {error.digest}</p>
        )}
      </div>
    </div>
  );
}