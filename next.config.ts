import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // اجازه به تمام دامنه‌های سوپابیس
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com', // برای آواتار ادمین
      }
    ],
  },
};

export default nextConfig;