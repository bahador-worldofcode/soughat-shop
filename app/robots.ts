import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // دریافت آدرس سایت (چه لوکال، چه آدرس اصلی)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*', // اجازه به تمام ربات‌ها (گوگل، بینگ و...)
      allow: '/',     // اجازه دسترسی به همه صفحات
      disallow: '/admin/', // ممنوعیت ورود به پنل ادمین (برای امنیت)
    },
    sitemap: `${baseUrl}/sitemap.xml`, // آدرس نقشه سایت
  };
}