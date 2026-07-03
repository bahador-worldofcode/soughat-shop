// مسیرهایی که نوار پایین موبایل (Mobile Bottom Nav) باید در آن‌ها مخفی شود.
// منطق جدید معماری (Unified UI Pattern):
// برای ایجاد یکپارچگی حس یک اپلیکیشن (App-like experience)، 
// نوار پیمایش فقط و فقط در بخش "مدیریت سایت (Admin)" خاموش می‌شود 
// و در تمامی بخش‌های مشتری حضور دائمی خواهد داشت.

export function isMobileNavHidden(pathname: string | null | undefined): boolean {
  if (!pathname) return false;

  // پنل مدیریت، لی‌اوت و طراحی کاملاً جدایی دارد و محیط سیستم است.
  if (pathname.startsWith('/admin')) return true;

  // قانون مدرن: نوار موبایل در تمامی مسیرها مثل /checkout و /products قابل دسترسی است.
  return false;
}