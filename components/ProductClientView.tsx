'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ShoppingBag, Check, ShieldCheck, Truck, Star, Plus, Minus, Trash2, Tag, LayoutGrid, FileText, ChevronDown, Wallet } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ProductCard from './ProductCard';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  title: string;
  title_en?: string; // ✅ اضافه شد
  price: number;
  image: string;
  description: string;
  features: string[];
  slug: string;
  pricing_type?: string; 
}

interface RelatedItem {
    id: string;
    title: string;
    title_en?: string; // ✅ اضافه شد
    price: number;
    image: string;
    slug: string;
    pricing_type?: string; 
}

interface Props {
    product: Product;
    categoryName: string;
    categorySlug: string;
    categoryIcon?: string;
    relatedProducts: RelatedItem[];
}

export default function ProductClientView({ product, categoryName, categorySlug, categoryIcon, relatedProducts }: Props) {
  const t = useTranslations('Product');
  const { convertPrice, getSymbol, addToCart, decreaseFromCart, cart } = useStore();
  const [mounted, setMounted] = useState(false);
  
  const [currencyAmount, setCurrencyAmount] = useState<number>(1);

  useEffect(() => setMounted(true), []);

  const finalPrice = mounted ? convertPrice(product.price) : product.price;
  const symbol = mounted ? getSymbol() : '$';

  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    if (quantity > 0 && product.pricing_type === 'currency') {
        setCurrencyAmount(quantity);
    }
  }, [quantity, product.pricing_type]);

  const AddToCartButtons = ({ isMobile = false }: { isMobile?: boolean }) => {
      
      // حالت حواله
      if (product.pricing_type === 'currency') {
        const amounts = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 100];

        const handleCurrencyChange = (newQty: number) => {
            setCurrencyAmount(newQty);
            if (quantity > 0) {
                const diff = newQty - quantity;
                if (diff > 0) {
                    for (let i = 0; i < diff; i++) addToCart(product);
                } else if (diff < 0) {
                    for (let i = 0; i < Math.abs(diff); i++) decreaseFromCart(product.id);
                }
            }
        };

        const handleAddCurrency = () => {
             if (quantity === 0) {
                 for (let i = 0; i < currencyAmount; i++) addToCart(product);
             }
        };

        return (
            <div className={`flex flex-col gap-3 w-full ${isMobile ? 'p-1' : ''}`}>
                <div className="relative w-full">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 mr-1">
                        {isMobile ? t('currency_label_mobile') : t('currency_label_desktop')}
                    </label>
                    <div className="relative">
                        <select 
                            value={currencyAmount} 
                            onChange={(e) => handleCurrencyChange(Number(e.target.value))}
                            className={`w-full appearance-none bg-white border-2 border-blue-100 text-gray-800 font-black rounded-xl focus:border-blue-500 focus:ring-0 transition-all cursor-pointer ${isMobile ? 'h-12 pl-4 pr-10 text-base' : 'h-14 pl-4 pr-12 text-lg'}`}
                            style={{direction: 'ltr', textAlign: 'left'}} 
                        >
                            {amounts.map(amt => (
                                <option key={amt} value={amt}>
                                    {amt} {t('currency_unit')}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-blue-600 bg-blue-50 rounded-r-xl border-l border-blue-100 rtl:rounded-l-xl rtl:rounded-r-none rtl:border-r rtl:border-l-0">
                            <ChevronDown className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                     <span className="text-xs text-gray-500 font-medium">{t('payable_label')}</span>
                     <span className="text-lg font-black text-green-600 font-mono tracking-tight">
                        {symbol} {typeof finalPrice === 'number' ? (finalPrice * currencyAmount).toFixed(2) : '...'}
                     </span>
                </div>

                {quantity > 0 ? (
                     <div className={`flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 font-bold ${isMobile ? 'h-12' : 'h-14'}`}>
                        <span className="flex items-center gap-2 text-sm">
                            <Check className="h-5 w-5 text-green-600" />
                            {currencyAmount} {t('in_cart_currency')}
                        </span>
                        <button onClick={() => decreaseFromCart(product.id)} className="text-xs bg-white border border-blue-200 px-2 py-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors">
                            {t('edit_remove')}
                        </button>
                     </div>
                ) : (
                    <button 
                        onClick={handleAddCurrency}
                        className={`w-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-200 hover:-translate-y-1 active:scale-95 ${isMobile ? 'h-12 text-base rounded-xl' : 'h-14 rounded-xl text-lg'}`}
                    >
                        <Wallet className={isMobile ? "h-5 w-5" : "h-6 w-6"} /> 
                        {t('confirm_add')}
                    </button>
                )}
            </div>
        );
      }

      // حالت عادی
      if (quantity > 0) {
          return (
            <div className={`flex items-center justify-between bg-white border border-blue-200 rounded-xl p-1 shadow-inner ${isMobile ? 'h-12 w-full' : 'h-14 w-full'}`}>
                <button onClick={() => decreaseFromCart(product.id)} className="h-full aspect-square flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all active:scale-90">
                    {quantity === 1 ? <Trash2 className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                </button>
                <div className="flex flex-col items-center px-4">
                    <span className="text-lg font-black text-blue-900 tabular-nums">{quantity}</span>
                    {!isMobile && <span className="text-[9px] text-gray-400 font-medium">{t('in_cart')}</span>}
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
            {isMobile ? t('add_to_cart_short') : t('add_to_cart')}
        </button>
      );
  };

  return (
    <div className="pb-24 md:pb-0 relative font-[family-name:var(--font-vazir)]">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500 items-start">
        
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

            <div className="md:col-span-7 flex flex-col">
                
                <div className="mb-4 flex items-center justify-between">
                    <Link 
                        href={`/products?category=${categorySlug}`} 
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        {categoryIcon ? (
                          <img src={categoryIcon} className="h-4 w-4 object-contain" alt="" />
                        ) : (
                          <Tag className="h-3 w-3" />
                        )}
                        {categoryName}
                    </Link>
                    
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span>{t('rating')}</span>
                    </div>
                </div>

                <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-6 leading-snug">{product.title}</h1>

                <div className="hidden md:block bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8">
                    
                    {product.pricing_type !== 'currency' && (
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-gray-400 text-xs block mb-1">{t('final_price_label')}</span>
                                <div className="text-3xl font-black text-blue-700 font-mono tracking-tight">
                                    {symbol} {typeof finalPrice === 'number' ? finalPrice.toFixed(2) : finalPrice}
                                </div>
                            </div>
                            <div className="text-right hidden lg:block">
                                <div className="text-xs text-green-600 font-bold flex items-center gap-1 mb-1 justify-end"><ShieldCheck className="h-3 w-3"/> {t('health_guarantee')}</div>
                                <div className="text-xs text-blue-600 font-bold flex items-center gap-1 justify-end"><Truck className="h-3 w-3"/> {t('free_shipping')}</div>
                            </div>
                        </div>
                    )}
                    
                    <AddToCartButtons isMobile={false} />
                </div>

                {product.features && product.features.length > 0 && (
                    <div className="mb-8 grid grid-cols-1 gap-3">
                        {product.features.map((feat, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                                <div className="bg-white p-1 rounded-full text-green-500 shadow-sm flex-shrink-0"><Check className="h-3 w-3" /></div>
                                <span className="font-medium leading-6">{feat}</span>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>

        {product.description && (
            <div className="mt-12 pt-10 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-6 text-xl flex items-center gap-2">
                    <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                    <FileText className="h-6 w-6 text-gray-400" />
                    {t('description')}
                </h3>
                
                <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm">
                   <div 
                     className="
                       text-gray-600 leading-8 text-justify
                       [&>h2]:text-xl [&>h2]:font-black [&>h2]:text-gray-800 [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:border-b [&>h2]:pb-2 [&>h2]:border-gray-100
                       [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-gray-700 [&>h3]:mb-3 [&>h3]:mt-6
                       [&>p]:mb-4 [&>p]:text-sm md:[&>p]:text-base
                       [&>strong]:text-gray-900 [&>strong]:font-bold
                       [&>ul]:list-disc [&>ul]:pr-5 [&>ul]:mb-4
                       [&>li]:mb-1
                     "
                     dangerouslySetInnerHTML={{ __html: product.description }}
                   />
                </div>
            </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-[100] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center gap-4 max-w-md mx-auto">
                {product.pricing_type !== 'currency' && (
                    <div className="flex flex-col flex-1">
                        <span className="text-xs text-gray-400 mb-0.5">
                            {quantity > 0 ? t('final_price_label') : t('final_price_label')}
                        </span>
                        <span className="text-xl font-black text-blue-700 font-mono">
                            {symbol} {typeof finalPrice === 'number' ? (finalPrice * (quantity || 1)).toFixed(2) : finalPrice}
                        </span>
                    </div>
                )}
                
                <div className={product.pricing_type === 'currency' ? "w-full" : "w-[55%]"}>
                    <AddToCartButtons isMobile={true} />
                </div>
            </div>
        </div>

        {relatedProducts.length > 0 && (
            <div className="mt-20 pt-10 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-blue-600" />
                    {t('similar_products')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((item) => (
                        <ProductCard 
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            title_en={item.title_en} // ✅ ارسال title_en به کارت محصول
                            price={item.price}
                            image={item.image}
                            slug={item.slug}
                            pricing_type={item.pricing_type}
                       />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}