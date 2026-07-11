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
//
// تغییرِ جدید (رفعِ باگِ «سشنِ زامبی»): getSession() فقط چیزی را که
// در کوکی ذخیره شده می‌خواند و هیچ‌وقت واقعاً از سرورِ Supabase
// نمی‌پرسد «آیا این کاربر هنوز وجود دارد؟». اگر کاربری از پنل ادمین
// (Authentication → Users) حذف شود، مرورگرِ او همچنان یک توکنِ
// محلیِ «به‌ظاهر معتبر» نگه می‌دارد و آیکون پروفایل در هدر تا ابد
// «واردشده» نشان داده می‌شود، حتی بعد از رفرش کردن صفحه.
//
// برای همین، بعد از نمایشِ خوش‌بینانه (Optimistic) و فوریِ وضعیت از
// روی کوکی، همان لحظه در پس‌زمینه با getUser() این وضعیت را واقعاً
// با سرور اعتبارسنجی می‌کنیم. اگر کاربر دیگر معتبر نبود، سشنِ محلی
// را کامل پاک می‌کنیم (signOut) و آیکون هدر بلافاصله به حالتِ
// «واردنشده» برمی‌گردد.
//
// نکتهٔ فنی: این منطق عمداً به‌صورت async/await نوشته شده (نه با
// زنجیره‌ی .then)، چون در برخی نسخه‌های TypeScript، مقصدگذاریِ
// (destructuring) پارامترهای callback داخل .then() روی توابعِ
// overloadِ سوپابیس (مثل getUser) باعث خطای implicit-any می‌شود.

'use client';

import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabaseBrowser, legacySessionReady } from '@/lib/supabase-browser';

export function useAuthState(): boolean {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuthState = async () => {
      // وضعیت فعلی سشن را چک کن — اما اول صبر کن مهاجرتِ خاموش (اگر
      // در حال انجام است) تمام شود.
      await legacySessionReady;

      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      if (!isMounted) return;

      // نمایشِ فوری و خوش‌بینانه بر اساس همان چیزی که در کوکی ذخیره شده
      setIsAuthed(!!sessionData.session);

      // اگر سشنی وجود داشت، همین حالا در پس‌زمینه با سرورِ Supabase
      // اعتبارسنجیِ واقعی انجام بده. اگر کاربر حذف/غیرفعال شده
      // باشد، اینجا فهمیده می‌شود و سشنِ محلی پاک می‌شود.
      if (sessionData.session) {
        const { data: userData, error } = await supabaseBrowser.auth.getUser();
        if (!isMounted) return;

        if (error || !userData.user) {
          await supabaseBrowser.auth.signOut();
          if (isMounted) setIsAuthed(false);
        }
      }
    };

    checkAuthState();

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