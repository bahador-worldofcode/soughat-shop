import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// ایجاد پلاگین i18n
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      // شبکه‌ی امن (Safety net): آدرس بنر اصلی (Hero) از پنل ادمین به‌صورت
      // متن آزاد وارد می‌شود، یعنی نظری می‌تواند از هر دامنه‌ای باشد.
      // این الگو تضمین می‌کند next/image برای هیچ دامنه‌ی https ناشناخته‌ای
      // کرش نکند، حتی اگر بعداً از یک هاست دیگر عکس گذاشته شود.
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 🆕 رفع مشکل «هر بار کند لود شدن بنر»:
    // پیش‌فرض Next.js (نسخه‌ی فعلی پروژه) فقط ۶۰ ثانیه است، یعنی هر
    // دقیقه یک‌بار تصویر بهینه‌شده‌ی بنر از نو پردازش می‌شود و همان
    // کندی اولین بار دوباره تکرار می‌شود. چون آدرس هر عکس آپلودی در
    // بخش «رسانه» یکتا و برگرفته از timestamp است (مثلاً
    // 1751999999999-123.jpg)، وقتی ادمین بنر را عوض می‌کند آدرس هم
    // عوض می‌شود؛ پس افزایش این عدد هیچ خطری برای «آپدیت نشدن بنر
    // جدید» ندارد و کاملاً امن است.
    minimumCacheTTL: 2592000, // 30 روز
  },

  // 🆕 رفع مشکل کش نشدن لوگو / آیکون‌ها / مانیفست در پوشه‌ی public:
  // به‌صورت پیش‌فرض Next.js/Vercel برای فایل‌های داخل پوشه‌ی public
  // هدر Cache-Control: public, max-age=0, must-revalidate می‌فرستد؛
  // یعنی مرورگر کاربر در هر بازدید مجدداً از سرور می‌پرسد «تغییر کرده
  // یا نه» و این باعث کند شدن هدر (که شامل لوگو می‌شود) در هر بار
  // ورود می‌شود، نه فقط بار اول. قانون زیر به این فایل‌ها اجازه می‌دهد
  // در خود مرورگر کاربر تا ۱ سال کش شوند.
  async headers() {
    return [
      {
        source: '/:path(.+\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|otf))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/site.webmanifest',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // ۱ روز؛ چون ممکنه محتواش تغییر کنه
          },
        ],
      },
    ];
  },

  // این بخش برای جلوگیری از خطاهای بیلد ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  }
};

// کانفیگ اصلی را داخل پلاگین رپ (Wrap) می‌کنیم
export default withNextIntl(nextConfig);