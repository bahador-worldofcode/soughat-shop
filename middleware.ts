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

// 🆕 رفع بحران «Exceeded free resources - Fluid Active CPU» (گام ۳ — مهم‌ترین گام):
// -----------------------------------------------------------------------
// این میدل‌ور روی تقریباً هر درخواستِ سایت اجرا می‌شود (همه‌ی صفحات فارسی/
// انگلیسی، برای هر بازدیدکننده و هر کراولر). قبلاً supabase.auth.getUser()
// بدون هیچ شرطی روی *همه‌ی* این درخواست‌ها صدا زده می‌شد — یعنی حتی برای
// یک بازدیدکننده‌ی ناشناس (که اصلاً هیچ‌وقت لاگین نکرده و هیچ کوکیِ سشنی
// ندارد) یک درخواستِ شبکه‌ای کامل به سرورِ Auth سوپابیس زده می‌شد، فقط
// برای این‌که نتیجه‌اش «کاربری وجود ندارد» باشد! چون اکثریتِ قاطعِ ترافیکِ
// یک فروشگاه (بازدیدکننده‌های تازه، گوگل‌بات، بات‌های هوش مصنوعی) اصلاً
// لاگین نیستند، این یعنی روی تقریباً *هر* بازدید از سایت، یک کارِ اضافه و
// کاملاً غیرضروری انجام می‌شد — این به‌تنهایی می‌تواند بزرگ‌ترین عاملِ
// مصرفِ سهمیه‌ی CPU رایگانِ Vercel باشد، چون شاملِ صفحاتی هم می‌شود که
// خودشان (بعد از رفع مشکلات دیگر) کاملاً استاتیک/ISR شده‌اند.
//
// راه‌حل: فقط وقتی کوکیِ سشنِ سوپابیس واقعاً وجود دارد (یعنی کاربر قبلاً
// حداقل یک‌بار لاگین کرده) این تماسِ تمدیدِ سشن را بزن. برای کاربرهای
// لاگین‌شده هیچ تغییری حس نمی‌شود (رفتار دقیقاً مثل قبل است)؛ برای بقیه‌ی
// بازدیدکننده‌ها (اکثریتِ ترافیک سایت) این کارِ اضافه کلاً حذف می‌شود.
function hasSupabaseAuthCookie(req: NextRequest): boolean {
  return req.cookies.getAll().some((cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token'));
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
  // 🆕 فقط وقتی این کار را انجام بده که واقعاً کوکیِ سشنی برای تمدید کردن
  // وجود داشته باشد (توضیح کامل بالای همین فایل، بخش «گام ۳»).
  if (hasSupabaseAuthCookie(req)) {
    await supabase.auth.getUser();
  }

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