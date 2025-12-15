import Link from 'next/link';
import { Instagram, Twitter, Mail, Heart, Lock, ShieldCheck, HelpCircle, ShoppingBag, BookOpen, Package, Info, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            {/* لوگوتایپ فارسی و اختصاصی */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-blue-100">
                     {/* اصلاح شد: استفاده از فایل استاتیک لوگو */}
                     <img src="/logo.png" alt="Soughat Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-2xl font-black text-blue-700 tracking-tighter" style={{ letterSpacing: '-1px' }}>
                  سوغات شاپ
                </span>
            </div>
            
            <p className="mt-4 text-sm text-gray-500 max-w-sm leading-7 text-justify">
              اولین پلتفرم تخصصی ارسال هدیه به ایران. ما با حذف واسطه‌های بانکی و استفاده از شبکه امن بلاک‌چین، 
              امکان پرداخت سریع و بدون تحریم را با تتر (USDT) و سولانا (Solana) فراهم کرده‌ایم.
            </p>

            {/* نوار آیکون‌های کریپتو */}
            <div className="flex items-center gap-3 mt-4 opacity-90">
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png" className="w-6 h-6 hover:scale-110 transition-transform cursor-help" alt="Tether" title="پشتیبانی از تتر" />
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png" className="w-6 h-6 hover:scale-110 transition-transform cursor-help" alt="Solana" title="پشتیبانی از سولانا" />
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png" className="w-6 h-6 hover:scale-110 transition-transform cursor-help grayscale hover:grayscale-0" alt="Bitcoin" title="پشتیبانی از بیت‌کوین" />
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png" className="w-6 h-6 hover:scale-110 transition-transform cursor-help grayscale hover:grayscale-0" alt="Ethereum" title="پشتیبانی از اتریوم" />
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">Crypto Friendly</span>
            </div>
            
            {/* Socials */}
            <div className="flex items-center gap-4 mt-6">
                <a href="#" className="bg-gray-50 p-2 rounded-lg text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-all"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="bg-gray-50 p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-50 transition-all"><Twitter className="h-5 w-5" /></a>
                <Link href="/contact" className="bg-gray-50 p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Mail className="h-5 w-5" /></Link>
            </div>
          </div>

          {/* Links 1: Store */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">فروشگاه</h3>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li>
                <Link href="/products" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> لیست محصولات
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> مجله آموزشی
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <Package className="h-4 w-4" /> پیگیری سفارش
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2: Trust & Guide */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">دسترسی سریع</h3>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li>
                <Link href="/how-it-works" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" /> راهنمای خرید
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> قوانین و ضمانت‌ها
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <Info className="h-4 w-4" /> درباره ما
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 hover:pr-2 transition-all flex items-center gap-2">
                    <Phone className="h-4 w-4" /> تماس با ما
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400 dir-ltr font-mono">
             © 2025 Soughat Shop. All rights reserved.
            </p>
            {/* Admin Lock */}
            <Link href="/admin/login" className="text-gray-300 hover:text-blue-900 transition-colors p-1 opacity-50 hover:opacity-100" title="ورود مدیریت">
              <Lock className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
            <span>ساخته شده با</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
            <span>برای ایران</span>
          </div>
        </div>
      </div>
    </footer>
  );
}