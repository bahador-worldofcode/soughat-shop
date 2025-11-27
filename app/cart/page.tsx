'use client';

import Link from 'next/link';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function CartPage() {
  const { cart, removeFromCart, totalPrice, getSymbol } = useStore();
  const total = totalPrice();
  const symbol = getSymbol();

  // اگر سبد خالی بود
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">سبد خرید شما خالی است</h1>
        <p className="text-gray-500 mb-8">به نظر می‌رسد هنوز محصولی انتخاب نکرده‌اید.</p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">سبد خرید شما</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* لیست آیتم‌ها */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              {/* عکس محصول */}
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="h-full w-full object-cover"
                />
              </div>

              {/* جزئیات */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">تعداد: {item.quantity}</p>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold text-blue-600">
                     {symbol} {item.price}
                  </span>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* خلاصه صورتحساب */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">صورتحساب</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>مجموع اقلام</span>
                <span>{symbol} {total}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>هزینه ارسال</span>
                <span className="text-green-600">رایگان</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">مبلغ قابل پرداخت</span>
                <span className="text-xl font-bold text-blue-600">{symbol} {total}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">محاسبه شده بر اساس نرخ لحظه‌ای</p>
            </div>

            <Link 
              href="/checkout"
              className="w-full inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-green-700 transition-all hover:shadow-lg gap-2"
            >
              <span>نهایی کردن خرید</span>
              <ArrowLeft className="h-5 w-5" />
            </Link>
            
            <p className="mt-4 text-center text-xs text-gray-400">
              پرداخت امن با Solana Pay / USDT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}