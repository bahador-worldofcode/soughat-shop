'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Database,
  Loader2,
  Home,
  Package,
  BookOpen,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type Scope = 'home' | 'products' | 'blog' | 'all';

interface ResultState {
  type: 'success' | 'error';
  message: string;
}

export default function CacheManagementPage() {
  // در حالِ اجرا بودنِ هرکدام از دکمه‌ها (تا کاربر بداند دقیقاً کدام
  // عملیات در حال انجام است و بقیه‌ی دکمه‌ها غیرفعال شوند)
  const [runningScope, setRunningScope] = useState<Scope | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  // فرمِ پاک‌سازیِ نقطه‌ای (فقط یک محصول یا یک پستِ وبلاگِ خاص)
  const [singleType, setSingleType] = useState<'products' | 'blog'>('products');
  const [singleSlug, setSingleSlug] = useState('');
  const [singleRunning, setSingleRunning] = useState(false);

  const callCacheApi = async (payload: Record<string, unknown>) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('نشست شما منقضی شده. لطفاً دوباره وارد پنل شوید.');
    }

    const res = await fetch('/api/admin/cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || 'خطای ناشناخته در پاک‌سازیِ کش');
    }
    return json;
  };

  const handleClearScope = async (scope: Scope) => {
    setRunningScope(scope);
    setResult(null);
    try {
      await callCacheApi({ scope });
      setResult({
        type: 'success',
        message:
          scope === 'all'
            ? 'کل کشِ سایت با موفقیت پاک شد. تغییرات ظرف چند ثانیه برای همه‌ی بازدیدکنندگان قابل مشاهده است.'
            : 'کش با موفقیت پاک شد. تغییرات ظرف چند ثانیه قابل مشاهده است.',
      });
    } catch (error: any) {
      setResult({ type: 'error', message: error.message });
    } finally {
      setRunningScope(null);
    }
  };

  const handleClearSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleSlug.trim()) return;

    setSingleRunning(true);
    setResult(null);
    try {
      await callCacheApi({ type: singleType, slug: singleSlug.trim() });
      setResult({
        type: 'success',
        message: `کشِ «${singleSlug.trim()}» با موفقیت پاک شد.`,
      });
      setSingleSlug('');
    } catch (error: any) {
      setResult({ type: 'error', message: error.message });
    } finally {
      setSingleRunning(false);
    }
  };

  const scopeCards: {
    scope: Scope;
    title: string;
    description: string;
    icon: typeof Home;
  }[] = [
    {
      scope: 'home',
      title: 'صفحه‌ی اصلی',
      description: 'بنر، متن‌ها و هر تغییری که در صفحه‌ی اول سایت داده‌اید.',
      icon: Home,
    },
    {
      scope: 'products',
      title: 'محصولات',
      description: 'لیست محصولات و صفحه‌ی جزئیاتِ تک‌تکِ محصولات (هر دو زبان).',
      icon: Package,
    },
    {
      scope: 'blog',
      title: 'وبلاگ',
      description: 'لیست مقالات و صفحه‌ی جزئیاتِ تک‌تکِ مقالات (هر دو زبان).',
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          مدیریت کش سایت
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          صفحاتِ عمومیِ سایت برای سرعتِ بیشتر، تا ۶۰ ثانیه کش می‌شوند. اگر بعد از
          ذخیره‌ی یک تغییر، آن را روی سایت نمی‌بینید (یا عجله دارید که همین الان
          دیده شود)، از این صفحه کش را دستی خالی کنید.
        </p>
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            result.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {result.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm">{result.message}</p>
        </div>
      )}

      {/* پاک‌سازیِ بخش‌به‌بخش */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scopeCards.map(({ scope, title, description, icon: Icon }) => (
          <div
            key={scope}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800">{title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
            </div>
            <button
              onClick={() => handleClearScope(scope)}
              disabled={runningScope !== null}
              className="mt-4 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runningScope === scope ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              پاک کردن کشِ {title}
            </button>
          </div>
        ))}
      </div>

      {/* پاک‌سازیِ کامل */}
      <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg">پاک کردنِ کامل کشِ سایت</h3>
          <p className="text-sm text-blue-200 mt-1">
            صفحه‌ی اصلی، محصولات و وبلاگ — همه با هم، برای هر دو زبان.
          </p>
        </div>
        <button
          onClick={() => handleClearScope('all')}
          disabled={runningScope !== null}
          className="flex items-center gap-2 bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {runningScope === 'all' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Database className="h-5 w-5" />
          )}
          پاک کردنِ همه‌چیز
        </button>
      </div>

      {/* پاک‌سازیِ نقطه‌ای یک محصول/پست خاص */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-1">پاک کردنِ کشِ یک آیتمِ خاص</h3>
        <p className="text-xs text-gray-500 mb-4">
          به‌جای پاک‌کردنِ کلِ بخش، فقط کشِ یک محصول یا یک مقاله‌ی مشخص (با
          اسلاگش) را پاک کنید.
        </p>
        <form onSubmit={handleClearSingle} className="flex flex-col md:flex-row gap-3">
          <select
            value={singleType}
            onChange={(e) => setSingleType(e.target.value as 'products' | 'blog')}
            className="p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
          >
            <option value="products">محصول</option>
            <option value="blog">مقاله‌ی وبلاگ</option>
          </select>
          <input
            type="text"
            dir="ltr"
            placeholder="slug (مثلاً: golden-necklace)"
            value={singleSlug}
            onChange={(e) => setSingleSlug(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
          />
          <button
            type="submit"
            disabled={singleRunning || !singleSlug.trim()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {singleRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            پاک کن
          </button>
        </form>
      </div>
    </div>
  );
}