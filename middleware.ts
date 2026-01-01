import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'always'
});
 
export const config = {
  // تغییر مهم: کلمه admin به لیست استثناها اضافه شد
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico).*)']
};