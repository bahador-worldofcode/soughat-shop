'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminPagination from '@/components/AdminPagination';
import { Search, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface WalletTopup {
  id: string;
  created_at: string;
  user_id: string;
  requested_currency: string;
  requested_amount: number;
  amount_usd: number;
  payment_method: string | null;
  // مبلغِ دقیقِ کریپتویی‌ای که مشتری همون لحظه رو صفحه دید (مثلاً «51.81»
  // برای USDT یا «0.29» برای SOL) — از این به بعد کنارِ روشِ پرداخت ذخیره
  // می‌شه تا ادمین دیگه مجبور نباشه برای فهمیدنش تلگرام رو بگرده یا خودش
  // حساب کنه.
  payable_crypto_amount: number | null;
  status: string;
  credited: boolean;
  paid_at: string | null;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export default function WalletTopupsPage() {
  const [topups, setTopups] = useState<WalletTopup[]>([]);

  // «loading» فقط برای اولین بارگذاری true می‌مونه (اسپینرِ تمام‌صفحه)؛
  // تعویضِ صفحه یا جستجو بعد از اون فقط «tableLoading» رو روشن می‌کنه.
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isFirstFetch = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchTopups(page, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  // چون جدولِ wallet_topups هم مثلِ orders کاملاً برای کلاینتِ anon قفل است،
  // دقیقاً همون الگوی توکنِ سشنِ ادمین + API امنِ سمتِ سرور رو استفاده می‌کنیم.
  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  };

  const fetchTopups = async (pageArg: number, searchArg: string) => {
    if (isFirstFetch.current) {
      setLoading(true);
    } else {
      setTableLoading(true);
    }
    setLoadError('');
    try {
      const headers = await getAuthHeader();
      const params = new URLSearchParams({
        page: String(pageArg),
        pageSize: String(PAGE_SIZE),
      });
      if (searchArg) params.set('search', searchArg);

      const res = await fetch(`/api/admin/wallet-topups?${params.toString()}`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطا در دریافت فاکتورهای شارژ');

      setTopups(json.topups as WalletTopup[]);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
    } catch (err: any) {
      setLoadError(err.message || 'خطای ناشناخته در دریافت فاکتورهای شارژ');
    } finally {
      setLoading(false);
      setTableLoading(false);
      isFirstFetch.current = false;
    }
  };

  // تابعِ مشترکِ هر دو دکمه‌ی عملیات؛ از تابعِ اتمیکِ سمتِ سرور (فاز ۱/۲) عبور
  // می‌کنه، پس هیچ‌وقت دوبار حساب نمی‌شه، حتی با کلیکِ تصادفیِ دوباره.
  const handleStatusChange = async (id: string, status: 'paid' | 'cancelled') => {
    setUpdatingId(id);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/wallet-topups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ id, status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      await fetchTopups(page, debouncedSearch);
    } catch (err: any) {
      alert('خطا: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // یک لایه‌ی محافظِ اضافه قبل از «تایید و شارژ کن» — چون این دکمه پول واقعی
  // جابه‌جا می‌کنه، اول باید ادمین با چشمِ خودش مطمئن بشه فاکتور را با پیامِ
  // واتساپِ همون مشتری تطبیق داده، نه با یک مشتریِ دیگه.
  const handleApprove = (id: string) => {
    if (!window.confirm('مطمئنی؟ این فاکتور واقعاً همین مشتریه که پیامش رو گرفتی؟')) return;
    handleStatusChange(id, 'paid');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: 'در انتظار بررسی',
      paid: 'شارژ شده',
      cancelled: 'لغو شده',
    };
    return map[status] || status;
  };

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'SEK':
        return 'kr';
      default:
        return '$';
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center flex flex-col items-center">
        <Loader2 className="animate-spin mb-2" /> در حال دریافت لیست فاکتورهای شارژ...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">کیف‌پول مشتریان</h2>
          <p className="text-sm text-gray-500">لیست فاکتورهای درخواستِ شارژ کیف‌پول</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو (نام، ایمیل، کد فاکتور)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm">
          {loadError}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative overflow-x-auto">
          {/* لایه‌ی سبکِ لودینگ روی جدول، فقط موقعِ تعویضِ صفحه/جستجو —
              جدولِ قبلی محو می‌مونه تا کاربر بفهمه چیزی در حالِ بارگذاریه،
              بدون اینکه کل صفحه خالی و از نو ساخته بشه. */}
          {tableLoading && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-start justify-center pt-12">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white shadow-sm border border-gray-100 rounded-full px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                در حال بارگذاری...
              </div>
            </div>
          )}

          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">مشتری</th>
                <th className="px-6 py-4 font-medium">مبلغ درخواستی</th>
                <th className="px-6 py-4 font-medium">معادل دلاری</th>
                <th className="px-6 py-4 font-medium">روش پرداخت</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
                <th className="px-6 py-4 font-medium">تاریخ</th>
                <th className="px-6 py-4 font-medium text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    فاکتور شارژی یافت نشد.
                  </td>
                </tr>
              ) : (
                topups.map((topup) => (
                  <tr key={topup.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{topup.profiles?.full_name || '---'}</div>
                      <div className="text-xs text-gray-500 mt-1 dir-ltr text-right">{topup.profiles?.email || '---'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dir-ltr text-right">
                      {getCurrencySymbol(topup.requested_currency)} {topup.requested_amount.toLocaleString('en-US')}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-700 dir-ltr text-right">
                      ${topup.amount_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {topup.payment_method ? (
                        <div>
                          <span className="font-bold text-gray-900">{topup.payment_method}</span>
                          {topup.payable_crypto_amount !== null && (
                            <span className="block text-xs text-blue-700 font-mono mt-0.5" dir="ltr">
                              {topup.payable_crypto_amount} {topup.payment_method}
                            </span>
                          )}
                        </div>
                      ) : (
                        '---'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          topup.status
                        )}`}
                      >
                        {getStatusText(topup.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(topup.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      {topup.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(topup.id)}
                            disabled={updatingId === topup.id}
                            className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                            title="تایید و شارژ کن"
                          >
                            {updatingId === topup.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleStatusChange(topup.id, 'cancelled')}
                            disabled={updatingId === topup.id}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                            title="لغو"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-gray-300">—</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          disabled={tableLoading}
        />
      </div>
    </div>
  );
}