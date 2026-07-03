// app/global-error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // این خطا حتی از خطای معمولی هم مهم‌تره چون یعنی خودِ Root Layout کرش کرده
    console.error('Global error (root layout crashed):', error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.className} antialiased bg-gray-50`}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="flex flex-col items-center text-center gap-6 max-w-md">
            <div className="bg-red-50 p-5 rounded-full">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">مشکلی در بارگذاری سایت پیش اومد</h1>
              <p className="text-gray-500 leading-7">
                یک خطای غیرمنتظره در بارگذاری اصلی سایت رخ داد. لطفاً دوباره تلاش کنید.
              </p>
              <p className="text-gray-400 text-sm leading-6" dir="ltr">
                Something went wrong loading the site. Please try again.
              </p>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              تلاش مجدد / Try again
            </button>
            {error.digest && (
              <p className="text-xs text-gray-300 font-mono">کد خطا: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}