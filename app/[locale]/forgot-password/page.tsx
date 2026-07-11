// app/[locale]/forgot-password/page.tsx
// --------------------------------------------------------------
// صفحه‌ی «فراموشی رمز عبور» (تسک ۲۳، EMAIL_PASSWORD_AUTH_SETUP.md)
//
// یک فرم ساده با فقط یک فیلد ایمیل: کاربر ایمیلش را وارد می‌کند،
// Supabase یک لینک بازیابی رمز به آن ایمیل می‌فرستد. آن لینک کاربر
// را به app/[locale]/auth/callback/route.ts می‌فرستد (با
// ?next=/reset-password که در تسک ۲۴ اضافه می‌شود) و از آنجا به
// app/[locale]/reset-password/page.tsx (تسک ۲۵) هدایت می‌شود تا
// رمز جدیدش را تنظیم کند.
//
// لینکِ ورود به این صفحه از قبل در app/[locale]/login/page.tsx
// (تسک ۲۲) اضافه شده بود؛ تا قبل از این تسک، آن لینک به صفحه‌ی ۴۰۴
// می‌رفت چون این مسیر هنوز وجود نداشت.
// --------------------------------------------------------------

'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Loader2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const isEn = locale === 'en';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/auth/callback?next=/reset-password`,
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSent(true); // پیام «لینک بازیابی برات فرستاده شد» نشون بده
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-vazir)]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-300">
        <div className="text-center flex flex-col items-center">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('forgot_password_title')}</h2>
          <p className="mt-2 text-sm text-gray-500">{t('forgot_password_subtitle')}</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm break-words">{errorMsg}</p>
          </div>
        )}

        {sent ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-center text-sm">
            {t('reset_link_sent_message')}
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email_label')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? t('reset_link_sending') : t('reset_link_button')}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          <ArrowRight className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />
          {t('back_to_login')}
        </Link>
      </div>
    </div>
  );
}