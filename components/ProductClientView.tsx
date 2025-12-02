'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ShoppingBag, Check, ShieldCheck, Truck, Star, Plus, Minus, Trash2, Tag, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import ProductCard from './ProductCard'; // ایمپورت کامپوننت کارت محصول

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  features: string[];
  slug: string; // اسلاگ برای لینک دادن نیازه
}

// اینترفیس ساده برای محصولات مرتبط
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

  return (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* بخش تصویر */}
        <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-sm group">
            <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            {quantity > 0 && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white animate-in zoom-in">
                    {quantity}
                </div>
            )}
        </div>

        {/* بخش اطلاعات */}
        <div className="flex flex-col">
            
            {/* Breadcrumb (دسته بندی) */}
            <div className="mb-4">
                <Link 
                    href={`/products?category=${categorySlug}`} 
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <Tag className="h-3 w-3" />
                    {categoryName}
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-snug">{product.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full w-fit border border-gray-100">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-gray-700">۵.۰</span>
                    <span className="text-xs">(تضمین اصالت و کیفیت)</span>
                </div>
            </div>

            {/* قیمت */}
            <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-2xl border border-blue-100 flex items-center justify-between mb-8 shadow-sm">
                <div><span className="text-gray-500 text-xs block mb-1">قیمت نهایی (شامل ارسال):</span></div>
                <div className="text-3xl font-bold text-blue-700 font-mono tracking-tight">
                    {symbol} {typeof finalPrice === 'number' ? finalPrice.toFixed(2) : finalPrice}
                </div>
            </div>

            {/* ویژگی‌ها */}
            {product.features && product.features.length > 0 && (
                <div className="mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2"><Check className="h-5 w-5 text-green-600" /> ویژگی‌های محصول:</h3>
                    <ul className="space-y-2">
                        {product.features.map((feat, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700 leading-6">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                {feat}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* توضیحات */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-3 text-lg border-b pb-2">توضیحات</h3>
                <div className="text-sm md:text-base">{renderDescription(product.description)}</div>
            </div>

            {/* کنترل‌های خرید */}
            <div className="mt-8 space-y-4">
                {quantity > 0 ? (
                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-2 shadow-xl shadow-blue-100/50 animate-in fade-in zoom-in duration-200">
                        <button onClick={() => decreaseFromCart(product.id)} className="w-14 h-12 flex items-center justify-center bg-gray-50 text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100 active:scale-95">
                            {quantity === 1 ? <Trash2 className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                        </button>
                        <div className="flex flex-col items-center px-4">
                            <span className="text-xl font-black text-gray-800 tabular-nums">{quantity}</span>
                            <span className="text-[10px] text-gray-400 font-medium">عدد در سبد</span>
                        </div>
                        <button onClick={() => addToCart(product)} className="w-14 h-12 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">
                            <Plus className="h-6 w-6" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => addToCart(product)} className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200 hover:-translate-y-1 active:scale-95">
                        <ShoppingBag className="h-6 w-6" /> افزودن به سبد خرید
                    </button>
                )}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 text-center bg-gray-50 py-3 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-center gap-1 font-medium"><ShieldCheck className="h-4 w-4 text-green-600"/> ضمانت بازگشت وجه</div>
                    <div className="flex items-center justify-center gap-1 font-medium"><Truck className="h-4 w-4 text-blue-600"/> ارسال رایگان به ایران</div>
                </div>
            </div>
        </div>
        </div>

        {/* --- بخش جدید: محصولات پیشنهادی --- */}
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
    </>
  );
}