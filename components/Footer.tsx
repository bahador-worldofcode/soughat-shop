import Link from 'next/link';
import { Instagram, Twitter, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-xl font-bold text-blue-600">Soughat Shop</span>
            <p className="mt-4 text-sm text-gray-500 max-w-sm">
              پلتفرم امن ارسال هدیه به ایران. 
              ما فاصله‌ها را با تکنولوژی بلاک‌چین و عشق کم می‌کنیم. 
              پرداخت سریع و بدون تحریم با ارز دیجیتال.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/products" className="hover:text-blue-600 transition-colors">محصولات</Link></li>
              <li><Link href="/track" className="hover:text-blue-600 transition-colors">پیگیری سفارش</Link></li>
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">درباره ما</Link></li>
              <li><Link href="/faq" className="hover:text-blue-600 transition-colors">سوالات متداول</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">تماس با ما</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span dir="ltr">support@soughat.shop</span>
              </li>
              <li className="flex items-center gap-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter className="h-5 w-5" /></a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400" dir="ltr">
            © 2025 Soughat Shop. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>ساخته شده با</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
            <span>برای ایران</span>
          </div>
        </div>
      </div>
    </footer>
  );
}