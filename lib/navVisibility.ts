// مسیرهایی که نوار پایین موبایل (Mobile Bottom Nav) باید در آن‌ها مخفی شود.
// این تابع یک‌بار نوشته شده و هم در MobileBottomNav و هم در FloatingContact
// استفاده می‌شود تا منطق مخفی‌سازی همیشه هماهنگ بماند.

export function isMobileNavHidden(pathname: string | null | undefined): boolean {
  if (!pathname) return false;

  // پنل مدیریت، لی‌اوت و طراحی کاملاً جدایی دارد
  if (pathname.startsWith('/admin')) return true;

  // صفحه‌ی تسویه‌حساب یک فرآیند متمرکز و حساس است؛
  // نوار پایین می‌تواند حواس کاربر را در لحظه پرداخت پرت کند
  if (pathname === '/checkout' || pathname.startsWith('/checkout/')) return true;

  // صفحه‌ی جزئیات محصول از قبل یک نوار ثابت «افزودن به سبد خرید»
  // مخصوص به خودش در پایین صفحه دارد؛ دو نوار همزمان باعث شلوغی می‌شود
  if (pathname.startsWith('/products/') && pathname !== '/products') return true;

  return false;
}
