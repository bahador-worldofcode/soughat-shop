import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const intlMiddleware = createMiddleware({
  locales: ['fa', 'en'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

const PRODUCT_PATTERN = /^\/(fa|en)\/products\/([^/]+)\/?$/;
const BLOG_PATTERN = /^\/(fa|en)\/blog\/([^/]+)\/?$/;

// این تابع را از پاسخِ نهایی جدا نگه می‌داریم تا کوکی‌هایی که
// Supabase حین تازه‌سازیِ سشن ست می‌کند، روی هر پاسخی که در ادامه
// (rewrite برای مارک‌داون یا پاسخِ next-intl) برگردانده می‌شود هم
// اعمال شوند.
function copySupabaseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export default async function middleware(req: NextRequest) {
  // --- ۱. تازه‌سازیِ سشنِ Supabase ---
  // این بخش تازه اضافه شده: با @supabase/ssr، توکنِ دسترسی و کوکیِ
  // وریفایرِ PKCE باید توسط یک لایه‌ی سرور (اینجا: میدل‌ور) تازه
  // نگه داشته شوند. بدون این بخش، کوکی‌های سشن ممکن است منقضی
  // شوند بدون اینکه خودکار تمدید شوند.
  let supabaseResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // مهم: این خط را حذف نکنید. صدا زدنِ getUser() باعث می‌شود اگر
  // توکن نزدیک به انقضا باشد، خودکار تمدید و کوکیِ جدید ست شود.
  await supabase.auth.getUser();

  // --- ۲. منطق قبلی پروژه: مسیریابیِ نسخه‌ی مارک‌داون برای ایجنت‌های AI ---
  const accept = req.headers.get('accept') || '';
  const wantsMarkdown = accept.includes('text/markdown');

  if (wantsMarkdown) {
    const { pathname } = req.nextUrl;

    const productMatch = pathname.match(PRODUCT_PATTERN);
    if (productMatch) {
      const [, locale, slug] = productMatch;
      const url = req.nextUrl.clone();
      url.pathname = `/api/markdown/products/${locale}/${slug}`;
      const rewriteResponse = NextResponse.rewrite(url);
      copySupabaseCookies(supabaseResponse, rewriteResponse);
      return rewriteResponse;
    }

    const blogMatch = pathname.match(BLOG_PATTERN);
    if (blogMatch) {
      const [, locale, slug] = blogMatch;
      const url = req.nextUrl.clone();
      url.pathname = `/api/markdown/blog/${locale}/${slug}`;
      const rewriteResponse = NextResponse.rewrite(url);
      copySupabaseCookies(supabaseResponse, rewriteResponse);
      return rewriteResponse;
    }
  }

  // --- ۳. منطق قبلی پروژه: next-intl ---
  const intlResponse = intlMiddleware(req);
  copySupabaseCookies(supabaseResponse, intlResponse);
  return intlResponse;
}

export const config = {
  // تغییر مهم: اضافه کردن پترن برای نادیده گرفتن فایل‌های دارای پسوند (مثل png, jpg, ...)
  // عبارت |.*\\..* باعث می‌شود هر درخواستی که نقطه (.) دارد (یعنی فایل است) نادیده گرفته شود.
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
