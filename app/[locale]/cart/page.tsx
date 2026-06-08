'use client';

import { Trash2, ArrowLeft, ShoppingBag, AlertTriangle, Plus, Minus, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

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
    <div className="container mx-auto px-4 py-10 font-[family-name:var(--font-vazir)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const displayTitle = isEn ? (item.title_en || item.title) : item.title;

            return (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 mx-auto sm:mx-0">
                  <img 
                    src={item.image} 
                    alt={displayTitle} 
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-1 text-center sm:text-start">
                        {displayTitle}
                    </h3>
                    {item.pricing_type !== 'currency' && (
                        <p className="mt-1 text-xs text-gray-500 text-center sm:text-start">
                          {t('unit_price')}: {symbol} {convertPrice(item.price).toFixed(2)}
                        </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 sm:gap-0">
                    
                    <div className="flex items-center">
                      {item.pricing_type === 'currency' ? (
                          <div className="relative">
                              <select
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                                  className="appearance-none bg-blue-50 border border-blue-200 text-blue-900 font-bold text-sm rounded-lg h-10 pl-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer dir-ltr"
                                  style={{ textAlign: 'center' }}
                              >
                                  {currencyAmounts.map((amt) => (
                                      <option key={amt} value={amt}>
                                          {amt} {tProduct('currency_unit')}
                                      </option>
                                  ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-blue-500">
                                  <ChevronDown className="h-4 w-4" />
                              </div>
                          </div>
                      ) : (
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                              <button 
                                  onClick={() => decreaseFromCart(item.id)}
                                  className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                  {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                              </button>
                              
                              <span className="w-8 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                              
                              <button 
                                  onClick={() => addToCart(item)}
                                  className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                              >
                                  <Plus className="h-4 w-4" />
                              </button>
                          </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="font-bold text-blue-600 text-lg">
                          {symbol} {convertPrice(item.price * item.quantity).toFixed(2)}
                        </span>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                          title={t('remove_tooltip')}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('bill_title')}</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('total_items')}</span>
                <span>{symbol} {displayTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('shipping_cost')}</span>
                <span className="text-green-600 font-bold">{t('free')}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">{t('payable_amount')}</span>
                <span className="text-xl font-bold text-blue-600">{symbol} {displayTotal}</span>
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
                            {t('min_order_desc', { current: `${symbol} ${displayTotal}` })}
                        </p>
                    </div>
                </div>
            )}

            <Link 
              href={isBelowMinimum ? '#' : '/checkout'}
              className={`w-full inline-flex items-center justify-center rounded-lg px-6 py-4 text-base font-bold text-white shadow-md transition-all gap-2 ${
                  isBelowMinimum 
                  ? 'bg-gray-400 cursor-not-allowed shadow-none pointer-events-none' 
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
              }`}
            >
              <span>{t('checkout_btn')}</span>
              {!isBelowMinimum && <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180' : ''}`} />}
            </Link>
            
            {!isBelowMinimum && (
                <p className="mt-4 text-center text-xs text-gray-400">
                {t('secure_payment')}
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}