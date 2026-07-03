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
  const locale = useLocale();
  const isEn = locale === 'en';

  const { convertPrice, getSymbol, addToCart } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finalPrice = convertPrice(price);
  const symbol = getSymbol();

  const displayTitle = isEn ? (title_en || title) : title;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, title, title_en, price, image, pricing_type, weight });
  };

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      
      <Link href={`/products/${slug}`} className="relative aspect-square overflow-hidden bg-gray-100 block flex-shrink-0">
        <img
          src={image}
          alt={displayTitle}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* فاصله گذاری (پدینگ) کمی منعطف‌تر در موبایل، و تغییر line-clamp به ۲ برای متن‌های طولانی */}
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <Link href={`/products/${slug}`}>
            <h3 className="mb-2 text-[13px] md:text-base font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors text-start leading-snug">
                {displayTitle}
            </h3>
        </Link>
        
        <p className="text-[11px] md:text-sm text-gray-500 mb-4 text-start leading-relaxed">{t('instant_delivery')}</p>
       
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs text-gray-400 text-start">{t('final_price')}</span>
            <span className="text-lg md:text-xl font-bold text-blue-600 font-mono text-start">
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
            className="flex h-9 w-9 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 shadow-lg active:scale-95 cursor-pointer z-10"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}