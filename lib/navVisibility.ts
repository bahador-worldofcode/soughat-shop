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

// مسیرهایی که نشانگر شناور سبد خرید در دسکتاپ (FloatingCart) باید در آن‌ها
// مخفی شود.
// منطق: این دکمه صرفاً یک میان‌بر سریع به سبد خرید است. در صفحاتی که کاربر
// از قبل خودِ سبد خرید (یا خلاصه‌ی آن) را جلوی چشمش می‌بیند، وجود این دکمه
// تکراری و مزاحم است — چون همان چیزی را نشان می‌دهد که کاربر همین الان
// روی صفحه دارد.
export function isFloatingCartHidden(pathname: string | null | undefined): boolean {
  if (!pathname) return false;

  // پنل مدیریت محیط کاملاً جدایی دارد.
  if (pathname.startsWith('/admin')) return true;

  // خودِ صفحه‌ی سبد خرید: کاربر همین الان دارد سبد خرید را می‌بیند.
  if (pathname.startsWith('/cart')) return true;

  // صفحه‌ی تسویه‌حساب: خلاصه‌ی سبد خرید و مبلغ نهایی همین الان روی صفحه
  // نمایش داده می‌شود، پس نیازی به دکمه‌ی شناور اضافه نیست.
  if (pathname.startsWith('/checkout')) return true;

  return false;
}

// 🆕 مسیرهایی که بنر تبلیغاتی سراسری (TopPromoBanner) نباید در آن‌ها نمایش
// داده شود.
// منطق: این بنر برای هدایتِ بازدیدکنندگانی است که تازه از طریق یک پست
// وبلاگ/شبکه‌ی اجتماعی وارد سایت شده‌اند و ممکن است همان‌جا بمانند — هدف
// این است که با یک کلیک به صفحه‌ی محصولات هدایت شوند. اما در صفحاتی که
// کاربر از قبل وسط فرآیند پرداخت است یا همین الان خریدش را با موفقیت به
// پایان رسانده، این بنر فقط حواس‌پرتی/مزاحمت بی‌مورد است و ربطی به آن لحظه
// از سفر کاربر ندارد؛ برای همین آنجا مخفی می‌شود.
export function isPromoBannerHidden(pathname: string | null | undefined): boolean {
  if (!pathname) return false;

  // پنل مدیریت محیط کاملاً جدایی دارد.
  if (pathname.startsWith('/admin')) return true;

  // صفحه‌ی تسویه‌حساب: تمرکز کامل کاربر روی تکمیل پرداخت مهم‌تر از هر
  // پیشنهاد تبلیغاتی دیگری‌ست.
  if (pathname.startsWith('/checkout')) return true;

  // صفحه‌ی موفقیت سفارش: کاربر همین الان خرید کرده؛ اینجا جای تبریک و
  // اطلاعات سفارش است، نه دعوت به خرید جدید.
  if (pathname.startsWith('/success')) return true;

  return false;
}