'use client';

import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store';

interface ProductCardProps {
  id: string;
  title: string;
  price: number; // قیمت همیشه به دلار
  image: string;
}

export default function ProductCard({ id, title, price, image }: ProductCardProps) {
  // دریافت توابع از موتور
  const { convertPrice, getSymbol, addToCart } = useStore();
  
  // محاسبه قیمت نهایی
  const finalPrice = convertPrice(price);
  const symbol = getSymbol();

  // هندلر کلیک دکمه خرید
  const handleAddToCart = () => {
    addToCart({ id, title, price, image });
    // اینجا بعداً می‌توانیم یک پیام "به سبد اضافه شد" نمایش دهیم
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">ارسال فوری به تهران و شهرستان‌ها</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">قیمت نهایی</span>
            <span className="text-xl font-bold text-blue-600">
              {symbol} {finalPrice}
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 shadow-lg active:scale-95 cursor-pointer"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}