// app/[locale]/auth/callback/route.ts
// --------------------------------------------------------------
// این فایل جایگزینِ app/[locale]/auth/callback/page.tsx می‌شود.
// (آن فایل را حذف کنید — نمی‌توان هم page.tsx و هم route.ts را
// برای یک مسیر واحد نگه داشت.)
//
// چرا Route Handler به‌جای یک صفحهٔ کلاینتی:
// قبلاً exchangeCodeForSession در مرورگر و با localStorage انجام
// می‌شد. حالا این تبادل کاملاً سمتِ سرور و با کوکی‌ها انجام
// می‌شود — دقیقاً همان درخواستِ HTTP که گوگل/Supabase کاربر را
// به آن هدایت کرده‌اند، پس وریفایرِ PKCE (که در کوکی است) همیشه
// همراهِ درخواست می‌رسد. دیگر هیچ وابستگی‌ای به اینکه جاوااسکریپتِ
// کلاینت کِی هیدرِیت می‌شود، یا افزونه/حالت خصوصیِ مرورگر
// localStorage را دست‌نخورده نگه داشته یا نه، وجود ندارد.
// --------------------------------------------------------------

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // مسیر واقعی چیزی مثل /en/auth/callback یا /fa/auth/callback است؛
  // بخش اول مسیر همان locale است.
  const pathParts = requestUrl.pathname.split('/').filter(Boolean);
  const locale = pathParts[0] === 'en' ? 'en' : 'fa';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // ورود موفق — هدایت به صفحهٔ پروفایل
      return NextResponse.redirect(`${requestUrl.origin}/${locale}/profile`);
    }

    console.error('Auth callback error:', error.message);
    return NextResponse.redirect(
      `${requestUrl.origin}/${locale}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // اگر گوگل/Supabase کد را برنگرداند (مثلاً کاربر مستقیم این آدرس را باز کرده)
  return NextResponse.redirect(
    `${requestUrl.origin}/${locale}/login?error=${encodeURIComponent('missing_code')}`
  );
}