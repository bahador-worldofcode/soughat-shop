'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ShoppingCart, ChevronLeft, Loader2, Globe, FileText, ShieldCheck, ArrowLeft, AlertTriangle, Trash2, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import CryptoPayment from '@/components/CryptoPayment';

export default function CheckoutPage() {
  const { cart, totalPrice, getSymbol, convertPrice, currency } = useStore();
  // قیمت‌ها
  const displayTotal = totalPrice();
  const symbol = getSymbol();
  const totalBaseUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // قانون حداقل خرید
  const MIN_ORDER_AMOUNT_USD = 25;
  const minOrderDisplay = convertPrice(MIN_ORDER_AMOUNT_USD);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // مودال پاک کردن فرم
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

  // 1. لود کردن اطلاعات از حافظه مرورگر (فقط یکبار در شروع)
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

  // 2. ذخیره اتوماتیک در حافظه مرورگر با هر تغییر
  useEffect(() => {
    if (mounted) {
        localStorage.setItem('checkout_draft', JSON.stringify(formData));
    }
  }, [formData, mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // تابع پاک کردن فرم (دستی)
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
      alert('لطفاً تمام فیلدهای ستاره‌دار (*) را پر کنید.');
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
          totalPrice: totalBaseUSD, // قیمت دلاری
          displayFiatAmount: displayTotal, // قیمتی که مشتری دیده
          displayCurrency: currency, // واحد پولی که مشتری دیده
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'خطا در ارتباط با سرور');
      }

      if (result.id) {
        // موفقیت: پاک کردن پیش‌نویس چون سفارش ثبت شد
        localStorage.removeItem('checkout_draft');
        
        setOrderId(result.id);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error: any) {
      alert('خطا در ثبت سفارش: ' + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center font-[family-name:var(--font-vazir)]">
        <h1 className="text-xl font-bold text-gray-800">سبد خرید خالی است</h1>
        <Link href="/" className="text-blue-600 mt-4 block hover:underline">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  // --- محافظ امنیتی (Security Guard) ---
  if (totalBaseUSD < MIN_ORDER_AMOUNT_USD) {
    return (
        <div className="container mx-auto px-4 py-20 text-center font-[family-name:var(--font-vazir)] flex flex-col items-center">
            <div className="bg-amber-100 p-4 rounded-full mb-4">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">مبلغ سفارش کمتر از حد مجاز است</h1>
            <p className="text-gray-500 mt-2 max-w-md mx-auto leading-7">
                حداقل مبلغ خرید برای پردازش و ارسال به ایران <strong>{symbol} {minOrderDisplay}</strong> ({MIN_ORDER_AMOUNT_USD} USD) می‌باشد.
                <br/>
                لطفاً اقلام بیشتری به سبد خرید اضافه کنید.
            </p>
            <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-xl min-w-[200px]">
                <div className="text-xs text-gray-400 mb-1">جمع فعلی سبد</div>
                <div className="text-xl font-bold text-gray-800 dir-ltr font-mono">{symbol} {displayTotal}</div>
            </div>
            <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-xl mt-8 hover:bg-blue-700 transition-colors font-bold shadow-lg">
                بازگشت و تکمیل خرید
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-[family-name:var(--font-vazir)] relative">
      
      {/* مدال تایید پاک کردن */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">پاک کردن فرم؟</h3>
                    <p className="text-sm text-gray-500 leading-6">
                        آیا مطمئن هستید که می‌خواهید تمام اطلاعات وارد شده (آدرس و مشخصات) را پاک کنید؟ این کار قابل بازگشت نیست.
                    </p>
                </div>
                <div className="bg-gray-50 p-4 flex gap-3">
                    <button 
                        onClick={() => setShowClearModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-white transition-colors"
                    >
                        خیر، نگه دار
                    </button>
                    <button 
                        onClick={clearForm}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                    >
                        بله، پاک کن
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* نوار وضعیت مراحل */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto pb-2">
        <Link href="/cart" className="flex items-center hover:text-blue-600 whitespace-nowrap">
          <ShoppingCart className="h-4 w-4 ml-1" />
          سبد خرید
        </Link>
        <ChevronLeft className="h-4 w-4" />
        <span className={`${step === 1 ? 'font-bold text-blue-600' : 'text-gray-900'} whitespace-nowrap`}>اطلاعات ارسال</span>
        <ChevronLeft className="h-4 w-4" />
        <span className={`${step === 2 ? 'font-bold text-blue-600' : 'opacity-50'} whitespace-nowrap`}>پرداخت</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ستون راست (فرم و پرداخت) */}
        <div className="lg:col-span-2">
          
          {step === 1 ? (
            /* --- مرحله ۱: فرم اطلاعات --- */
            <>
              <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="text-green-600 h-7 w-7" />
                    تکمیل اطلاعات سفارش
                  </h1>
                  
                  {/* دکمه پاک کردن فرم */}
                  <button 
                    onClick={() => setShowClearModal(true)}
                    className="text-xs flex items-center gap-1 text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                    title="پاک کردن فرم"
                  >
                    <Trash2 className="h-4 w-4" />
                    پاک کردن فرم
                  </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* بخش ۱: اطلاعات فرستنده */}
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
                        <Globe className="h-5 w-5" />
                        ۱. اطلاعات شما (فرستنده)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">نام شما <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="senderName"
                                required
                                placeholder="نام کامل شما"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white"
                                onChange={handleInputChange}
                                value={formData.senderName}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">کشور محل اقامت <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="senderCountry"
                                required
                                placeholder="مثال: آلمان، کانادا"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white"
                                onChange={handleInputChange}
                                value={formData.senderCountry}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">شماره واتساپ / موبایل <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="senderPhone"
                                required
                                dir="ltr"
                                placeholder="+49 ..."
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-white text-left font-mono"
                                onChange={handleInputChange}
                                value={formData.senderPhone}
                            />
                        </div>
                    </div>
                </div>

                {/* بخش ۲: اطلاعات گیرنده */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        ۲. اطلاعات گیرنده (در ایران)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">نام گیرنده <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="receiverName"
                                required
                                placeholder="نام تحویل گیرنده"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                onChange={handleInputChange}
                                value={formData.receiverName}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">موبایل گیرنده <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="receiverPhone"
                                required
                                dir="ltr"
                                placeholder="0912..."
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors text-left font-mono"
                                onChange={handleInputChange}
                                value={formData.receiverPhone}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">استان و شهر <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="city"
                                required
                                placeholder="مثال: تهران، شهرک غرب"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                                onChange={handleInputChange}
                                value={formData.city}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">آدرس دقیق و پلاک <span className="text-red-500">*</span></label>
                            <textarea
                                name="address"
                                required
                                rows={2}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                                onChange={handleInputChange}
                                value={formData.address}
                            />
                        </div>
                    </div>
                </div>

                {/* بخش ۳: توضیحات */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                        <FileText className="h-5 w-5" />
                        ۳. توضیحات سفارش (اختیاری)
                    </h3>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-600">توضیحات تکمیلی</label>
                        <textarea
                            name="notes"
                            rows={3}
                            placeholder="متن کارت هدیه، ساعت تحویل خاص یا هر نکته‌ای که باید بدانیم..."
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
                            <span>در حال ثبت اطلاعات...</span>
                        </>
                    ) : (
                        <>
                            <span>تایید اطلاعات و رفتن به پرداخت</span>
                            <ArrowLeft className="h-5 w-5" />
                        </>
                    )}
                </button>
              </form>
            </>
          ) : (
            /* --- مرحله ۲: پرداخت --- */
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-600 h-7 w-7" />
                درگاه پرداخت کریپتو
              </h1>
              
              <CryptoPayment orderId={orderId} />
              
              <button 
                onClick={() => setStep(1)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-900 underline"
              >
                بازگشت و اصلاح مشخصات
              </button>
            </>
          )}

        </div>

        {/* ستون چپ: فاکتور */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">سفارش شما</h3>
              {step === 1 && (
                <Link href="/cart" className="text-xs text-blue-600 hover:underline">
                  ویرایش سبد
                </Link>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              {mounted && cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm bg-white/50 p-2 rounded border border-blue-100">
                  <span className="text-gray-700 line-clamp-1 flex-1 ml-2">{item.title}</span>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-xs text-gray-500">x{item.quantity}</span>
                    <span className="font-medium text-gray-900">
                        {symbol} {convertPrice(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-blue-200 pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-blue-800">
                 <span>هزینه ارسال</span>
                 <span className="text-green-600 font-bold">رایگان</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg text-blue-900 mt-2">
                <span>مبلغ قابل پرداخت</span>
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
                            <span>ثبت...</span>
                        </>
                    ) : (
                        <>
                            <span>تایید و پرداخت</span>
                            <ArrowLeft className="h-5 w-5" />
                        </>
                    )}
              </button>
            )}
            
            <p className="mt-4 text-center text-xs text-gray-400">
                تضمین بازگشت وجه در صورت نرسیدن کالا
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}