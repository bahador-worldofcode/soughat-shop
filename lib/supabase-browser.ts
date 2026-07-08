// lib/supabase-browser.ts
// --------------------------------------------------------------
// این کلاینتِ مخصوصِ مرورگر (Browser Client) برای احراز هویت
// (Sign Up / Log In با گوگل) استفاده می‌شود.
// در کامپوننت‌های سمت کلاینت ('use client') باید حتماً از این
// فایل استفاده کنید — نه از lib/supabase.ts که برای سرور است.
//
// تغییر مهم نسبت به نسخهٔ قبلی: به‌جای createClient خامِ
// @supabase/supabase-js (که کد تایید PKCE را در localStorage
// ذخیره می‌کرد)، اینجا از createBrowserClient در @supabase/ssr
// استفاده می‌کنیم. این کلاینت وریفایر PKCE و توکن‌های سشن را در
// کوکی‌های خودِ دامنه ذخیره می‌کند، نه در localStorage.
//
// چرا این تغییر خطای
//   "PKCE code verifier not found in storage"
// را حل می‌کند: تبادل نهاییِ کد حالا در سمت سرور
// (app/[locale]/auth/callback/route.ts) با همین کوکی‌ها انجام
// می‌شود، درست در همان درخواستِ HTTP که مرورگر خودش کوکی‌ها را
// می‌فرستد — بدون وابستگی به اینکه آیا افزونه‌ای، حالت خصوصی
// مرورگر، یا ری‌رندرِ زودهنگامِ React، localStorage را قبل از
// رسیدن به آن دست‌نخورده نگه داشته یا نه.
// --------------------------------------------------------------

'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// جلوگیری از ساختِ چندین کلاینت در حین Hot-Reload در زمانِ توسعه
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

function getBrowserClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      // PKCE: همچنان همان روش امنِ قبلی است، فقط محل ذخیره‌سازیِ
      // وریفایر عوض شده (کوکی به‌جای localStorage).
      flowType: 'pkce',
      // مهم: همچنان false. تبادلِ کد حالا در Route Handler سمتِ
      // سرور (auth/callback/route.ts) انجام می‌شود، قبل از اینکه
      // اصلاً جاوااسکریپتِ کلاینت اجرا شود. اگر این گزینه true
      // باشد، کلاینت مرورگر هم هم‌زمان سعی می‌کند همان کد را
      // مصرف کند؛ چون هر کد فقط یک‌بار قابل استفاده است، همین
      // هم‌زمانی دقیقاً همان خطای قبلی را دوباره ایجاد می‌کرد.
      detectSessionInUrl: false,
      // ذخیرهٔ سِشن در مرورگر کاربر (تا صفحه را ببندد و باز کند باز هم لاگین بماند)
      persistSession: true,
      // تمدید خودکار توکن قبل از منقضی شدن
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

export const supabaseBrowser = getBrowserClient();