'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ShoppingBag, Check, ShieldCheck, Truck, Star, Plus, Minus, Trash2, Tag, LayoutGrid, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  features: string[];
  slug: string;
}

interface RelatedItem {
    id: string;
    title: string;
    price: number;
    image: string;
    slug: string;
}

interface Props {
    product: Product;
    categoryName: string;
    categorySlug: string;
    relatedProducts: RelatedItem[];
}

export default function ProductClientView({ product, categoryName, categorySlug, relatedProducts }: Props) {
  const { convertPrice, getSymbol, addToCart, decreaseFromCart, cart } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const finalPrice = mounted ? convertPrice(product.price) : product.price;
  const symbol = mounted ? getSymbol() : '$';

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const renderDescription = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      if (!line.trim()) return <div key={index} className="h-2"></div>;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="mb-2 leading-7 text-justify text-gray-600">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  // کامپوننت دکمه‌های خرید (برای استفاده مجدد در دسکتاپ و موبایل)
  const AddToCartButtons = ({ isMobile = false }: { isMobile?: boolean }) => {
      if (quantity > 0) {
          return (
            <div className={`flex items-center justify-between bg-white border border-blue-200 rounded-xl p-1 shadow-inner ${isMobile ? 'h-12 w-full' : 'h-14 w-full'}`}>
                <button onClick={() => decreaseFromCart(product.id)} className="h-full aspect-square flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all active:scale-90">
                    {quantity === 1 ? <Trash2 className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                </button>
                <div className="flex flex-col items-center px-4">
                    <span className="text-lg font-black text-blue-900 tabular-nums">{quantity}</span>
                    {!isMobile && <span className="text-[9px] text-gray-400 font-medium">عدد در سبد</span>}
                </div>
                <button onClick={() => addToCart(product)} className="h-full aspect-square flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-90">
                    <Plus className="h-6 w-6" />
                </button>
            </div>
          );
      }
      return (
        <button 
            onClick={() => addToCart(product)} 
            className={`w-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200 hover:-translate-y-1 active:scale-95 ${isMobile ? 'h-12 text-base rounded-xl' : 'py-4 rounded-xl text-lg'}`}
        >
            <ShoppingBag className={isMobile ? "h-5 w-5" : "h-6 w-6"} /> 
            {isMobile ? 'افزودن به سبد' : 'افزودن به سبد خرید'}
        </button>
      );
  };

  return (
    <div className="pb-24 md:pb-0 relative"> {/* پدینگ پایین برای موبایل که دکمه چسبان محتوا رو نپوشونه */}
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500 items-start">
        
            {/* --- ستون تصویر (سمت راست در دسکتاپ - ۵ واحد) --- */}
            <div className="md:col-span-5 relative">
                <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group sticky top-24">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    {quantity > 0 && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white animate-in zoom-in">
                            {quantity}
                        </div>
                    )}
                </div>
            </div>

            {/* --- ستون اطلاعات (سمت چپ - ۷ واحد) --- */}
            <div className="md:col-span-7 flex flex-col">
                
                {/* 1. Breadcrumb */}
                <div className="mb-4 flex items-center justify-between">
                    <Link 
                        href={`/products?category=${categorySlug}`} 
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <Tag className="h-3 w-3" />
                        {categoryName}
                    </Link>
                    
                    {/* امتیاز (فیک ولی خوشگل) */}
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span>۵.۰</span>
                    </div>
                </div>

                {/* 2. Title */}
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-6 leading-snug">{product.title}</h1>

                {/* 3. Price & Action Box (DESKTOP ONLY) */}
                {/* این باکس در موبایل مخفی میشه چون پایین صفحه فیکسش میکنیم */}
                <div className="hidden md:block bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-gray-400 text-xs block mb-1">قیمت نهایی برای شما</span>
                            <div className="text-3xl font-black text-blue-700 font-mono tracking-tight">
                                {symbol} {typeof finalPrice === 'number' ? finalPrice.toFixed(2) : finalPrice}
                            </div>
                        </div>
                        <div className="text-right hidden lg:block">
                            <div className="text-xs text-green-600 font-bold flex items-center gap-1 mb-1 justify-end"><ShieldCheck className="h-3 w-3"/> گارانتی سلامت</div>
                            <div className="text-xs text-blue-600 font-bold flex items-center gap-1 justify-end"><Truck className="h-3 w-3"/> ارسال رایگان</div>
                        </div>
                    </div>
                    
                    {/* دکمه خرید دسکتاپ */}
                    <AddToCartButtons isMobile={false} />
                </div>

                {/* 4. Features (ویژگی‌ها) - حالا بالاتر از توضیحات */}
                {product.features && product.features.length > 0 && (
                    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {product.features.map((feat, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="bg-white p-1 rounded-full text-green-500 shadow-sm"><Check className="h-3 w-3" /></div>
                                <span className="font-medium">{feat}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* 5. Description (توضیحات) */}
                <div className="bg-white rounded-2xl p-1">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                        درباره این محصول
                    </h3>
                    <div className="text-sm md:text-base leading-8 text-gray-600">
                        {renderDescription(product.description)}
                    </div>
                </div>

            </div>
        </div>

        {/* --- STICKY BOTTOM BAR (MOBILE ONLY) --- */}
        {/* این بخش شاهکار موبایل است: همیشه پایین صفحه چسبیده */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center gap-4 max-w-md mx-auto">
                <div className="flex flex-col flex-1">
                    {/* اگر تعداد 0 بود قیمت رو نشون بده، اگر رفت تو سبد، بنویس "در سبد خرید" */}
                    <span className="text-xs text-gray-400 mb-0.5">
                        {quantity > 0 ? 'مبلغ کل آیتم:' : 'قیمت نهایی:'}
                    </span>
                    <span className="text-xl font-black text-blue-700 font-mono">
                        {symbol} {typeof finalPrice === 'number' ? (finalPrice * (quantity || 1)).toFixed(2) : finalPrice}
                    </span>
                </div>
                <div className="w-[55%]">
                    <AddToCartButtons isMobile={true} />
                </div>
            </div>
        </div>

        {/* محصولات پیشنهادی */}
        {relatedProducts.length > 0 && (
            <div className="mt-20 pt-10 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-blue-600" />
                    محصولات مشابه (شاید بپسندید)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((item) => (
                        <ProductCard 
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            price={item.price}
                            image={item.image}
                            slug={item.slug}
                       />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}