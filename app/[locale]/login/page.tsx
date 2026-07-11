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
//
// تسک ۱۵ (EMAIL_PASSWORD_AUTH_SETUP.md): اضافه شدنِ state انتخاب
// حالت (ورود/ثبت‌نام) و دو تب کوچیک بالای فرم ایمیل. متن تب‌ها از
// namespace ترجمه‌ی Auth می‌آید (کلیدهای login_tab/signup_tab در
// messages/fa.json و messages/en.json).
//
// تسک ۱۶: فیلدهای فرم ایمیل/رمز عبور (ایمیل، رمز عبور، و در حالت
// ثبت‌نام: نام کامل + تکرار رمز عبور) اضافه شد. توابع ثبت‌نام/ورود
// و دکمه‌ی ارسال در تسک‌های ۱۷ و ۱۸ اضافه می‌شن.
//
// تسک ۱۷: تابع `handleEmailSignUp` اضافه شد (ثبت‌نام با ایمیل/رمز
// عبور از طریق Supabase). هنوز به هیچ دکمه‌ای وصل نشده — تسک ۱۸
// تابع ورود رو اضافه می‌کنه و بعدش دکمه‌ی ارسال وصل می‌شه.
//
// تسک ۱۸: تابع `handleEmailLogin` اضافه شد (ورود با ایمیل/رمز عبور).
// اگه خطا «ایمیل تاییدنشده» باشه، دکمه‌ی ارسال دوباره (تسک ۱۹) نشون
// داده می‌شه. هنوز هیچ‌کدوم از این دو تابع به دکمه‌ای وصل نیستن.
//
// تسک ۱۹: تابع `handleResendConfirmation` + دکمه‌ی «ارسال دوباره‌ی
// ایمیل تایید» اضافه شد؛ این دکمه فقط وقتی `showResendButton` تروئه
// نشون داده می‌شه (زیر باکس پیام خطا).
//
// تسک ۲۰: یک خط جداکننده‌ی ساده («یا») بین دکمه‌ی گوگل و تب‌های
// فرم ایمیل اضافه شد تا UI شلوغ به نظر نرسه.
//
// تسک ۲۱: بعد از ثبت‌نام موفق (signupSuccess === true)، دکمه‌ی
// گوگل + جداکننده + تب‌ها + فیلدها همه مخفی می‌شن و فقط پیام
// «ایمیلت رو چک کن» نشون داده می‌شه.
//
// تسک اضافه (جا افتاده در سند اصلی): دکمه‌ی ارسال فرم ایمیل اضافه
// شد؛ بسته به `mode`، یا handleEmailSignUp یا handleEmailLogin رو
// صدا می‌زنه. بدون این دکمه فرم قابل ارسال نبود.
//
// تسک ۲۲ (فاز ۵): لینک «رمز عبور رو فراموش کردی؟» اضافه شد، فقط
// زیر فرم ورود (نه ثبت‌نام) — به مسیر /[locale]/forgot-password
// می‌ره که در تسک ۲۳ ساخته می‌شه.
// --------------------------------------------------------------

'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import { supabaseBrowser, legacySessionReady } from '@/lib/supabase-browser';
import { Loader2, AlertCircle, UserRound } from 'lucide-react';

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

  // تسک ۱۵: حالت فرم ایمیل — 'login' یا 'signup' (پیش‌فرض: ورود)
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // تسک ۱۶: فیلدهای فرم ایمیل/رمز عبور
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // فقط در حالت ثبت‌نام
  const [confirmPassword, setConfirmPassword] = useState(''); // فقط در حالت ثبت‌نام

  // تسک ۱۷: بعد از ثبت‌نام موفق، true می‌شه تا پیام «ایمیلت رو چک کن» نشون داده بشه
  const [signupSuccess, setSignupSuccess] = useState(false);

  // تسک ۱۸: وقتی ورود به‌خاطر «ایمیل تاییدنشده» رد بشه، true می‌شه تا
  // دکمه‌ی «دوباره ارسال ایمیل تایید» نشون داده بشه
  const [showResendButton, setShowResendButton] = useState(false);

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

  // تسک ۱۷: ثبت‌نام با ایمیل/رمز عبور
  const handleEmailSignUp = async () => {
    if (password !== confirmPassword) {
      setErrorMsg(t('passwords_do_not_match'));
      return;
    }
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSignupSuccess(true); // پیام «ایمیلت رو چک کن» نشون بده (تسک ۲۱)
    }
  };

  // تسک ۱۸: ورود با ایمیل/رمز عبور
  const handleEmailLogin = async () => {
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setErrorMsg(t('email_not_confirmed'));
        setShowResendButton(true); // دکمه‌ی «دوباره ارسال ایمیل تایید» رو نشون بده (تسک ۱۹)
      } else {
        setErrorMsg(t('invalid_credentials'));
      }
    } else {
      router.replace('/profile');
    }
  };

  // تسک ۱۹: ارسال دوباره‌ی ایمیل تایید (وقتی کاربر قبل از تایید ایمیل تلاش به ورود کرده)
  const handleResendConfirmation = async () => {
    await supabaseBrowser.auth.resend({ type: 'signup', email });
    setErrorMsg(t('confirmation_resent'));
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
          {/*
            رفع باگ (کشف‌شده حین تست فاز ۱، بعد از تسک ۳۶): قبلاً همیشه
            لوگوی گوگل بالای فرم نشون داده می‌شد، حتی برای کاربری که
            می‌خواد با ایمیل/رمز عبور ثبت‌نام کنه — که گیج‌کننده بود.
            الان یک آیکون خنثی (نه مخصوص گوگل) اینجا نشون داده می‌شه؛
            لوگوی گوگل فقط داخل خودِ دکمه‌ی «ادامه با گوگل» می‌مونه.
          */}
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <UserRound className="h-6 w-6 text-blue-600" />
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

        {/* تسک ۱۹: فقط وقتی ورود به‌خاطر «ایمیل تاییدنشده» رد بشه نشون داده می‌شه */}
        {showResendButton && (
          <button
            type="button"
            onClick={handleResendConfirmation}
            className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            {t('resend_confirmation_button')}
          </button>
        )}

        {/* تسک ۲۱: بعد از ثبت‌نام موفق، کل فرم مخفی می‌شه و فقط پیام «ایمیلت رو چک کن» نشون داده می‌شه */}
        {signupSuccess ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-center text-sm">
            {t('check_your_email_message')}
          </div>
        ) : (
          <>
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

            {/* تسک ۲۰: خط جداکننده‌ی ساده بین دکمه‌ی گوگل و فرم ایمیل */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400 uppercase">{t('or_divider')}</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/*
              تسک ۱۵: دو تب سوییچ بین «ورود» و «ثبت‌نام»، دقیقاً بالای
              محل فرم ایمیل/رمز عبور.
            */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('login')}
                aria-pressed={mode === 'login'}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                  mode === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('login_tab')}
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                aria-pressed={mode === 'signup'}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                  mode === 'signup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('signup_tab')}
              </button>
            </div>

            {/*
              تسک ۱۶: فیلدهای فرم ایمیل/رمز عبور. ایمیل و رمز عبور همیشه
              نشون داده می‌شن؛ نام کامل و تکرار رمز فقط در حالت ثبت‌نام.
            */}
            <div className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('full_name_label')}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email_label')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('password_label')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('confirm_password_label')}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/*
                تسک اضافه (جا افتاده در سند اصلی): دکمه‌ی ارسال فرم
                ایمیل — بسته به `mode`، تابع ثبت‌نام یا ورود رو صدا
                می‌زنه. بدون این دکمه، فیلدهای بالا قابل ارسال نبودن.
              */}
              <button
                type="button"
                onClick={mode === 'signup' ? handleEmailSignUp : handleEmailLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {mode === 'signup' ? t('signup_button') : t('login_with_email_button')}
              </button>

              {/* تسک ۲۲: لینک فراموشی رمز — فقط زیر فرم ورود (نه ثبت‌نام) نشون داده می‌شه */}
              {mode === 'login' && (
                <Link
                  href="/forgot-password"
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {t('forgot_password_link')}
                </Link>
              )}
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-400 leading-relaxed">
          {t('terms_note')}
        </p>
      </div>
    </div>
  );
}