'use client';

import { useEffect, useRef, useState } from 'react';
import { List, X } from 'lucide-react';
import type { Heading } from '@/lib/extractHeadings';

// ==========================================================================
// سایدبار «فهرست مطالب» کنار مقاله‌های وبلاگ.
//
// دسکتاپ (lg به بالا): یک ستون کوچک و sticky کنار کارت سفید مقاله (نه داخل
// خودِ متن مقاله)، که با اسکرول کردن کاربر همراه می‌مونه و بخش فعلیِ در حال
// خواندن رو با رنگ آبی هایلایت می‌کنه (Scrollspy با IntersectionObserver).
//
// موبایل/تبلت (کمتر از lg): چون کنار مقاله جایی برای یک سایدبار ثابت نیست، یک
// دکمه‌ی شناور بالای نوار پایین موبایل (MobileBottomNav) نشون داده می‌شه که با
// تپ روش، یک شیت (bottom-sheet) با همون فهرست باز می‌شه. برای انیمیشن این
// شیت از همون کلاس‌های animate-sheet-overlay / animate-sheet-panel که از قبل
// در app/globals.css برای شیت‌های دیگه‌ی سایت (مثل منوی «بیشتر») تعریف شده
// استفاده شده، تا تجربه‌ی کاربری با بقیه‌ی سایت کاملاً یکدست بمونه.
//
// اگر پستی هیچ h2 دارای id نداشته باشه (headings خالی باشه — مثلاً پست‌های
// قدیمی‌تر)، کل کامپوننت چیزی رندر نمی‌کنه و بی‌خطره.
// ==========================================================================

export default function TableOfContents({
  headings,
  isEn = false,
}: {
  headings: Heading[];
  isEn?: boolean;
}) {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const label = isEn ? 'Table of Contents' : 'فهرست مطالب';

  // Scrollspy: تشخیص اینکه کاربر الان زیر کدوم تیتر رو داره می‌خونه
  useEffect(() => {
    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // یعنی: یک تیتر «فعال» حساب می‌شه وقتی از زیر هدر ثابت (تقریبا ۱۰۰px)
        // رد شده باشه ولی هنوز داخل ۳۰٪ بالای صفحه باشه — همون منطقه‌ای که
        // چشم کاربر واقعاً داره می‌خونتش.
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  // قفل کردن اسکرول پس‌زمینه وقتی شیت موبایل بازه (تجربه‌ی استاندارد مودال)
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    setActiveId(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ===== دسکتاپ: سایدبار sticky کنار مقاله ===== */}
      <aside className="hidden lg:block lg:w-72 shrink-0">
        <nav className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <div className="flex items-center gap-2 text-gray-900 font-extrabold text-sm mb-4">
            <List className="h-4 w-4 text-blue-600" />
            {label}
          </div>
          <ul className="space-y-1 text-sm">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={() => handleClick(h.id)}
                  className={`block py-1.5 px-3 rounded-lg border-s-2 transition-colors leading-snug ${
                    activeId === h.id
                      ? 'bg-blue-50 border-s-blue-600 text-blue-700 font-bold'
                      : 'border-s-transparent text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* ===== موبایل/تبلت: دکمه‌ی شناور بالای نوار پایین + شیت ===== */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label={label}
          className="fixed bottom-24 end-4 z-40 flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-xl shadow-blue-600/30 font-bold text-sm active:scale-95 transition-transform"
        >
          <List className="h-4 w-4" />
          {label}
        </button>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-[70] bg-black/40 animate-sheet-overlay"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute bottom-0 start-0 end-0 bg-white rounded-t-3xl shadow-2xl max-h-[75vh] overflow-y-auto animate-sheet-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white rounded-t-3xl">
                <span className="font-extrabold text-gray-900 flex items-center gap-2">
                  <List className="h-4 w-4 text-blue-600" />
                  {label}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label={isEn ? 'Close' : 'بستن'}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 active:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="p-4 space-y-1">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      onClick={() => handleClick(h.id)}
                      className={`block py-2.5 px-3 rounded-lg text-sm transition-colors ${
                        activeId === h.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}