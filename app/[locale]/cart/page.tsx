'use client';

import { Trash2, ArrowLeft, ShoppingBag, AlertTriangle, Plus, Minus, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';

export default function CartPage() {
  const t = useTranslations('Cart');
  const tProduct = useTranslations('Product');
  const locale = useLocale();
  const isEn = locale === 'en';

  const { cart, removeFromCart, addToCart, decreaseFromCart, updateItemQuantity, totalPrice, getSymbol, convertPrice } = useStore();
  
  const displayTotal = totalPrice();
  const symbol = getSymbol();

  const totalBaseUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const MIN_ORDER_AMOUNT_USD = 25;
  
  const isBelowMinimum = totalBaseUSD < MIN_ORDER_AMOUNT_USD;
  const minOrderDisplay = convertPrice(MIN_ORDER_AMOUNT_USD);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currencyAmounts = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 100];

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center font-[family-name:var(--font-vazir)]">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('empty_title')}</h1>
        <p className="text-gray-500 mb-8">{t('empty_desc')}</p>
        <Link 
          href="/products" 
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          {t('back_to_store')}
        </Link>
      </div>
    );
  }

  return (
    // پدینگ پایین موبایل عمداً بزرگ‌تر است تا نوار شناور جمع‌کل (پایین صفحه)
    // آخرین آیتم سبد را نپوشاند. در دسکتاپ آن نوار اصلاً رندر نمی‌شود، پس نیازی نیست.
    <div className="container mx-auto px-4 py-8 lg:py-10 pb-40 lg:pb-10 font-[family-name:var(--font-vazir)]">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <span className="text-sm text-gray-400 font-medium">
          {t('total_items')}: {cart.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => {
            const displayTitle = isEn ? (item.title_en || item.title) : item.title;

            return (
              <div key={item.id} className="relative flex gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">

                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-2.5 end-2.5 h-8 w-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-colors"
                  title={t('remove_tooltip')}
                  aria-label={t('remove_tooltip')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                  <Image
                    src={item.image}
                    alt={displayTitle}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 min-w-0 flex-col justify-between pe-8">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 text-start leading-snug">
                        {displayTitle}
                    </h3>
                    {item.pricing_type !== 'currency' && (
                        <p className="mt-1 text-xs text-gray-500 text-start">
                          {t('unit_price')}: {symbol} {convertPrice(item.price).toFixed(2)}
                        </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 gap-3">
                    
                    <div className="flex items-center">
                      {item.pricing_type === 'currency' ? (
                          <div className="relative">
                              <select
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                                  className="appearance-none bg-blue-50 border border-blue-200 text-blue-900 font-bold text-sm rounded-lg h-9 ps-3 pe-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer dir-ltr"
                                  style={{ textAlign: 'center' }}
                              >
                                  {currencyAmounts.map((amt) => (
                                      <option key={amt} value={amt}>
                                          {amt} {tProduct('currency_unit')}
                                      </option>
                                  ))}
                              </select>
                              <div className="absolute inset-y-0 end-0 flex items-center px-2 pointer-events-none text-blue-500">
                                  <ChevronDown className="h-4 w-4" />
                              </div>
                          </div>
                      ) : (
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                              <button 
                                  onClick={() => decreaseFromCart(item.id)}
                                  className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-colors"
                              >
                                  {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                              </button>
                              
                              <span className="w-8 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                              
                              <button 
                                  onClick={() => addToCart(item)}
                                  className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-green-600 hover:bg-green-50 active:scale-95 transition-colors"
                              >
                                  <Plus className="h-4 w-4" />
                              </button>
                          </div>
                      )}
                    </div>

                    <span className="font-bold text-blue-600 text-base sm:text-lg whitespace-nowrap">
                      {symbol} {convertPrice(item.price * item.quantity).toFixed(2)}
                    </span>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('bill_title')}</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('total_items')}</span>
                <span>{symbol} {displayTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('shipping_cost')}</span>
                <span className="text-green-600 font-bold">{t('free')}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">{t('payable_amount')}</span>
                <span className="text-xl font-bold text-blue-600">{symbol} {displayTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-start">{t('calc_note')}</p>
            </div>

            {isBelowMinimum && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2 text-amber-800">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-bold">
                            {t('min_order_title', { amount: `${symbol} ${minOrderDisplay.toFixed(2)}` })}
                        </p>
                        <p className="text-xs mt-1 opacity-80 leading-5">
                            {t('min_order_desc', { current: `${symbol} ${displayTotal.toFixed(2)}` })}
                        </p>
                    </div>
                </div>
            )}

            {/* روی دسکتاپ دکمه اصلی همین‌جاست. روی موبایل، نوار شناور پایین صفحه
                (که همیشه در معرض دید است) همین نقش را ایفا می‌کند، برای همین
                این دکمه را در موبایل مخفی می‌کنیم تا تکراری و شلوغ نشود. */}
            <Link 
              href={isBelowMinimum ? '#' : '/checkout'}
              className={`hidden lg:inline-flex w-full items-center justify-center rounded-lg px-6 py-4 text-base font-bold text-white shadow-md transition-all gap-2 ${
                  isBelowMinimum 
                  ? 'bg-gray-400 cursor-not-allowed shadow-none pointer-events-none' 
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
              }`}
            >
              <span>{t('checkout_btn')}</span>
              {!isBelowMinimum && <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180' : ''}`} />}
            </Link>
            
            {!isBelowMinimum && (
                <p className="mt-4 text-center text-xs text-gray-400 hidden lg:block">
                {t('secure_payment')}
                </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== نوار شناور موبایل: جمع‌کل + دکمه ادامه، همیشه در دسترس، دقیقاً بالای نوار پیمایش پایین ===== */}
      <div
        className="lg:hidden fixed inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 pt-3 pb-3"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 font-medium leading-none mb-1">{t('payable_amount')}</p>
            <p className="text-lg font-bold text-blue-600 leading-none whitespace-nowrap">
              {symbol} {displayTotal.toFixed(2)}
            </p>
          </div>

          <Link
            href={isBelowMinimum ? '#' : '/checkout'}
            className={`flex-1 max-w-[65%] inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all ${
              isBelowMinimum
                ? 'bg-gray-400 cursor-not-allowed shadow-none pointer-events-none'
                : 'bg-green-600 hover:bg-green-700 active:scale-[0.98]'
            }`}
          >
            <span className="truncate">{t('checkout_btn')}</span>
            {!isBelowMinimum && <ArrowLeft className={`h-4 w-4 flex-shrink-0 ${isEn ? 'rotate-180' : ''}`} />}
          </Link>
        </div>

        {isBelowMinimum && (
          <p className="mt-2 text-[11px] text-amber-700 text-center leading-5">
            {t('min_order_title', { amount: `${symbol} ${minOrderDisplay.toFixed(2)}` })}
          </p>
        )}
      </div>
    </div>
  );
}