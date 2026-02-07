'use client';

import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation'; // لینک هوشمند
import { useTranslations } from 'next-intl'; // هوک ترجمه

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  pricing_type?: string; // فیلد جدید: برای انتقال نوع محصول به سبد خرید
}

export default function ProductCard({ id, title, price, image, slug, pricing_type }: ProductCardProps) {
  const t = useTranslations('ProductCard'); // اتصال به دیکشنری
  const { convertPrice, getSymbol, addToCart } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finalPrice = convertPrice(price);
  const symbol = getSymbol();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // ارسال pricing_type به استور برای تشخیص اینکه محصول حواله است یا خیر
    addToCart({ id, title, price, image, pricing_type });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      
      <Link href={`/products/${slug}`} className="relative aspect-square overflow-hidden bg-gray-100 block">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${slug}`}>
            <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">{title}</h3>
        </Link>
        
        {/* متن ترجمه شده */}
        <p className="text-sm text-gray-500 mb-4">{t('instant_delivery')}</p>
       
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">{t('final_price')}</span>
            <span className="text-xl font-bold text-blue-600 font-mono">
              {mounted ? (
                <>
                  {symbol} {finalPrice.toFixed(2)}
                </>
              ) : (
                <>
                  $ {price.toFixed(2)}
                </>
              )}
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 shadow-lg active:scale-95 cursor-pointer z-10"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}