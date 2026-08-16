// مسیر فایل در پروژه: app/admin/discounts/page.tsx
// این یک فایل جدید است — باید در همین مسیر ساخته شود.
// --------------------------------------------------------------
// پنل کاملِ مدیریتِ کدهای تخفیف:
//   • یک نوارِ آمارِ کلی بالای صفحه (چند نفر کدِ سفارشِ اول گرفتن، چندتاش
//     مصرف شده، جمعِ کل تخفیفی که تا الان داده شده)
//   • تبِ «سفارش اول»: همه‌ی کدهای شخصیِ خودکار، با نام/ایمیلِ صاحبش،
//     وضعیتِ استفاده، و لینک به سفارشی که باهاش ثبت شده (اگه استفاده شده)
//   • تبِ «کدهای دستی»: کدهایی که خودِ ادمین برای کمپین/تخفیفِ گروهی
//     ساخته — با امکانِ فعال/غیرفعال کردن، حذف، و ساختِ کدِ جدید
//   • تبِ «سفارش‌های تخفیف‌خورده»: برای حسابرسیِ دقیقِ محاسبات — هر
//     سفارش با جمع‌جزء، درصد، مبلغِ کسرشده و جمعِ نهایی، کنارِ هم
// --------------------------------------------------------------

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Tag,
  Users,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  Copy,
  Ban,
  Trash2,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';

interface DiscountCode {
  id: string;
  code: string;
  type: 'first_order' | 'manual';
  user_id: string | null;
  percent: number;
  is_active: boolean;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
  owner_name?: string | null;
  owner_email?: string | null;
  used_order_id?: string | null;
}

interface DiscountedOrder {
  id: string;
  created_at: string;
  status: string;
  customer_name: string;
  subtotal_price: number;
  discount_code: string;
  discount_percent: number;
  discount_amount_usd: number;
  total_price: number;
}

interface Stats {
  totalCodesIssued: number;
  totalRedeemed: number;
  totalDiscountGivenUSD: number;
  firstOrderIssued: number;
  firstOrderRedeemed: number;
}

type Tab = 'first_order' | 'manual' | 'orders';

const STATUS_FA: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  sent: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AdminDiscountsPage() {
  const [tab, setTab] = useState<Tab>('first_order');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [firstOrderCodes, setFirstOrderCodes] = useState<DiscountCode[]>([]);
  const [manualCodes, setManualCodes] = useState<DiscountCode[]>([]);
  const [discountedOrders, setDiscountedOrders] = useState<DiscountedOrder[]>([]);
  const [copiedCode, setCopiedCode] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCode, setNewCode] = useState({ code: '', percent: '15', maxUses: '', expiresAt: '', note: '' });

  const getAuthHeader = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${session?.access_token}` };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/discounts', { headers });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'خطا در بارگذاری اطلاعات');
      setStats(result.stats);
      setFirstOrderCodes(result.firstOrderCodes || []);
      setManualCodes(result.manualCodes || []);
      setDiscountedOrders(result.discountedOrders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleActive = async (id: string, isActive: boolean) => {
    const headers = await getAuthHeader();
    await fetch(`/api/admin/discounts/${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    fetchData();
  };

  const deleteCode = async (id: string) => {
    if (!confirm('این کدِ تخفیف برای همیشه حذف بشه؟ این کار برگشت‌ناپذیره.')) return;
    const headers = await getAuthHeader();
    await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 1500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!newCode.percent || Number(newCode.percent) <= 0) {
      setCreateError('درصد تخفیف را وارد کنید.');
      return;
    }
    setCreating(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.code || undefined,
          percent: Number(newCode.percent),
          maxUses: newCode.maxUses || null,
          expiresAt: newCode.expiresAt || null,
          note: newCode.note || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'خطا در ساختِ کد');

      setShowCreateForm(false);
      setNewCode({ code: '', percent: '15', maxUses: '', expiresAt: '', note: '' });
      fetchData();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="font-[family-name:var(--font-vazir)]">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-blue-600" />
            کدهای تخفیف
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            مدیریتِ کدِ خودکارِ ۱۵٪ سفارشِ اول، کدهای دستی، و بررسیِ دقیقِ محاسبات
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          به‌روزرسانی
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* نوارِ آمارِ کلی */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-bold text-gray-500">کدهای سفارشِ اول صادرشده</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{stats.firstOrderIssued.toLocaleString('fa-IR')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-bold text-gray-500">استفاده‌شده</span>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {stats.firstOrderRedeemed.toLocaleString('fa-IR')}
              <span className="text-sm text-gray-400 font-normal"> / {stats.firstOrderIssued.toLocaleString('fa-IR')}</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Tag className="h-4 w-4" />
              <span className="text-xs font-bold text-gray-500">کل کدهای مصرف‌شده</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{stats.totalRedeemed.toLocaleString('fa-IR')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-bold text-gray-500">جمعِ تخفیفِ داده‌شده</span>
            </div>
            <p className="text-2xl font-black text-gray-900 font-mono">${stats.totalDiscountGivenUSD.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* تب‌ها */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { key: 'first_order' as Tab, label: 'سفارشِ اول (۱۵٪)' },
          { key: 'manual' as Tab, label: 'کدهای دستی' },
          { key: 'orders' as Tab, label: 'سفارش‌های تخفیف‌خورده' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* ===== تبِ سفارشِ اول ===== */}
          {tab === 'first_order' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 text-xs text-gray-500 leading-6">
                هر کاربری که ثبت‌نام می‌کند، خودکار یک کدِ شخصیِ ۱۵٪ (یک‌بارمصرف) می‌گیرد — این‌جا لیستِ کاملِ همه‌ی این کدهاست.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs">
                      <th className="p-3 text-start font-bold">کاربر</th>
                      <th className="p-3 text-start font-bold">کد</th>
                      <th className="p-3 text-start font-bold">تاریخِ صدور</th>
                      <th className="p-3 text-start font-bold">وضعیت</th>
                      <th className="p-3 text-start font-bold">سفارشِ مرتبط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {firstOrderCodes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">هنوز کاربری ثبت‌نام نکرده است.</td>
                      </tr>
                    )}
                    {firstOrderCodes.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50">
                        <td className="p-3">
                          <p className="font-bold text-gray-800">{c.owner_name || '—'}</p>
                          <p className="text-[11px] text-gray-400 dir-ltr text-right">{c.owner_email || '—'}</p>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => copyCode(c.code)}
                            className="inline-flex items-center gap-1.5 font-mono text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            {copiedCode === c.code ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                            {c.code}
                          </button>
                        </td>
                        <td className="p-3 text-gray-500 text-xs">{formatDate(c.created_at)}</td>
                        <td className="p-3">
                          {c.uses_count > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> استفاده شده
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                              هنوز استفاده نشده
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {c.used_order_id ? (
                            <span className="font-mono text-[11px] text-blue-600 dir-ltr">{c.used_order_id.slice(0, 8)}…</span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== تبِ کدهای دستی ===== */}
          {tab === 'manual' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  کدِ تخفیفِ جدید
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs">
                        <th className="p-3 text-start font-bold">کد</th>
                        <th className="p-3 text-start font-bold">درصد</th>
                        <th className="p-3 text-start font-bold">استفاده</th>
                        <th className="p-3 text-start font-bold">انقضا</th>
                        <th className="p-3 text-start font-bold">یادداشت</th>
                        <th className="p-3 text-start font-bold">وضعیت</th>
                        <th className="p-3 text-start font-bold">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {manualCodes.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400">هنوز کدِ دستی‌ای نساخته‌اید.</td>
                        </tr>
                      )}
                      {manualCodes.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/50">
                          <td className="p-3">
                            <button
                              onClick={() => copyCode(c.code)}
                              className="inline-flex items-center gap-1.5 font-mono text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              {copiedCode === c.code ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                              {c.code}
                            </button>
                          </td>
                          <td className="p-3 font-bold text-gray-800">{c.percent}٪</td>
                          <td className="p-3 text-gray-600">
                            {c.uses_count} / {c.max_uses ?? '∞'}
                          </td>
                          <td className="p-3 text-gray-500 text-xs">{c.expires_at ? formatDate(c.expires_at) : '—'}</td>
                          <td className="p-3 text-gray-500 text-xs max-w-[160px] truncate">{c.note || '—'}</td>
                          <td className="p-3">
                            {c.is_active ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">فعال</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">غیرفعال</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleActive(c.id, !c.is_active)}
                                title={c.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                              >
                                {c.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => deleteCode(c.id)}
                                title="حذف"
                                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== تبِ سفارش‌های تخفیف‌خورده (حسابرسیِ محاسبات) ===== */}
          {tab === 'orders' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 text-xs text-gray-500 leading-6">
                هر سفارشی که با کد تخفیف ثبت شده، با جزئیاتِ کاملِ محاسبه — اگر یک درصد جایی عدد اشتباه بود، همین‌جا فوراً معلوم می‌شود.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs">
                      <th className="p-3 text-start font-bold">سفارش</th>
                      <th className="p-3 text-start font-bold">مشتری</th>
                      <th className="p-3 text-start font-bold">کد</th>
                      <th className="p-3 text-start font-bold">جمعِ‌جزء</th>
                      <th className="p-3 text-start font-bold">درصد</th>
                      <th className="p-3 text-start font-bold">مبلغِ کسرشده</th>
                      <th className="p-3 text-start font-bold">جمعِ نهایی</th>
                      <th className="p-3 text-start font-bold">وضعیت</th>
                      <th className="p-3 text-start font-bold">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {discountedOrders.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-gray-400">هنوز هیچ سفارشی با کد تخفیف ثبت نشده است.</td>
                      </tr>
                    )}
                    {discountedOrders.map((o) => {
                      // 🆕 چکِ صحتِ محاسبه، همین‌جا در خودِ مرورگر: اگه به هر
                      // دلیلی subtotal - discount != total (بیشتر از نیم‌سنت
                      // اختلاف)، یک هشدارِ قرمز نشون می‌دیم — یعنی همون لحظه
                      // که ادمین این جدول رو نگاه می‌کنه، هر مشکلِ محاسباتی‌ای
                      // خودش رو نشون می‌ده.
                      const expected = Math.round((o.subtotal_price - o.discount_amount_usd) * 100) / 100;
                      const mismatch = Math.abs(expected - o.total_price) > 0.005;
                      return (
                        <tr key={o.id} className={mismatch ? 'bg-red-50' : 'hover:bg-gray-50/50'}>
                          <td className="p-3 font-mono text-[11px] text-gray-500 dir-ltr">{o.id.slice(0, 8)}…</td>
                          <td className="p-3 text-gray-800">{o.customer_name}</td>
                          <td className="p-3 font-mono text-xs text-blue-600">{o.discount_code}</td>
                          <td className="p-3 font-mono text-gray-600">${o.subtotal_price}</td>
                          <td className="p-3 font-bold text-gray-700">{o.discount_percent}٪</td>
                          <td className="p-3 font-mono text-green-700">-${o.discount_amount_usd}</td>
                          <td className="p-3 font-mono font-bold text-gray-900">
                            ${o.total_price}
                            {mismatch && (
                              <span className="ms-2 inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
                                <AlertCircle className="h-3 w-3" /> ناهم‌خوانی!
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-xs text-gray-500">{STATUS_FA[o.status] || o.status}</td>
                          <td className="p-3 text-xs text-gray-400">{formatDate(o.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== مودالِ ساختِ کدِ تخفیفِ جدید ===== */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateForm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 font-[family-name:var(--font-vazir)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">ساختِ کدِ تخفیفِ جدید</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  متنِ کد <span className="text-gray-400 font-normal">(خالی بگذارید تا خودکار ساخته شود)</span>
                </label>
                <input
                  type="text"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                  placeholder="مثلاً NOWRUZ25"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm dir-ltr text-left focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">درصدِ تخفیف *</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step="0.01"
                  value={newCode.percent}
                  onChange={(e) => setNewCode({ ...newCode, percent: e.target.value })}
                  required
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm dir-ltr text-left focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  سقفِ تعدادِ استفاده <span className="text-gray-400 font-normal">(خالی = نامحدود)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
                  placeholder="مثلاً 100"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm dir-ltr text-left focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  تاریخِ انقضا <span className="text-gray-400 font-normal">(اختیاری)</span>
                </label>
                <input
                  type="date"
                  value={newCode.expiresAt}
                  onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm dir-ltr text-left focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">
                  یادداشتِ داخلی <span className="text-gray-400 font-normal">(فقط برای خودتان، مشتری نمی‌بیند)</span>
                </label>
                <input
                  type="text"
                  value={newCode.note}
                  onChange={(e) => setNewCode({ ...newCode, note: e.target.value })}
                  placeholder="مثلاً کمپینِ نوروز ۱۴۰۵"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {createError && (
                <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg p-3">{createError}</p>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                ساختِ کد
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}