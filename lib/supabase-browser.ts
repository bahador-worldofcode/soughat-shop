// lib/supabase-browser.ts
// --------------------------------------------------------------
// این کلاینتِ مخصوصِ مرورگر (Browser Client) برای احراز هویت
// (Sign Up / Log In با گوگل) استفاده می‌شود.
// در کامپوننت‌های سمت کلاینت ('use client') باید حتماً از این
// فایل استفاده کنید — نه از lib/supabase.ts که برای سرور است.
//
// از فرآیند PKCE استفاده می‌کنیم که امن‌ترین روش برای
// OAuth در اپلیکیشن‌های بدونِ Backend اختصاصی (مثل Next.js) است.
// --------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// جلوگیری از ساختِ چندین کلاینت در حین Hot-Reload در زمانِ توسعه
let browserClient: ReturnType<typeof createClient> | undefined;

function getBrowserClient() {
  if (browserClient) return browserClient;

  browserClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      // PKCE: کدِ تایید را در localStorage ذخیره می‌کند تا پس از
      // بازگشت از گوگل، توکن را دریافت کنیم (بدون نیاز به سرور).
      flowType: 'pkce',
      // مهم: این گزینه را عمداً false گذاشتیم. صفحه‌ی
      // app/[locale]/auth/callback/page.tsx خودش به‌صورت دستی
      // exchangeCodeForSession را صدا می‌زند. اگر این گزینه true
      // باشد، خودِ کتابخانه هم هم‌زمان و در پس‌زمینه سعی می‌کند
      // همان کد را مبادله کند؛ چون هر کد فقط یک‌بار قابل استفاده
      // است، این هم‌زمانی باعث خطای
      // "PKCE code verifier not found in storage" می‌شد.
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