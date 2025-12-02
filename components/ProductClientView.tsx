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

  // --- موتور پردازش متن (جدید) ---
  const renderDescription = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      // اگر خط خالی بود، فاصله بنداز
      if (!line.trim()) return <br key={index} />;

      // پردازش بولد کردن متن بین ** **
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="mb-4 leading-8 text-justify text-gray-600">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={i} className="font-bold text-gray-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* بخش تصویر */}
      <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* بخش اطلاعات */}
      <div className="flex flex-col">
        <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full w-fit">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-700">۵.۰</span>
                <span>(تضمین اصالت و کیفیت)</span>
            </div>
        </div>

        {/* قیمت */}
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-center justify-between mb-8 shadow-sm">
            <div>
                <span className="text-gray-500 text-xs block mb-1">قیمت تمام شده (شامل ارسال):</span>
                <span className="text-blue-800 font-bold text-lg">قیمت نهایی:</span>
            </div>
            <div className="text-3xl font-bold text-blue-700 font-mono tracking-tight">
                {symbol} {typeof finalPrice === 'number' ? finalPrice.toFixed(2) : finalPrice}
            </div>
        </div>

        {/* ویژگی‌ها */}
        {product.features && product.features.length > 0 && (
            <div className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    ویژگی‌های این محصول:
                </h3>
                <ul className="space-y-3">
                    {product.features.map((feat, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700 leading-6">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                            {feat}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* توضیحات (اصلاح شده با موتور متن) */}
        <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-3 text-lg border-b pb-2">توضیحات محصول</h3>
            {renderDescription(product.description)}
        </div>

        {/* دکمه خرید */}
        <div className="mt-auto space-y-4 sticky bottom-4 z-10">
            <button 
                onClick={handleAddToCart}
                disabled={added}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl transform active:scale-95 ${
                    added 
                    ? 'bg-green-600 text-white shadow-green-200' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200 hover:-translate-y-1'
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
            
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 text-center bg-white/80 backdrop-blur py-2 rounded-xl">
                <div className="flex items-center justify-center gap-1 font-medium"><ShieldCheck className="h-4 w-4 text-green-600"/> ضمانت بازگشت وجه</div>
                <div className="flex items-center justify-center gap-1 font-medium"><Truck className="h-4 w-4 text-blue-600"/> ارسال رایگان به ایران</div>
            </div>
        </div>
      </div>
    </div>
  );
}