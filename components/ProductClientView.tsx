'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ShoppingBag, Check, ShieldCheck, Truck, Star } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  features: string[];
}

export default function ProductClientView({ product }: { product: Product }) {
  const { convertPrice, getSymbol, addToCart } = useStore();
  const [mounted, setMounted] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => setMounted(true), []);

  const finalPrice = mounted ? convertPrice(product.price) : product.price;
  const symbol = mounted ? getSymbol() : '$';

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* بخش تصویر */}
      <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-200">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* بخش اطلاعات */}
      <div className="flex flex-col">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span>۵.۰ (تضمین کیفیت)</span>
            </div>
        </div>

        {/* قیمت */}
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between mb-8">
            <span className="text-gray-600 font-medium">قیمت نهایی:</span>
            <div className="text-2xl font-bold text-blue-700 font-mono">
                {symbol} {finalPrice}
            </div>
        </div>

        {/* ویژگی‌ها */}
        {product.features && product.features.length > 0 && (
            <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">ویژگی‌های محصول:</h3>
                <ul className="space-y-2">
                    {product.features.map((feat, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="h-4 w-4 text-green-500" />
                            {feat}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* توضیحات */}
        <div className="mb-8 prose prose-sm text-gray-600 leading-7 text-justify">
            <p>{product.description}</p>
        </div>

        {/* دکمه خرید */}
        <div className="mt-auto space-y-4">
            <button 
                onClick={handleAddToCart}
                disabled={added}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                    added 
                    ? 'bg-green-600 text-white shadow-green-200' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:-translate-y-1'
                }`}
            >
                {added ? (
                    <>
                        <Check className="h-6 w-6" />
                        به سبد اضافه شد
                    </>
                ) : (
                    <>
                        <ShoppingBag className="h-6 w-6" />
                        افزودن به سبد خرید
                    </>
                )}
            </button>
            
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 text-center">
                <div className="flex items-center justify-center gap-1"><ShieldCheck className="h-4 w-4"/> ضمانت بازگشت وجه</div>
                <div className="flex items-center justify-center gap-1"><Truck className="h-4 w-4"/> ارسال رایگان به ایران</div>
            </div>
        </div>
      </div>
    </div>
  );
}