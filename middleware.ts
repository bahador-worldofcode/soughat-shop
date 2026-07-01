import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'always',
});

const PRODUCT_PATTERN = /^\/(fa|en)\/products\/([^/]+)\/?$/;
const BLOG_PATTERN = /^\/(fa|en)\/blog\/([^/]+)\/?$/;

export default function middleware(req: NextRequest) {
  const accept = req.headers.get('accept') || '';
  const wantsMarkdown = accept.includes('text/markdown');

  if (wantsMarkdown) {
    const { pathname } = req.nextUrl;

    const productMatch = pathname.match(PRODUCT_PATTERN);
    if (productMatch) {
      const [, locale, slug] = productMatch;
      const url = req.nextUrl.clone();
      url.pathname = `/api/markdown/products/${locale}/${slug}`;
      return NextResponse.rewrite(url);
    }

    const blogMatch = pathname.match(BLOG_PATTERN);
    if (blogMatch) {
      const [, locale, slug] = blogMatch;
      const url = req.nextUrl.clone();
      url.pathname = `/api/markdown/blog/${locale}/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  // تغییر مهم: اضافه کردن پترن برای نادیده گرفتن فایل‌های دارای پسوند (مثل png, jpg, ...)
  // عبارت |.*\\..* باعث می‌شود هر درخواستی که نقطه (.) دارد (یعنی فایل است) نادیده گرفته شود.
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};