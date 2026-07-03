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
  title_en?: string;
  price: number;
  image: string;
  description: string;
  features: string[];
  slug: string;
  pricing_type?: string; 
  weight?: number; 
}

interface RelatedItem {
    id: string;
    title: string;
    title_en?: string;
    price: number;
    image: string;
    slug: string;
    pricing_type?: string; 
    weight?: number; 
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
  
  const { convertPrice, getSymbol, addToCart, decreaseFromCart, removeFromCart, cart } = useStore();
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

  // یکپارچه سازی کارت سبد خرید: هوشمند برای تمام اسکرین‌ها بدون Floating 
  const AddToCartButtons = () => {
      
      if (product.pricing_type === 'currency') {
        const amounts = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 100];

        const handleCurrencyChange = (newQty: number) => {
            setCurrencyAmount(newQty);
            if (quantity > 0) {
                removeFromCart(product.id);
                for (let i = 0; i < newQty; i++) addToCart(product);
            }
        };

        const handleAddCurrency = () => {
             if (quantity === 0) {
                 for (let i = 0; i < currencyAmount; i++) addToCart(product);
             }
        };

        const handleFullRemove = () => {
            removeFromCart(product.id);
            setCurrencyAmount(1);
        };

        return (
            <div className="flex flex-col gap-4 w-full">
                <div className="relative w-full">
                    <label className="block text-xs md:text-sm font-bold text-gray-500 mb-2 md:mr-1">
                        {t('currency_label_desktop')}
                    </label>
                    <div className="relative">
                        <select 
                            value={currencyAmount} 
                            onChange={(e) => handleCurrencyChange(Number(e.target.value))}
                            className="w-full appearance-none bg-white border-2 border-blue-100 text-gray-800 font-black rounded-xl h-14 md:h-14 pl-4 pr-12 text-base md:text-lg focus:border-blue-500 focus:ring-0 transition-all cursor-pointer shadow-sm hover:shadow"
                            style={{direction: 'ltr', textAlign: 'left'}} 
                        >
                            {amounts.map(amt => (
                                <option key={amt} value={amt}>
                                    {amt} {t('currency_unit')}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-blue-600 bg-blue-50/80 rounded-r-xl border-l border-blue-100 rtl:rounded-l-xl rtl:rounded-r-none rtl:border-r rtl:border-l-0">
                            <ChevronDown className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50/80 px-4 py-3 rounded-xl border border-gray-200/60 shadow-inner">
                     <span className="text-xs md:text-sm text-gray-600 font-medium">{t('payable_label')}</span>
                     <span className="text-lg md:text-xl font-black text-green-600 font-mono tracking-tight">
                        {symbol} {typeof finalPrice === 'number' ? (finalPrice * currencyAmount).toFixed(2) : '...'}
                     </span>
                </div>

                {quantity > 0 ? (
                     <div className="flex items-center justify-between bg-blue-50/50 border border-blue-200 text-blue-800 rounded-xl px-4 md:px-5 font-bold h-14 md:h-14">
                        <span className="flex items-center gap-2 text-sm md:text-base">
                            <Check className="h-5 w-5 text-green-500" />
                            {currencyAmount} {t('in_cart_currency')}
                        </span>
                        <button onClick={handleFullRemove} className="text-xs md:text-sm bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                            {t('edit_remove')}
                        </button>
                     </div>
                ) : (
                    <button 
                        onClick={handleAddCurrency}
                        className="w-full font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(22,163,74,0.3)] bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white hover:-translate-y-1 active:scale-[0.98] h-14 text-base md:text-lg rounded-xl"
                    >
                        <Wallet className="h-5 w-5 md:h-6 md:w-6" /> 
                        {t('confirm_add')}
                    </button>
                )}
            </div>
        );
      }

      if (quantity > 0) {
          return (
            <div className="flex items-center justify-between bg-white border-2 border-blue-100 rounded-2xl p-1.5 shadow-sm h-14 md:h-16 w-full">
                <button onClick={() => decreaseFromCart(product.id)} className="h-full aspect-square flex items-center justify-center bg-gray-50/80 border border-gray-100 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-100 transition-all active:scale-[0.95]">
                    {quantity === 1 ? <Trash2 className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                </button>
                <div className="flex flex-col items-center px-4 flex-1">
                    <span className="text-xl md:text-2xl font-black text-blue-900 tabular-nums">{quantity}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-[-2px]">{t('in_cart')}</span>
                </div>
                <button onClick={() => addToCart(product)} className="h-full aspect-square flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-[0_4px_10px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all active:scale-[0.95]">
                    <Plus className="h-6 w-6" />
                </button>
            </div>
          );
      }
      return (
        <button 
            onClick={() => addToCart(product)} 
            className="w-full font-bold flex items-center justify-center gap-2 transition-all shadow-[0_6px_20px_rgba(37,99,235,0.25)] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:-translate-y-1 active:scale-[0.98] h-14 md:h-16 text-base md:text-lg rounded-2xl"
        >
            <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" /> 
            {t('add_to_cart')}
        </button>
      );
  };

  return (
    <div className="relative font-[family-name:var(--font-vazir)]">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500 items-start">
        
            {/* تصویر محصول */}
            <div className="md:col-span-5 relative">
                <div className="relative aspect-square bg-gray-50 md:bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm md:sticky md:top-24 group">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    {quantity > 0 && product.pricing_type !== 'currency' && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-sm md:text-base shadow-lg border-2 border-white animate-in zoom-in">
                            {quantity}
                        </div>
                    )}
                </div>
            </div>

            {/* جزئیات و خرید (Action Column) */}
            <div className="md:col-span-7 flex flex-col">
                
                {/* دسته‌بندی و ریویو */}
                <div className="mb-4 flex items-center justify-between px-1 md:px-0">
                    <Link 
                        href={`/products?category=${categorySlug}`} 
                        className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                    >
                        {categoryIcon ? (
                          <img src={categoryIcon} className="h-4 w-4 md:h-5 md:w-5 object-contain drop-shadow-sm" alt="" />
                        ) : (
                          <Tag className="h-3 w-3" />
                        )}
                        {categoryName}
                    </Link>
                    
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1.5 md:py-2 md:px-3 rounded-lg border border-gray-100 shadow-sm">
                        <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                        <span className="pt-0.5">{t('rating')}</span>
                    </div>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight md:leading-snug px-1 md:px-0">
                    {product.title}
                </h1>

                {/* THE GOLDEN FIX: Buy Box is now elegantly injected into the page flow for both Desktop and Mobile! */}
                <div className="bg-white p-5 md:p-6 lg:p-8 rounded-[2rem] border border-blue-50/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_35px_rgba(37,99,235,0.06)] transition-all mb-8 relative overflow-hidden">
                    {/* جلوه‌ی بصری (نور ملایم بکگراند باکس خرید) */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] pointer-events-none"></div>

                    {product.pricing_type !== 'currency' && (
                        <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                            <div>
                                <span className="text-gray-400 text-xs md:text-sm font-bold block mb-1 tracking-wide">{t('final_price_label')}</span>
                                <div className="text-3xl md:text-4xl font-black text-blue-600 font-mono tracking-tighter">
                                    {symbol} {typeof finalPrice === 'number' ? finalPrice.toFixed(2) : finalPrice}
                                </div>
                            </div>
                            
                            {/* آیکون‌های اعتماد در سمت چپ باکس */}
                            <div className="text-right flex flex-col items-end gap-1.5 opacity-90">
                                <div className="text-xs md:text-sm text-emerald-600 font-bold flex items-center gap-1.5 bg-emerald-50/50 px-2.5 py-1 rounded-md">
                                    <ShieldCheck className="h-4 w-4 md:h-5 md:w-5"/> 
                                    {t('health_guarantee')}
                                </div>
                                <div className="text-xs md:text-sm text-blue-500 font-bold flex items-center gap-1.5 bg-blue-50/50 px-2.5 py-1 rounded-md">
                                    <Truck className="h-4 w-4 md:h-5 md:w-5"/> 
                                    {t('free_shipping')}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="relative z-10">
                        {/* فقط یک خط و آن هم استدعای متد دکمه */}
                        <AddToCartButtons />
                    </div>

                    {/* بنر تضمین پرداختی پایین باکس دکمه */}
                    <div className="mt-5 p-3 md:p-4 bg-gradient-to-r from-emerald-50/60 to-teal-50/30 border border-emerald-100/50 rounded-xl flex items-start gap-3 relative z-10">
                        <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-[13px] md:text-sm font-bold text-emerald-900 mb-0.5 md:mb-1">
                                {t('crypto_guarantee_title')}
                            </h4>
                            <p className="text-[11px] md:text-xs text-emerald-700/80 leading-5 text-justify font-medium">
                                {t('crypto_guarantee_desc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ویژگی‌ها (Features) */}
                {product.features && product.features.length > 0 && (
                    <div className="mb-8 grid grid-cols-1 gap-2.5 px-1 md:px-0">
                        {product.features.map((feat, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm md:text-base text-gray-700 bg-gray-50/60 hover:bg-blue-50/40 p-3 rounded-xl border border-gray-100/80 transition-colors">
                                <div className="bg-white p-1 rounded-full text-green-500 shadow-[0_2px_10px_rgba(34,197,94,0.15)] flex-shrink-0 border border-green-100/50">
                                    <Check className="h-3 w-3 md:h-4 md:w-4" />
                                </div>
                                <span className="font-medium leading-relaxed">{feat}</span>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>

        {/* توضیحات کالا */}
        {product.description && (
            <div className="mt-8 md:mt-12 pt-10 border-t border-gray-100">
                <h3 className="font-black text-gray-900 mb-6 text-xl md:text-2xl flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"></span>
                    <FileText className="h-6 w-6 md:h-7 md:w-7 text-gray-400" />
                    {t('description')}
                </h3>
                
                <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-10 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                   <div 
                     className="
                       text-gray-600 leading-8 text-justify font-medium
                       [&>h2]:text-xl md:[&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-gray-800 [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:border-b [&>h2]:pb-2 [&>h2]:border-gray-50
                       [&>h3]:text-lg md:[&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-gray-700 [&>h3]:mb-3 [&>h3]:mt-6
                       [&>p]:mb-5 [&>p]:text-sm md:[&>p]:text-base
                       [&>strong]:text-gray-900 [&>strong]:font-bold
                       [&>ul]:list-disc [&>ul]:pr-6 [&>ul]:mb-6
                       [&>li]:mb-2
                     "
                     dangerouslySetInnerHTML={{ __html: product.description }}
                   />
                </div>
            </div>
        )}

        {/* محصولات مرتبط */}
        {relatedProducts.length > 0 && (
            <div className="mt-16 md:mt-20 pt-10 border-t border-gray-100">
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <LayoutGrid className="h-6 w-6 text-blue-600" />
                    {t('similar_products')}
                </h3>
                {/* تغییر چیدمان گرید محصولات مرتبط برای موبایل تا دو ستون به هم فشرده نشود و شیک به نظر برسد */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {relatedProducts.map((item) => (
                        <ProductCard 
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            title_en={item.title_en}
                            price={item.price}
                            image={item.image}
                            slug={item.slug}
                            pricing_type={item.pricing_type}
                            weight={item.weight}
                       />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}