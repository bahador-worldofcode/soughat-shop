// app/[locale]/auth/callback/page.tsx
// --------------------------------------------------------------
// این صفحه مقصدِ بازگشت از گوگل (Redirect URI) است.
// وقتی کاربر در گوگل تأیید می‌کند، گوگل او را به
//   /fa/auth/callback?code=XXXX   (یا /en/auth/callback?code=XXXX)
// هدایت می‌کند. این کامپوننت کد را می‌گیرد، توکن می‌سازد
// و کاربر را به صفحهٔ پروفایل هدایت می‌کند.
// --------------------------------------------------------------

'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const locale = useLocale();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // window.location.href شامل ?code=... است که گوگل فرستاده
      const { error } = await supabaseBrowser.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error('Auth callback error:', error.message);
        setErrorMsg(error.message);
        return;
      }

      // ورود موفق — هدایت به صفحهٔ پروفایل کاربر.
      // useRouter از next-intl خودش زبان را به آدرس اضافه می‌کند:
      // مثلاً '/profile' را به '/fa/profile' تبدیل می‌کند.
      router.replace('/profile');
    };

    handleCallback();
  }, [locale, router]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-vazir)]">
        <div className="max-w-md w-full bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Login failed</p>
            <p className="text-sm break-words">{errorMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 font-[family-name:var(--font-vazir)]">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-sm text-gray-500">Signing you in…</p>
    </div>
  );
}
