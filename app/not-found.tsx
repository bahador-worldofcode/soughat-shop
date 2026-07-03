// app/not-found.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'صفحه پیدا نشد | سوغات شاپ',
  robots: { index: false, follow: false },
};

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="flex flex-col items-center text-center gap-6 max-w-md">
        <p className="text-6xl font-black text-blue-100 select-none">404</p>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">صفحه مورد نظر پیدا نشد</h1>
          <p className="text-gray-500 text-sm leading-7" dir="ltr">Page not found.</p>
        </div>
        <Link
          href="/fa"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm"
        >
          بازگشت به خانه / Back to home
        </Link>
      </div>
    </div>
  );
}