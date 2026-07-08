// lib/supabase/server.ts
// --------------------------------------------------------------
// کلاینتِ Supabase مخصوصِ سرور (Route Handlers، Server Components،
// Server Actions). این کلاینت کوکی‌های درخواستِ HTTP فعلی را
// می‌خواند و می‌نویسد — دقیقاً همان چیزی که تبادل کدِ PKCE
// (exchangeCodeForSession) برای کارکردِ درست در یک اپلیکیشنِ
// Next.js به آن نیاز دارد.
//
// نکته: این فایل را در فایل‌های 'use client' import نکنید؛
// فقط داخل route.ts ها، Server Component ها، یا Server Action ها
// استفاده شود. برای کامپوننت‌های کلاینت از lib/supabase-browser.ts
// استفاده کنید.
// --------------------------------------------------------------

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll از داخل یک Server Component خالص (نه یک
            // Route Handler یا Server Action) صدا زده شود خطا
            // می‌دهد چون آنجا نوشتنِ کوکی مجاز نیست. این خطا را
            // بی‌خطر نادیده می‌گیریم چون middleware.ts در همین
            // پروژه مسئولِ تازه نگه‌داشتنِ سشن/کوکی‌هاست.
          }
        },
      },
    }
  );
}