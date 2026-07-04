'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Eye, Smartphone, Monitor, Tablet, Loader2, AlertTriangle, RefreshCw, Radio } from 'lucide-react';

type DeviceStat = { device: string; users: number };

type AnalyticsData = {
  totalUsers: number;
  pageViews: number;
  devices: DeviceStat[];
  activeUsersNow: number;
  period: string;
};

// آیکون مناسب برای هر نوع دستگاه
function deviceIcon(device: string) {
  const d = device.toLowerCase();
  if (d === 'mobile') return <Smartphone className="h-5 w-5" />;
  if (d === 'tablet') return <Tablet className="h-5 w-5" />;
  return <Monitor className="h-5 w-5" />;
}

// نام فارسی مناسب برای هر نوع دستگاه
function deviceLabel(device: string) {
  const d = device.toLowerCase();
  if (d === 'mobile') return 'موبایل';
  if (d === 'tablet') return 'تبلت';
  if (d === 'desktop') return 'دسکتاپ';
  return device;
}

// هر چند ثانیه یک‌بار عدد «آنلاین الان» به‌صورت خودکار به‌روزرسانی شود
const REALTIME_REFRESH_MS = 30000;

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAnalytics = async (showFullLoading = true) => {
    if (showFullLoading) setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'خطا در دریافت اطلاعات');
      }

      setData(json);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت اطلاعات گوگل آنالیتیکس');
    } finally {
      if (showFullLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true);

    // آپدیت خودکار در پس‌زمینه (بدون نمایش لودینگ کامل صفحه) برای حس «لحظه‌ای»
    intervalRef.current = setInterval(() => fetchAnalytics(false), REALTIME_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const totalDeviceUsers = data?.devices.reduce((sum, d) => sum + d.users, 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">آمار گوگل آنالیتیکس</h2>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `آمار ${data.period}` : 'نگاه کلی به بازدیدکنندگان سایت'}
          </p>
        </div>
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={loading}
          className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          به‌روزرسانی
        </button>
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500 text-sm">در حال دریافت آمار از گوگل آنالیتیکس...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-700 font-bold text-sm">دریافت اطلاعات با خطا مواجه شد</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* کارت ویژه: کاربران آنلاین همین الان */}
          <div className="bg-gradient-to-l from-emerald-600 to-emerald-500 p-6 rounded-2xl shadow-sm flex items-center justify-between text-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span className="text-sm font-medium text-emerald-50">آنلاین همین الان</span>
              </div>
              <h3 className="text-4xl font-bold mt-2">{data.activeUsersNow.toLocaleString('fa-IR')}</h3>
              <span className="text-xs text-emerald-100">نفر در ۳۰ دقیقه‌ی اخیر فعال بوده‌اند</span>
            </div>
            <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Radio className="h-7 w-7" />
            </div>
          </div>

          {/* کارت‌های آمار کلی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-gray-500 text-sm font-medium">تعداد کل کاربران</span>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {data.totalUsers.toLocaleString('fa-IR')}
                </h3>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-gray-500 text-sm font-medium">تعداد بازدید صفحات</span>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {data.pageViews.toLocaleString('fa-IR')}
                </h3>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* تفکیک بر اساس دستگاه */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-800 font-bold mb-5">کاربران به تفکیک دستگاه</h3>

            {data.devices.length === 0 && (
              <p className="text-sm text-gray-400">داده‌ای برای نمایش وجود ندارد.</p>
            )}

            <div className="space-y-4">
              {data.devices.map((d) => {
                const percent = totalDeviceUsers > 0 ? Math.round((d.users / totalDeviceUsers) * 100) : 0;
                return (
                  <div key={d.device}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                        <span className="text-blue-600">{deviceIcon(d.device)}</span>
                        {deviceLabel(d.device)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {d.users.toLocaleString('fa-IR')} کاربر ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}