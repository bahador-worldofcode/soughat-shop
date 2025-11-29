'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, ShoppingCart, Package } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalSales: 0, newOrders: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from('orders').select('total_price, status');
      
      if (data) {
        const total = data.reduce((sum, order) => sum + (order.total_price || 0), 0);
        const pending = data.filter(o => o.status === 'pending').length;
        setStats({
          totalSales: total,
          newOrders: pending,
          totalOrders: data.length
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center">در حال بارگذاری آمار...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">داشبورد فروش</h2>
          <p className="text-sm text-gray-500 mt-1">نگاه کلی به وضعیت کسب‌وکار</p>
        </div>
        <Link href="/" target="_blank" className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 transition-all shadow-sm">
            مشاهده فروشگاه
        </Link>
      </header>

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-sm font-medium">درآمد کل</span>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">${stats.totalSales.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><TrendingUp className="h-6 w-6" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-sm font-medium">سفارشات جدید</span>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.newOrders}</h3>
          </div>
          <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><ShoppingCart className="h-6 w-6" /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-sm font-medium">تعداد کل سفارشات</span>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Package className="h-6 w-6" /></div>
        </div>
      </div>
    </div>
  );
}