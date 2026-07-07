// lib/useAuthState.ts
// هوک سبک برای تشخیص اینکه آیا کاربر وارد سیستم شده یا خیر.
// supabase-js نشست را در localStorage با کلیدی به فرم
//   sb-<project-ref>-auth-token
// ذخیره می‌کند؛ پس حضورِ چنین کلیدی یعنی کاربر لاگین کرده است.
// این کار باعث می‌شود بدون درخواست اضافی به سرور، آیکون پروفایل
// فقط برای کاربران واردشده نمایش داده شود.

'use client';

import { useEffect, useState } from 'react';

const SESSION_KEY_TEST = (key: string) =>
  key.startsWith('sb-') && key.endsWith('-auth-token');

export function useAuthState(): boolean {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    try {
      const check = () =>
        Object.keys(localStorage).some((k) => SESSION_KEY_TEST(k));
      setIsAuthed(check());

      const onStorage = () => setIsAuthed(check());
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    } catch {
      return;
    }
  }, []);

  return isAuthed;
}