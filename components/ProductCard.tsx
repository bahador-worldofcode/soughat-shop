'use client';

import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation'; 
import { useTranslations, useLocale } from 'next-intl'; 

interface ProductCardProps {
  id: string;
  title: string;
  title_en?: string; 
  price: number;
  image: string;
  slug: string;
  pricing_type?: string; 
  weight?: number;
}

export default function ProductCard({ id, title, title_en, price, image, slug, pricing_type, weight }: ProductCardProps) {
  const t = useTranslations('ProductCard'); 
  const locale = useLocale(); // دریافت زبان فعلی
  const isEn = locale === 'en'; // بررسی انگلیسی بودن

  const { convertPrice, getSymbol, addToCart } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finalPrice = convertPrice(price);
  const symbol = getSymbol();

  // انتخاب هوشمند عنوان بر اساس زبان
  // اگر انگلیسی بود و تایتل انگلیسی موجود بود، همون رو نشون بده، وگرنه فارسی
  const displayTitle = isEn ? (title_en || title) : title;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, title, title_en, price, image, pricing_type, weight });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      
      <Link href={`/products/${slug}`} className="relative aspect-square overflow-hidden bg-gray-100 block">
        <img
          src={image}
          alt={displayTitle}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${slug}`}>
            <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors text-start">
                {displayTitle}
            </h3>
        </Link>
        
        <p className="text-sm text-gray-500 mb-4 text-start">{t('instant_delivery')}</p>
       
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 text-start">{t('final_price')}</span>
            <span className="text-xl font-bold text-blue-600 font-mono text-start">
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