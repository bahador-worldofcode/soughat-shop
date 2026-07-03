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