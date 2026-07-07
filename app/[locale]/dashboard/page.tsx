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

// ساختارِ ردیفِ جدول public.profiles
type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      // ۱) ابتدا چک می‌کنیم کاربر لاگین کرده یا نه
      const { data: authData, error: authError } =
        await supabaseBrowser.auth.getUser();

      if (authError || !authData.user) {
        router.replace('/login');
        return;
      }

      // ۲) داده‌های پروفایل را از جدول public.profiles می‌خوانیم
      //    (این جدول توسط تریگر هنگام ثبت‌نام با گوگل پر می‌شود)
      const { data: profileData, error: profileError } = await supabaseBrowser
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError.message);
        // اگر ردیف پروفایل هنوز ساخته نشده بود، حداقل ایمیلِ auth را نمایش بده
        setProfile({
          id: authData.user.id,
          email: authData.user.email ?? null,
          full_name: null,
          avatar_url: null,
          created_at: '',
        });
      } else {
        setProfile(profileData as Profile);
      }

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

  // مقادیر نمایشی (از جدول profiles)
  const displayName = profile?.full_name || '';
  const displayEmail = profile?.email || '';
  const avatar = profile?.avatar_url || '';
  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')
    : '—';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-vazir)]">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
        <div className="flex justify-center mb-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={displayName || displayEmail}
              className="h-16 w-16 rounded-full object-cover border-2 border-blue-100"
            />
          ) : (
            <UserCircle2 className="h-16 w-16 text-blue-600" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{t('welcome')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('welcome_subtitle')}</p>

        <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-4 text-left space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">{t('logged_in_as')}</p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {displayName ? `${displayName} (${displayEmail})` : displayEmail}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">{t('member_since')}</p>
            <p className="text-sm font-semibold text-gray-800">{joinedAt}</p>
          </div>
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
