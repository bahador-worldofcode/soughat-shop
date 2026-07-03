// مسیرهایی که نوار پایین موبایل (Mobile Bottom Nav) باید در آن‌ها مخفی شود.
// این تابع یک‌بار نوشته شده و هم در MobileBottomNav و هم در FloatingContact
// استفاده می‌شود تا منطق مخفی‌سازی همیشه هماهنگ بماند.

export function isMobileNavHidden(pathname: string | null | undefined): boolean {
  if (!pathname) return false;

  // پنل مدیریت، لی‌اوت و طراحی کاملاً جدایی دارد و نباید منوی کاربری آنجا باشد
  if (pathname.startsWith('/admin')) return true;

  // با رویکرد جدید UX، منوی پایین دیگر در صفحات محصول و چک‌اوت مخفی نمی‌شود
  // تا کاربر همیشه حس یکپارچگی داشته باشد و بتواند به راحتی بین صفحات جابجا شود.
  
  return false;
}