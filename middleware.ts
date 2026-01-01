import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'always'
});
 
export const config = {
  // تغییر مهم: اضافه کردن پترن برای نادیده گرفتن فایل‌های دارای پسوند (مثل png, jpg, ...)
  // عبارت |.*\\..* باعث می‌شود هر درخواستی که نقطه (.) دارد (یعنی فایل است) نادیده گرفته شود.
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};