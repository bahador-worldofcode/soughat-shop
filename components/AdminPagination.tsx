'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

// کامپوننتِ مشترکِ صفحه‌بندی برای جدول‌های پنل ادمین (کاربران،
// کیف‌پول مشتریان، و هر جدولِ مشابهِ دیگه‌ای که بعداً اضافه بشه).
// طراحی‌اش دقیقاً هم‌خانواده‌ی pagination موجود در app/[locale]/blog
// است تا سبکِ کل سایت یک‌دست بمونه.
export default function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  disabled = false,
}: AdminPaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // حداکثر ۵ شماره‌صفحه‌ی نزدیک به صفحه‌ی فعلی نشون داده می‌شه تا با
  // زیاد شدنِ تعداد صفحات، نوار صفحه‌بندی خیلی طولانی نشه.
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pageNumbers: number[] = [];
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  const pageButtonClass = (isActive: boolean) =>
    `min-w-9 h-9 px-2 rounded-lg text-sm font-bold transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-300'
    }`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      <p className="text-xs text-gray-500">
        نمایش <span className="font-bold text-gray-700">{from.toLocaleString('fa-IR')}</span> تا{' '}
        <span className="font-bold text-gray-700">{to.toLocaleString('fa-IR')}</span> از{' '}
        <span className="font-bold text-gray-700">{total.toLocaleString('fa-IR')}</span> نتیجه
      </p>

      <div className="flex items-center gap-1" dir="ltr">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="صفحه‌ی قبلی"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {start > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className={pageButtonClass(false)}>
              {(1).toLocaleString('fa-IR')}
            </button>
            {start > 2 && <span className="text-gray-400 px-1">…</span>}
          </>
        )}

        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={disabled}
            className={pageButtonClass(p === page)}
          >
            {p.toLocaleString('fa-IR')}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-gray-400 px-1">…</span>}
            <button onClick={() => onPageChange(totalPages)} className={pageButtonClass(false)}>
              {totalPages.toLocaleString('fa-IR')}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="صفحه‌ی بعدی"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}