// lib/authMigration.ts
// --------------------------------------------------------------
// ابزار مهاجرت خاموش (Silent Migration).
//
// قبل از رفعِ باگِ PKCE، سشنِ کاربرانِ لاگین‌شده در localStorage
// مرورگرشان ذخیره می‌شد. از آن به بعد supabaseBrowser سشن را در
// کوکی نگه می‌دارد. یعنی کاربرانی که قبل از این تغییر لاگین کرده
// بودند، با اینکه واقعاً هنوز یک refresh_token معتبر دارند، چون
// کوکی‌شان خالی است، به‌اشتباه «خارج‌شده» دیده می‌شوند.
//
// این فایل، آن refresh_token قدیمی را از localStorage می‌خواند،
// آن را نزدِ Supabase تعویض می‌کند (که نتیجه‌اش خودکار در کوکیِ
// جدید ذخیره می‌شود)، و در پایان — چه موفق چه ناموفق — کلید
// قدیمی را از localStorage پاک می‌کند تا:
//   ۱) این مسیر فقط یک‌بار برای هر کاربر اجرا شود،
//   ۲) هیچ‌وقت خطای خامی به کاربر نشان داده نشود.
// --------------------------------------------------------------

import type { SupabaseClient } from '@supabase/supabase-js';

function getLegacyStorageKey(): string | null {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return null;
    // مثال: https://abcdefgh.supabase.co -> abcdefgh
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    if (!projectRef) return null;
    // این همان کلیدِ پیش‌فرضی است که نسخه‌ی قبلیِ پروژه (که با
    // createClient خامِ @supabase/supabase-js و ذخیره‌سازیِ
    // localStorage ساخته شده بود) برای نگهداریِ سشن استفاده می‌کرد.
    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

/**
 * تلاش می‌کند سشنِ قدیمیِ localStorage را (اگر وجود داشته باشد) به
 * کوکیِ جدید مهاجرت دهد. هیچ‌وقت throw نمی‌کند — همیشه false/true
 * برمی‌گرداند.
 *
 * @param supabase همان کلاینتِ supabaseBrowser (تزریق می‌شود تا این
 *   فایل به lib/supabase-browser.ts وابسته نباشد و import چرخه‌ای
 *   پیش نیاید)
 * @returns true اگر مهاجرتی واقعاً انجام و موفق شد
 */
export async function migrateLegacyLocalStorageSession(
  supabase: SupabaseClient
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const legacyKey = getLegacyStorageKey();
  if (!legacyKey) return false;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(legacyKey);
  } catch {
    // localStorage در دسترس نیست (حالت خصوصیِ مرورگر، تنظیمات
    // امنیتی، و ...) — بی‌خطر، یعنی کاربر کوکی‌محور است.
    return false;
  }

  if (!raw) return false; // کاربر جدید است یا قبلاً مهاجرت انجام شده

  let migrated = false;

  try {
    const parsed = JSON.parse(raw);
    const refreshToken: string | undefined =
      parsed?.refresh_token ?? parsed?.currentSession?.refresh_token;

    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      migrated = !error && !!data?.session;
    }
  } catch {
    migrated = false;
  }

  // مهم: در هر صورت (موفق یا ناموفق) کلید قدیمی را پاک کن — چه
  // برای اینکه این مسیر دوباره اجرا نشود، چه برای اینکه اگر
  // refresh_token دیگر معتبر نیست، دیگر جایی نماند که کاربر را
  // سردرگم کند.
  try {
    window.localStorage.removeItem(legacyKey);
  } catch {
    // بی‌خطر
  }

  return migrated;
}