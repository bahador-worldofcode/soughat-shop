import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // آدرس سایت را از متغیر محیطی می‌گیریم، اگر نبود آدرس اصلی را می‌گذاریم
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat-shop.vercel.app';

  return {
    rules: {
      userAgent: '*', // قانون برای همه ربات‌ها (گوگل، بینگ و...)
      allow: '/',     // اجازه دسترسی به همه صفحات به صورت پیش‌فرض
      disallow: [
        '/admin/',      // ⛔ پنل مدیریت (امنیت)
        '/cart/',       // ⛔ سبد خرید (شخصی و بدون ارزش سئو)
        '/checkout/',   // ⛔ صفحه پرداخت (شخصی و حساس)
        '/success/',    // ⛔ رسید پرداخت (تکراری و بی‌ارزش برای گوگل)
        '/api/',        // ⛔ بک‌‌اند و APIها (فنی)
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`, // آدرس نقشه سایت برای هدایت ربات‌ها
  };
}