// lib/useAuthState.ts
// هوک سبک برای تشخیص اینکه آیا کاربر وارد سیستم شده یا خیر.
// به‌جای گوش‌دادن به رویداد storage (که فقط بین تب‌های مختلف کار
// می‌کند)، مستقیماً از onAuthStateChange خودِ سوپابیس استفاده
// می‌کنیم تا همان لحظه‌ای که لاگین/لاگ‌اوت در همین تب اتفاق می‌افتد
// هم آیکون هدر آپدیت شود.
//
// تغییر: قبل از اولین getSession()، صبر می‌کنیم مهاجرتِ خاموشِ
// سشنِ قدیمی (localStorage → کوکی) تمام شود، تا کاربرانی که تازه
// به سیستم جدید منتقل می‌شوند، برای یک لحظه به‌اشتباه به‌عنوان
// «خارج‌شده» در هدر نمایش داده نشوند.

'use client';

import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabaseBrowser, legacySessionReady } from '@/lib/supabase-browser';

export function useAuthState(): boolean {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // وضعیت فعلی سشن را چک کن — اما اول صبر کن مهاجرتِ خاموش (اگر
    // در حال انجام است) تمام شود.
    legacySessionReady.finally(() => {
      supabaseBrowser.auth.getSession().then(({ data }) => {
        if (isMounted) setIsAuthed(!!data.session);
      });
    });

    // و به هر تغییری در سشن (لاگین، لاگ‌اوت، تمدید توکن) گوش بده
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
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