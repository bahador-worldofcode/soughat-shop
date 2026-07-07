// lib/useAuthState.ts
// هوک سبک برای تشخیص اینکه آیا کاربر وارد سیستم شده یا خیر.
// به‌جای گوش‌دادن به رویداد storage (که فقط بین تب‌های مختلف کار
// می‌کند)، مستقیماً از onAuthStateChange خودِ سوپابیس استفاده
// می‌کنیم تا همان لحظه‌ای که لاگین/لاگ‌اوت در همین تب اتفاق می‌افتد
// هم آیکون هدر آپدیت شود.

'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export function useAuthState(): boolean {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // وضعیت فعلی سشن را همین اول چک کن
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (isMounted) setIsAuthed(!!data.session);
    });

    // و به هر تغییری در سشن (لاگین، لاگ‌اوت، تمدید توکن) گوش بده
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) setIsAuthed(!!session);
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return isAuthed;
}