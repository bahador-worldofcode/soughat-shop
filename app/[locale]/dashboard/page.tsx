// app/[locale]/dashboard/page.tsx
// --------------------------------------------------------------
// صفحهٔ پیش‌فرض (Placeholder) پنل کاربری مشتری.
// فعلاً فقط نشان می‌دهد که ورود موفق بوده و ایمیل کاربر
// را نمایش می‌دهد. ساخت کامل «داشبورد مشتری» در فاز بعدی انجام می‌شود.
// --------------------------------------------------------------

'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Loader2, LogOut, UserCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabaseBrowser.auth.getUser();

      // اگر کاربر وارد نشده بود، برگردانش به صفحهٔ ورود
      if (error || !data.user) {
        router.replace('/login');
        return;
      }

      setEmail(data.user.email || '');
      setName(
        (data.user.user_metadata?.full_name as string) ||
          (data.user.user_metadata?.name as string) ||
          ''
      );
      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-vazir)]">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
        <div className="flex justify-center mb-4">
          <UserCircle2 className="h-16 w-16 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{t('welcome')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('welcome_subtitle')}</p>

        <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-4 text-left">
          <p className="text-xs text-gray-400 mb-1">{t('logged_in_as')}</p>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {name ? `${name} (${email})` : email}
          </p>
        </div>

        <p className="mt-6 text-xs text-gray-400">{t('dashboard_placeholder')}</p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-4 rounded-xl transition-all"
        >
          <LogOut className="h-5 w-5" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}