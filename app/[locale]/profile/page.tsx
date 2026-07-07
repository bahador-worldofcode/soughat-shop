// app/[locale]/profile/page.tsx
// --------------------------------------------------------------
// صفحهٔ پروفایل کاربری (Customer Profile)
// جایگزینِ placeholder داشبورد قبلی. کاربر وارد شده می‌تواند
// نام و عکس پروفایل خود را مشاهده و ویرایش کند. ایمیل (متصل به
// گوگل) فقط خواندنی است.
// --------------------------------------------------------------

'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Toast from '@/components/Toast';
import {
  Loader2,
  User as UserIcon,
  AlertCircle,
  UserCircle2,
  LogOut,
} from 'lucide-react';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const tAuth = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setLoadError(false);

      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session?.user) {
        setNotLoggedIn(true);
        setLoading(false);
        return;
      }

      const { data, error } = await (supabaseBrowser.from('profiles') as any)
        .select('id, email, full_name, avatar_url, created_at')
        .eq('id', session.user.id)
        .single();

      if (error || !data) {
        setLoadError(true);
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
      setFullName(data.full_name ?? '');
      setAvatarUrl(data.avatar_url ?? '');
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await (supabaseBrowser.from('profiles') as any)
      .update({
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      .eq('id', profile.id);

    setSaving(false);

    if (error) {
      setToast({ show: true, message: error.message });
      return;
    }

    setProfile((prev) =>
      prev
        ? { ...prev, full_name: fullName.trim() || null, avatar_url: avatarUrl.trim() || null }
        : prev
    );
    setToast({ show: true, message: `${t('saved_title')} — ${t('saved_desc')}` });
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.replace('/login');
  };

  const formatMemberSince = (iso: string) => {
    try {
      const loc = locale === 'fa' ? 'fa-IR' : 'en-US';
      return new Intl.DateTimeFormat(loc, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  // ── وضعیت بارگذاری ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 font-[family-name:var(--font-vazir)]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>
    );
  }

  // ── کاربر وارد نشده ──────────────────────────────────────────
  if (notLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-vazir)]">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <UserCircle2 className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('not_logged_in')}</h1>
          <p className="text-sm text-gray-500 mb-6">{t('not_logged_in_desc')}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            {t('login')}
          </button>
        </div>
      </div>
    );
  }

  // ── خطای بارگذاری ────────────────────────────────────────────
  if (loadError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-vazir)]">
        <div className="max-w-md w-full bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">{t('load_error')}</p>
          </div>
        </div>
      </div>
    );
  }

  const avatarSrc = avatarUrl.trim() || profile.avatar_url;
  const displayName = fullName.trim() || profile.email || 'User';

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-vazir)]">
      <Toast
        message={toast.message}
        show={toast.show}
        onDone={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* هدر */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>

        {/* کارت پروفایل */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* آواتار */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-200 flex items-center justify-center">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt={t('avatar')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-gray-400">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">{displayName}</p>
              {profile.created_at && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('member_since')} {formatMemberSince(profile.created_at)}
                </p>
              )}
            </div>
          </div>

          {/* فرم */}
          <div className="space-y-5">
            {/* نام کامل */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('full_name')}
              </label>
              <div className="relative">
                <UserIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('full_name_ph')}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900"
                />
              </div>
            </div>

            {/* آدرس عکس پروفایل */}
            <div>
              <label
                htmlFor="avatar_url"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('avatar')}
              </label>
              <input
                id="avatar_url"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900"
              />
            </div>

            {/* ایمیل (فقط خواندنی) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={profile.email ?? ''}
                readOnly
                disabled
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1.5">{t('email_readonly')}</p>
            </div>

            {/* دکمه ذخیره */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </button>

            {/* دکمه خروج از حساب */}
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-4 rounded-xl transition-all"
            >
              <LogOut className="h-4 w-4" />
              {tAuth('logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
