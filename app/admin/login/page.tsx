'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, AlertCircle, TimerReset } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// --------------------------------------------------------------
// محافظِ بروت‌فورس (Brute-force / Rate Limit)
// --------------------------------------------------------------
// این بخش، مستقل از محدودیتِ داخلیِ خودِ Supabase Auth (که بر اساس
// IP کار می‌کنه)، هر ایمیل رو جدا محدود می‌کنه — یعنی حتی اگر
// مهاجم از چند IP یا VPN مختلف تلاش کنه، باز هم روی همین ایمیل
// قفل می‌مونه. منطق واقعیِ شمارش و قفل، سمتِ دیتابیسه (توابعِ
// check_login_lock / register_login_failure / register_login_success
// در سوپابیس) — نه اینجا در مرورگر — چون هر چیزی که فقط سمتِ
// کلاینت باشه، با یک درخواستِ مستقیم به API قابلِ دور زدنه.
//
// قانون: هر رمزِ اشتباه = ۱ دقیقه انتظار. اگر پشتِ سرِ هم زیاد
// اشتباه بزنه، این انتظار خودکار بیشتر می‌شه (بعد از ۵ بار: ۵
// دقیقه، بعد از ۱۰ بار: ۳۰ دقیقه) تا حدسِ خودکار و پشتِ سرهمِ رمز
// عملاً غیرممکن بشه.
// --------------------------------------------------------------

function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds} ثانیه`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} دقیقه و ${s} ثانیه` : `${m} دقیقه`;
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // لودینگ اولیه صفحه
  const [errorMsg, setErrorMsg] = useState('');
  const [lockSeconds, setLockSeconds] = useState(0); // >0 یعنی الان قفله
  const router = useRouter();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // بررسی وضعیت ورود به محض باز شدن صفحه
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // اگر کاربر قبلا لاگین بود، بفرستش داشبورد
        router.replace('/admin/dashboard');
      } else {
        // اگر لاگین نبود، فرم رو نشون بده
        setPageLoading(false);
      }
    };

    checkSession();
  }, [router]);

  // شمارشِ معکوسِ زمانِ قفل — هر ثانیه یکی کم می‌شه تا کاربر دقیقاً
  // بدونه چقدر باید صبر کنه (به‌جای یک پیامِ ثابت و مبهم)
  useEffect(() => {
    if (lockSeconds <= 0) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setLockSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [lockSeconds > 0]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const normalizedEmail = email.trim().toLowerCase();

    // ۱) قبل از هر تلاشی، از دیتابیس بپرس «الان این ایمیل قفله؟»
    const { data: lockCheck } = await supabase.rpc('check_login_lock', {
      p_email: normalizedEmail,
    });
    const lockRow = Array.isArray(lockCheck) ? lockCheck[0] : lockCheck;
    if (lockRow?.locked) {
      setLockSeconds(lockRow.retry_after_seconds || 60);
      setErrorMsg(`به‌خاطر تلاش‌های ناموفقِ قبلی، لطفاً ${formatWait(lockRow.retry_after_seconds || 60)} صبر کن و دوباره امتحان کن.`);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        console.log('Login successful:', data.user.email);
        // ورودِ موفق → شمارنده‌ی این ایمیل کاملاً پاک بشه
        await supabase.rpc('register_login_success', { p_email: normalizedEmail });
        router.push('/admin/dashboard');
      }

    } catch (error: any) {
      console.error('Login error:', error.message);

      // ۲) رمزِ اشتباه → یک تلاشِ ناموفقِ دیگه ثبت کن؛ خودِ دیتابیس
      // تصمیم می‌گیره الان چند ثانیه/دقیقه باید قفل بمونه
      const { data: failResult } = await supabase.rpc('register_login_failure', {
        p_email: normalizedEmail,
      });
      const failRow = Array.isArray(failResult) ? failResult[0] : failResult;
      const wait = failRow?.retry_after_seconds || 60;

      setLockSeconds(wait);
      setErrorMsg(`ایمیل یا رمز عبور اشتباه است. برای تلاشِ بعدی ${formatWait(wait)} صبر کن.`);
    } finally {
      setLoading(false);
    }
  };

  // تا وقتی داریم چک می‌کنیم کاربر لاگین هست یا نه، فقط یه اسپینر نشون بده
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const isLocked = lockSeconds > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-[family-name:var(--font-vazir)]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-300">

        <div className="text-center flex flex-col items-center">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <ShieldCheck className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            پنل فرماندهی
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            ورود ایمن به سیستم مدیریت سوغات شاپ
          </p>
        </div>

        {errorMsg && (
          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 border ${isLocked ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {isLocked ? <TimerReset className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>
              {errorMsg}
              {isLocked && <> (<span className="font-bold">{formatWait(lockSeconds)}</span> باقی‌مانده)</>}
            </span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                ایمیل سازمانی
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLocked}
                className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="admin@soughat.shop"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLocked}
                className="block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isLocked}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-bold rounded-lg text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    در حال ورود...
                  </>
              ) : isLocked ? (
                  <>
                    <TimerReset className="-ml-1 mr-2 h-5 w-5 text-white" />
                    {formatWait(lockSeconds)} صبر کن
                  </>
              ) : 'ورود به پنل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}