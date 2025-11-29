'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// آیکون Calculator اضافه شد
import { LayoutDashboard, ShoppingCart, Package, LogOut, Image as ImageIcon, BookOpen, Wallet, RefreshCw, MessageSquare, Layers, Settings, Calculator } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'داشبورد', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'سفارشات', href: '/admin/orders', icon: ShoppingCart },
    { name: 'محصولات', href: '/admin/products', icon: Package },
    { name: 'دسته‌بندی‌ها', href: '/admin/categories', icon: Layers },
    { name: 'قیمت‌گذاری', href: '/admin/pricing', icon: Calculator }, // ✅ گزینه جدید اینجاست
    { name: 'پیام‌ها', href: '/admin/messages', icon: MessageSquare },
    { name: 'درگاه پرداخت', href: '/admin/payments', icon: Wallet },
    { name: 'نرخ ارز', href: '/admin/currencies', icon: RefreshCw },
    { name: 'رسانه', href: '/admin/media', icon: ImageIcon },
    { name: 'وبلاگ', href: '/admin/blog', icon: BookOpen },
    { name: 'تنظیمات سایت', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-vazir)] flex">
      <aside className="w-64 bg-blue-900 text-white hidden md:flex flex-col shadow-2xl sticky top-0 h-screen z-20">
        <div className="p-6 border-b border-blue-800 flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">S</div>
          <div>
            <h1 className="text-lg font-bold">سوغات شاپ</h1>
            <span className="text-[10px] text-blue-300 uppercase tracking-wider">پنل مدیریت</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'bg-blue-700 text-white shadow-inner' : 'hover:bg-blue-800/50 text-blue-100'
                }`}>
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-300 hover:text-red-100 hover:bg-red-900/20 p-2 rounded-lg transition-all w-full">
            <LogOut className="h-4 w-4" />
            خروج امن
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative">
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
          <span className="font-bold text-blue-900">Soughat Admin</span>
          <button onClick={handleLogout}><LogOut className="h-5 w-5 text-red-500" /></button>
        </div>
        {children}
      </main>
    </div>
  );
}