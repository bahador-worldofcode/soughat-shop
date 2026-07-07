// components/AuthSessionHandler.tsx
// --------------------------------------------------------------
// شبکهٔ ایمنی (Safety Net) برای احراز هویت OAuth.
//
// سناریو: اگر به هر دلیلی (مثلاً Site URL در Supabase اشتباه باشد
// یا آدرسِ callback در لیستِ Redirect URLs تأیید نشده باشد) گوگل
// کاربر را به ریشهٔ سایت با پارامتر ?code=... برگرداند، این
// کامپوننت کد را دریافت کرده، سِشن می‌سازد و کاربر را به
// صفحهٔ پروفایل هدایت می‌کند — به جای اینکه در صفحهٔ اصلی گیر کند.
//
// توجه: وقتی کاربر دقیقاً به صفحهٔ /auth/callback هدایت شود،
// آن صفحه خودش تبادل کد را انجام می‌دهد؛ در آن حالت این
// هندلر فعال نمی‌شود تا تبادل دوباره انجام نشود.
// --------------------------------------------------------------

'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function AuthSessionHandler() {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const pathname = url.pathname;

    // اگر دقیقاً روی صفحهٔ callback هستیم، اجازه بده خودش کار را انجام دهد
    if (pathname.includes('/auth/callback')) return;

    const hasCode = url.searchParams.has('code');
    const hasToken =
      url.hash.includes('access_token') || url.hash.includes('error');

    if (!hasCode && !hasToken) return;

    // کد / توکن در URL هست اما روی صفحهٔ callback نیستیم → تبادل کن
    supabaseBrowser.auth
      .exchangeCodeForSession(window.location.href)
      .then(({ error }) => {
        if (error) {
          console.error('Auth session exchange error:', error.message);
        }
        // هدایت به صفحهٔ پروفایل (استفاده از useRouter نکست-اینتل
        // خودش زبان را به آدرس اضافه می‌کند)
        router.replace('/profile');
      });
  }, [locale, router]);

  return null;
}
