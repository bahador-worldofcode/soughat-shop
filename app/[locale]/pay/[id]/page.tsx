// مسیر فایل در پروژه: app/[locale]/pay/[id]/page.tsx
// این یک فایل جدید است — باید دقیقاً با همین مسیر ساخته شود
// (یعنی پوشه‌های pay و [id] را داخل app/[locale]/ بسازید و این فایل
// را با نام page.tsx داخل [id] قرار دهید).
// --------------------------------------------------------------
// صفحه‌ی «تکمیل پرداخت سفارش» — برای وقتی مشتری یک سفارش را قبلاً ثبت
// کرده (در چک‌اوت) ولی صفحه را بدون پرداخت بسته، و حالا (از تب
// «سفارش‌های من» در پروفایلش، با دکمه‌ی «تکمیل و پرداخت») می‌خواهد
// دقیقاً همان سفارش را تمام کند.
//
// چرا یک صفحه‌ی جداگانه به‌جای برگرداندن کاربر به همان ویزارد چندمرحله‌ای
// چک‌اوت؟ چون در آن لحظه دیگر لازم نیست آدرس/گیرنده دوباره پرسیده شود —
// همه‌ی این‌ها از قبل، همراه با سفارش، در دیتابیس ذخیره شده‌اند. تنها
// چیزی که باقی مانده «پرداخت» است؛ پس این صفحه مستقیم همان مرحله را
// نشان می‌دهد — ساده‌تر، سریع‌تر، و بدون سردرگمی.
//
// نکته‌ی امنیتی: این صفحه — دقیقاً هم‌الگو با صفحه‌های /success و /track
// که از قبل در پروژه هستند — به ورود (login) نیازی ندارد و صرفاً بر
// اساس شناسه‌ی UUID سفارش (که حدس زدنش عملاً غیرممکن است) کار می‌کند؛
// چون سفارش‌های مهمان (بدون حساب کاربری) هم باید بتوانند از همین مسیر
// پرداختشان را تکمیل کنند. هیچ اطلاعات حساسی (نام/آدرس/تلفن) در این
// صفحه یا API های زیرش برنمی‌گردد — دقیقاً همان اصلِ حداقلی‌بودنِ
// اطلاعات که در app/api/orders/verify/route.ts هم رعایت شده.
// --------------------------------------------------------------

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle, CheckCircle2, Ban } from 'lucide-react';
import CryptoPayment from '@/components/CryptoPayment';

export default function PayOrderPage() {
  const t = useTranslations('PayOrder');
  const params = useParams();
  const orderId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  // null یعنی «هنوز در حال بررسی»، true/false یعنی جواب قطعی از سرور رسیده
  const [exists, setExists] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!orderId) {
        setExists(false);
        return;
      }
      try {
        // همان API سبک و بدون-احرازهویتی که صفحه‌ی success هم استفاده
        // می‌کند — فقط می‌گوید سفارش وجود دارد یا نه و وضعیتش چیست.
        const res = await fetch(`/api/orders/verify?id=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (cancelled) return;
        setExists(!!data?.exists);
        setStatus(data?.status ?? null);
      } catch {
        if (!cancelled) setExists(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // --- در حال بررسی اعتبار سفارش ---
  if (exists === null) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[55vh] text-center font-[family-name:var(--font-vazir)]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  // --- سفارشی با این شناسه پیدا نشد ---
  if (!exists) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[55vh] text-center animate-in fade-in duration-500 font-[family-name:var(--font-vazir)]">
        <div className="bg-red-50 p-6 rounded-full mb-6">
          <AlertCircle className="h-14 w-14 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">{t('not_found_title')}</h1>
        <p className="text-gray-500 max-w-md mb-8 leading-7">{t('not_found_desc')}</p>
        <Link
          href="/profile"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all"
        >
          {t('back_to_profile')}
        </Link>
      </div>
    );
  }

  // --- سفارش پیدا شد ولی دیگر در انتظار پرداخت نیست (قبلاً پرداخت/لغو شده) ---
  if (status !== 'pending') {
    const isResolved = status === 'paid' || status === 'sent' || status === 'delivered';
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[55vh] text-center animate-in fade-in duration-500 font-[family-name:var(--font-vazir)]">
        <div className={`p-6 rounded-full mb-6 ${isResolved ? 'bg-green-50' : 'bg-gray-100'}`}>
          {isResolved ? (
            <CheckCircle2 className="h-14 w-14 text-green-600" />
          ) : (
            <Ban className="h-14 w-14 text-gray-400" />
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">
          {isResolved ? t('already_paid_title') : t('cancelled_title')}
        </h1>
        <p className="text-gray-500 max-w-md mb-8 leading-7">
          {isResolved ? t('already_paid_desc') : t('cancelled_desc')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/track"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            {t('track_btn')}
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all"
          >
            {t('back_to_profile')}
          </Link>
        </div>
      </div>
    );
  }

  // --- سفارش معتبر و در انتظار پرداخت است: مستقیم مرحله‌ی پرداخت را نشان بده ---
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg font-[family-name:var(--font-vazir)] animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-500 text-sm leading-7">{t('subtitle')}</p>
        <p className="mt-4 inline-block text-xs font-mono text-gray-500 dir-ltr bg-gray-100 px-3 py-1.5 rounded-lg break-all">
          {orderId}
        </p>
      </div>

      <CryptoPayment orderId={orderId} />
    </div>
  );
}