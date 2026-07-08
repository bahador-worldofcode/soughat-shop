// app/[locale]/login/page.tsx
// --------------------------------------------------------------
// صفحهٔ ورود / ثبت‌نام (Sign Up / Log In)
// شامل یک دکمهٔ تمیز «ادامه با گوگل» (Continue with Google)
//
// تغییر نسبت به نسخهٔ قبلی: چون تبادلِ کد حالا در
// app/[locale]/auth/callback/route.ts (سمتِ سرور) انجام می‌شود،
// در صورتِ خطا، آن Route Handler کاربر را با
// /login?error=... به همین صفحه برمی‌گرداند. این صفحه حالا آن
// پارامتر را می‌خواند و پیام خطا را نشان می‌دهد.
// --------------------------------------------------------------

'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { supabaseBrowser, legacySessionReady } from '@/lib/supabase-browser';
import { Loader2, AlertCircle } from 'lucide-react';

// آیکون رسمی گوگل (G) — بدون وابستگی به فایل خارجی
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const router = useRouter();

  const [loading, setLoading] = useState(false); // هنگام کلیک روی دکمه
  const [checking, setChecking] = useState(true); // بررسی اولیهٔ سِشن
  const [errorMsg, setErrorMsg] = useState(''); // خطای برگشتی از auth/callback/route.ts

  // اگر آدرس شامل ?error=... بود (یعنی Route Handlerِ callback با خطا
  // برگشت داده)، آن را از URL بخوان و نشان بده.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setErrorMsg(
        err === 'missing_code'
          ? t('missing_code_error') || 'Login was cancelled or the code was missing.'
          : err
      );
      // پارامتر را از نوارِ آدرس پاک کن تا با رفرش دوباره نمایش داده نشود
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [t]);

  // اگر کاربر قبلاً لاگین بود، مستقیم ببرش پروفایل
  useEffect(() => {
    const checkSession = async () => {
      // صبر کن مهاجرتِ خاموشِ سشنِ قدیمی (اگر وجود داشته باشد) تمام شود
      await legacySessionReady;
      const { data } = await supabaseBrowser.auth.getSession();
      if (data.session) {
        router.replace('/profile');
      } else {
        setChecking(false);
      }
    };
    checkSession();
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    // آدرسی که گوگل پس از تأیید کاربر به آن برمی‌گرداند.
    // حتماً زبان (locale) را هم می‌چسبانیم تا کاربر در همان زبان بماند.
    const redirectTo = `${window.location.origin}/${locale}/auth/callback`;

    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        // صفحهٔ پروفایل گوگل را برای انتخاب حساب نشان بده
        // (حتی اگر کاربر قبلاً یک حساب را انتخاب کرده باشد)
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) {
      console.error('Google login error:', error.message);
      setErrorMsg(error.message);
      setLoading(false);
    }
    // در صورت موفقیت، مرورگر خودبه‌خود به گوگل هدایت می‌شود
    // و ما دیگر نیازی به تغییر مسیر دستی نداریم.
  };

  // تا وقتی چک می‌کنیم کاربر لاگین هست یا نه، فقط اسپینر نشان بده
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-vazir)]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-300">
        <div className="text-center flex flex-col items-center">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <GoogleIcon />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('title')}</h2>
          <p className="mt-2 text-sm text-gray-500">{t('subtitle')}</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Login failed</p>
              <p className="text-sm break-words">{errorMsg}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
          ) : (
            <GoogleIcon />
          )}
          {loading ? t('signing_in') : t('google_button')}
        </button>

        <p className="text-center text-xs text-gray-400 leading-relaxed">
          {t('terms_note')}
        </p>
      </div>
    </div>
  );
}