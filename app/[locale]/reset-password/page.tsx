// app/[locale]/reset-password/page.tsx
// --------------------------------------------------------------
// صفحه‌ی «تنظیم رمز عبور جدید» (تسک ۲۵، EMAIL_PASSWORD_AUTH_SETUP.md)
//
// کاربر به این صفحه فقط از یک مسیر مشخص می‌رسد: کلیک روی لینکِ
// داخل ایمیلِ بازیابیِ رمز (app/[locale]/forgot-password/page.tsx،
// تسک ۲۳) → app/[locale]/auth/callback/route.ts (تسک ۲۴، با
// ?next=/reset-password) → همین صفحه. آن مسیر یک سشنِ موقتِ
// بازیابیِ رمز برای کاربر می‌سازد که فقط اجازه‌ی صدا زدنِ
// updateUser({ password }) را می‌دهد.
//
// اگر کسی مستقیم و بدون آمدن از آن مسیر (یعنی بدون سشنِ معتبر) این
// آدرس را باز کند، به صفحه‌ی لاگین برگردانده می‌شود — دقیقاً همان
// چیزی که در سند خواسته شده بود.
// --------------------------------------------------------------

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Loader2, AlertCircle, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const t = useTranslations('Auth');
  const router = useRouter();

  // تا وقتی سشن رو چک می‌کنیم، فرم رو نشون نده (از فلش نادرستِ فرم
  // به کاربرهایی که سشن معتبر ندارن جلوگیری می‌کنه)
  const [checking, setChecking] = useState(true);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // اگه کاربر مستقیم و بدون سشن معتبر اومده اینجا، برگردون لاگین
    const checkSession = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data.session) {
        router.replace('/login');
      } else {
        setChecking(false);
      }
    };
    checkSession();
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setErrorMsg(t('passwords_do_not_match'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { error } = await supabaseBrowser.auth.updateUser({ password: newPassword });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.replace('/profile');
    }
  };

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
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('reset_password_title')}</h2>
          <p className="mt-2 text-sm text-gray-500">{t('reset_password_subtitle')}</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm break-words">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t('new_password_label')}
            </label>
            <input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t('confirm_new_password_label')}
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {t('update_password_button')}
          </button>
        </form>
      </div>
    </div>
  );
}