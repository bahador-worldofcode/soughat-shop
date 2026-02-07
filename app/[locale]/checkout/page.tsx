'use client';
import { useState, useEffect } from 'react';
import { MapPin, ShoppingCart, ChevronLeft, ChevronRight, Loader2, Globe, FileText, ShieldCheck, ArrowLeft, AlertTriangle, Trash2, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import CryptoPayment from '@/components/CryptoPayment';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';

export default function CheckoutPage() {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const isEn = locale === 'en';
  
  const { cart, totalPrice, getSymbol, convertPrice, currency } = useStore();
  
  const displayTotal = totalPrice();
  const symbol = getSymbol();
  const totalBaseUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const MIN_ORDER_AMOUNT_USD = 25;
  const minOrderDisplay = convertPrice(MIN_ORDER_AMOUNT_USD);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderCountry: '',
    receiverName: '',
    receiverPhone: '',
    city: '',
    address: '',
    notes: '', 
  });

  useEffect(() => {
    setMounted(true);
    const savedData = localStorage.getItem('checkout_draft');
    if (savedData) {
        try {
            setFormData(JSON.parse(savedData));
        } catch (e) {
            console.error('Error loading draft', e);
        }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
        localStorage.setItem('checkout_draft', JSON.stringify(formData));
    }
  }, [formData, mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    const emptyState = {
        senderName: '', senderPhone: '', senderCountry: '',
        receiverName: '', receiverPhone: '', city: '', address: '', notes: ''
    };
    setFormData(emptyState);
    localStorage.removeItem('checkout_draft');
    setShowClearModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.senderName.trim() ||
      !formData.senderPhone.trim() ||
      !formData.senderCountry.trim() ||
      !formData.receiverName.trim() ||
      !formData.receiverPhone.trim() ||
      !formData.city.trim() ||
      !formData.address.trim()
    ) {
      alert(t('errors.fill_all'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: formData.senderName,
          senderPhone: formData.senderPhone,
          senderCountry: formData.senderCountry,
          notes: formData.notes,
          receiverName: formData.receiverName,
          receiverPhone: formData.receiverPhone,
          city: formData.city,
          address: formData.address,
          items: cart,
          totalPrice: totalBaseUSD, 
          displayFiatAmount: displayTotal, 
          displayCurrency: currency, 
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || t('errors.server_error'));
      }

      if (result.id) {
        localStorage.removeItem('checkout_draft');
        setOrderId(result.id);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error: any) {
      alert(t('errors.server_error') + ': ' + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center font-[family-name:var(--font-vazir)]">
        <h1 className="text-xl font-bold text-gray-800">{t('empty_cart')}</h1>
        <Link href="/" className="text-blue-600 mt-4 block hover:underline">{t('back_home')}</Link>
      </div>
    );
  }

  if (totalBaseUSD < MIN_ORDER_AMOUNT_USD) {
    return (
        <div className="container mx-auto px-4 py-20 text-center font-[family-name:var(--font-vazir)] flex flex-col items-center">
            <div className="bg-amber-100 p-4 rounded-full mb-4">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">{t('min_order_error')}</h1>
            <p className="text-gray-500 mt-2 max-w-md mx-auto leading-7">
                {t('min_order_msg', { amount: MIN_ORDER_AMOUNT_USD })}
                <br/>
            </p>
            <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-xl min-w-[200px]">
                <div className="text-xs text-gray-400 mb-1">{t('current_total')}</div>
                <div className="text-xl font-bold text-gray-800 dir-ltr font-mono">{symbol} {displayTotal}</div>
            </div>
            <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl mt-8 hover:bg-blue-700 transition-colors font-bold shadow-lg">
                {t('back_products')}
            </Link>
        </div>
    );
  }

  const ChevronIcon = isEn ? ChevronRight : ChevronLeft;

  return (
    <div className="container mx-auto px-4 py-8 font-[family-name:var(--font-vazir)] relative">
      
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{t('modal.title')}</h3>
                    <p className="text-sm text-gray-500 leading-6">
                        {t('modal.desc')}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 flex gap-3">
                    <button 
                        onClick={() => setShowClearModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-white transition-colors"
                    >
                        {t('modal.no')}
                    </button>
                    <button 
                        onClick={clearForm}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                    >
                        {t('modal.yes')}
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto pb-2">
        <Link href="/cart" className="flex items-center hover:text-blue-600 whitespace-nowrap">
          <ShoppingCart className={`h-4 w-4 ${isEn ? 'mr-1' : 'ml-1'}`} />
          {t('cart_summary.edit')}
        </Link>
        <ChevronIcon className="h-4 w-4" />
        <span className={`${step === 1 ? 'font-bold text-blue-600' : 'text-gray-900'} whitespace-nowrap`}>{t('steps.info')}</span>
        <ChevronIcon className="h-4 w-4" />
        <span className={`${step === 2 ? 'font-bold text-blue-600' : 'opacity-50'} whitespace-nowrap`}>{t('steps.payment')}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          
          {step === 1 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="text-green-600 h-7 w-7" />
                    {t('title')}
                  </h1>
                  
                  <button 
                    onClick={() => setShowClearModal(true)}
                    className="text-xs flex items-center gap-1 text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('clear_form')}
                  </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
                        <Globe className="h-5 w-5" />
                        {t('sender.title')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">{t('sender.name')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="senderName"
                                required
                                placeholder={t('sender.name_ph')}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white"
                                onChange={handleInputChange}
                                value={formData.senderName}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">{t('sender.country')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="senderCountry"
                                required
                                placeholder={t('sender.country_ph')}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white"
                                onChange={handleInputChange}
                                value={formData.senderCountry}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">{t('sender.phone')} <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="senderPhone"
                                required
                                dir="ltr"
                                placeholder={t('sender.phone_ph')}
                                className={`w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white font-mono text-left`}
                                onChange={handleInputChange}
                                value={formData.senderPhone}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        {t('receiver.title')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">{t('receiver.name')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="receiverName"
                                required
                                placeholder={t('receiver.name_ph')}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                onChange={handleInputChange}
                                value={formData.receiverName}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">{t('receiver.phone')} <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="receiverPhone"
                                required
                                dir="ltr"
                                placeholder={t('receiver.phone_ph')}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors text-left font-mono"
                                onChange={handleInputChange}
                                value={formData.receiverPhone}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">{t('receiver.city')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="city"
                                required
                                placeholder={t('receiver.city_ph')}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                onChange={handleInputChange}
                                value={formData.city}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">{t('receiver.address')} <span className="text-red-500">*</span></label>
                            <textarea
                                name="address"
                                required
                                rows={2}
                                placeholder={t('receiver.address_ph')}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                                onChange={handleInputChange}
                                value={formData.address}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                        <FileText className="h-5 w-5" />
                        {t('note.title')}
                    </h3>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">{t('note.label')}</label>
                        <textarea
                            name="notes"
                            rows={3}
                            placeholder={t('note.ph')}
                            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white transition-colors"
                            onChange={handleInputChange}
                            value={formData.notes}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full hidden lg:flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all hover:-translate-y-1"
                  >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{t('btn_submitting')}</span>
                        </>
                    ) : (
                        <>
                            <span>{t('btn_submit')}</span>
                            <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180' : ''}`} />
                        </>
                    )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-600 h-7 w-7" />
                {t('btn_pay_title')}
              </h1>
              
              <CryptoPayment orderId={orderId} />
              
              <button 
                onClick={() => setStep(1)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-900 underline"
              >
                {t('btn_back')}
              </button>
            </>
          )}

        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">{t('cart_summary.title')}</h3>
              {step === 1 && (
                <Link href="/cart" className="text-xs text-blue-600 hover:underline">
                  {t('cart_summary.edit')}
                </Link>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              {mounted && cart.map((item) => {
                // ✅ لاجیک هوشمند نام محصول در خلاصه فاکتور
                const displayTitle = isEn ? (item.title_en || item.title) : item.title;
                
                return (
                  <div key={item.id} className="flex justify-between text-sm bg-white/50 p-2 rounded border border-blue-100">
                    <span className="text-gray-700 line-clamp-1 flex-1 ml-2 text-start">{displayTitle}</span>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-xs text-gray-500">x{item.quantity}</span>
                      <span className="font-medium text-gray-900">
                          {symbol} {convertPrice(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-blue-200 pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-blue-800">
                 <span>{t('cart_summary.shipping')}</span>
                 <span className="text-green-600 font-bold">{t('cart_summary.free')}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg text-blue-900 mt-2">
                <span>{t('cart_summary.total')}</span>
                <span>{mounted ? `${symbol} ${displayTotal}` : '...'}</span>
              </div>
            </div>

            {step === 1 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex lg:hidden items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-all mt-6"
              >
                 {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{t('btn_submitting')}</span>
                        </>
                    ) : (
                        <>
                            <span>{t('btn_submit')}</span>
                            <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180' : ''}`} />
                        </>
                    )}
              </button>
            )}
            
            <p className="mt-4 text-center text-xs text-gray-400">
                {t('cart_summary.guarantee')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}