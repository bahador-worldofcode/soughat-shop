'use client';
import { useState, useEffect, useRef } from 'react';
import { MapPin, ShoppingCart, ChevronLeft, ChevronRight, Loader2, Globe, FileText, ShieldCheck, ArrowLeft, AlertTriangle, Trash2, XCircle, Info, Star, Wand2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import CryptoPayment from '@/components/CryptoPayment';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

// امضای یکتای وضعیت فعلی سبد خرید (کدام محصولات، با چه تعدادی).
// این امضا در لحظه‌ی ثبت سفارش ذخیره می‌شود تا بعداً بتوانیم بفهمیم آیا
// سبد خرید از آن لحظه تغییر کرده یا نه. اگر تغییر کرده باشد، یعنی سفارشِ
// در انتظار پرداختِ قبلی دیگر با سبد خرید فعلی هم‌خوانی ندارد و نباید
// کاربر را مستقیم به صفحه‌ی پرداخت با مبلغ قدیمی برد.
interface SavedAddress {
  id: string;
  label: string;
  receiver_name: string;
  receiver_phone: string;
  city: string;
  address: string;
  is_default: boolean;
}

function getCartSignature(items: { id: string; quantity: number }[]) {
  if (!items || items.length === 0) return '';
  return items
    .map((item) => `${item.id}:${item.quantity}`)
    .sort()
    .join('|');
}

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

  // آیا در حال ادامه‌ی سفارشی هستیم که پیش‌تر (قبل از این بازدید) ثبت شده بود؟
  const [resumedOrder, setResumedOrder] = useState(false);
  // آیا سفارش قبلی به‌خاطر تغییر سبد خرید نامعتبر شد و کنار گذاشته شد؟
  const [cartChangedNotice, setCartChangedNotice] = useState(false);
  // برای اینکه منطق بازیابی سفارش معلق فقط یک بار به‌ازای هر تصمیم قطعی اجرا شود
  const pendingResolvedRef = useRef(false);

  // استیت‌های جدید برای مدیریت خطاهای فرم
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [globalError, setGlobalError] = useState('');

  // آدرس‌های ذخیره‌شده‌ی کاربر (فقط اگر لاگین باشد) — برای انتخاب سریع مثل اسنپ
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[] | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('');

  // اطلاعات پروفایل کاربر (نام/تلفن/کشور) — برای پرکردن خودکار بخش «فرستنده»
  const [profileInfo, setProfileInfo] = useState<{
    full_name: string | null;
    phone: string | null;
    country: string | null;
  } | null>(null);

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

  // بازیابی پیش‌نویس فرم بعد از رفرش یا بازگشت به این صفحه
  useEffect(() => {
    const savedData = localStorage.getItem('checkout_draft');
    if (savedData) {
        try {
            setFormData(JSON.parse(savedData));
        } catch (e) {
            console.error('Error loading draft', e);
        }
    }
    setMounted(true);
  }, []);

  // اگر کاربر لاگین باشد، آدرس‌های ذخیره‌شده‌اش را می‌خوانیم تا بتواند
  // به‌جای تایپ دوباره، فقط یکی را از بین آدرس‌های قبلی انتخاب کند.
  // همزمان اطلاعات خودِ کاربر (نام/تلفن/کشور) را هم می‌خوانیم تا بخش
  // «فرستنده» بتواند با یک کلیک از روی پروفایلش پر شود.
  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session?.user) return;
      setIsLoggedIn(true);

      const [{ data: addresses }, { data: profileData }] = await Promise.all([
        (supabaseBrowser.from('saved_addresses') as any)
          .select('id, label, receiver_name, receiver_phone, city, address, is_default')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false }),
        (supabaseBrowser.from('profiles') as any)
          .select('full_name, phone, country')
          .eq('id', session.user.id)
          .single(),
      ]);

      if (addresses) setSavedAddresses(addresses as SavedAddress[]);
      if (profileData) setProfileInfo(profileData);
    };
    loadUserData();
  }, []);

  const fillSenderFromProfile = () => {
    if (!profileInfo) return;
    setFormData((prev) => ({
      ...prev,
      senderName: profileInfo.full_name || prev.senderName,
      senderPhone: profileInfo.phone || prev.senderPhone,
      senderCountry: profileInfo.country || prev.senderCountry,
    }));
    setFormErrors((prev) => ({ ...prev, senderName: false, senderPhone: false, senderCountry: false }));
  };

  // همین که اطلاعات پروفایل رسید، اگر بخش «فرستنده» هنوز خالی بود (یعنی
  // پیش‌نویسی از قبل نداشت)، خودکار با اطلاعات خودِ کاربر پر می‌شود —
  // حتی سریع‌تر از یک کلیک.
  useEffect(() => {
    if (!mounted || !profileInfo) return;
    const alreadyFilled =
      formData.senderName.trim() || formData.senderPhone.trim() || formData.senderCountry.trim();
    if (alreadyFilled) return;
    fillSenderFromProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, profileInfo]);

  const applySavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setSaveNewAddress(false);
    setFormData((prev) => ({
      ...prev,
      receiverName: addr.receiver_name,
      receiverPhone: addr.receiver_phone,
      city: addr.city,
      address: addr.address,
    }));
    setFormErrors((prev) => ({
      ...prev,
      receiverName: false,
      receiverPhone: false,
      city: false,
      address: false,
    }));
  };

  // وقتی هم آدرس‌های ذخیره‌شده لود شدند و هم پیش‌نویس فرم بررسی شد، اگر فرم
  // هنوز خالی بود (یعنی کاربر قبلاً چیزی تایپ نکرده)، آدرس پیش‌فرض را خودکار
  // پر می‌کنیم — دقیقاً همان حسی که در اسنپ موقع باز کردن صفحه سفارش داری.
  useEffect(() => {
    if (!mounted || !savedAddresses || savedAddresses.length === 0) return;
    const alreadyFilled = formData.receiverName.trim() || formData.address.trim();
    if (alreadyFilled) return;
    const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
    applySavedAddress(defaultAddr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, savedAddresses]);

  // تصمیم‌گیری درباره‌ی سفارش معلق (pending_order_id):
  // این افکت به‌عمد به «cart» وابسته است و فقط یک بار run نمی‌شود، چون سبد
  // خرید از localStorage به‌صورت async هیدریت می‌شود و ممکن است در همان
  // اولین رندر هنوز آماده نباشد. وقتی currentSig هنوز خالی است (یعنی هنوز
  // معلوم نیست سبد واقعاً خالی است یا هنوز هیدریت نشده) صبر می‌کنیم و کاری
  // انجام نمی‌دهیم؛ به‌محض این‌که سبد واقعی در دسترس باشد، همین افکت دوباره
  // اجرا و تصمیم قطعی گرفته می‌شود.
  useEffect(() => {
    if (!mounted || pendingResolvedRef.current) return;

    const pendingOrderId = localStorage.getItem('pending_order_id');
    if (!pendingOrderId) {
      pendingResolvedRef.current = true;
      return;
    }

    const currentSig = getCartSignature(cart);
    if (!currentSig) return; // سبد هنوز هیدریت نشده؛ در تیک بعدی دوباره امتحان می‌کنیم

    const pendingSig = localStorage.getItem('pending_order_cart_sig') || '';

    if (pendingSig === currentSig) {
      // سبد خرید همان چیزی است که موقع ثبت این سفارش بود؛ ادامه‌ی امن به مرحله پرداخت
      setOrderId(pendingOrderId);
      setStep(2);
      setResumedOrder(true);
    } else {
      // سبد خرید از آخرین ثبت تغییر کرده (یا خالی شده)؛ این سفارش معلق دیگر
      // معتبر نیست چون مبلغش با سبد فعلی هم‌خوانی ندارد. آن را کنار می‌گذاریم
      // تا کاربر با اطلاعات فعلی دوباره ثبت کند، به‌جای این‌که ناخواسته
      // مبلغ قدیمی را در صفحه پرداخت ببیند.
      localStorage.removeItem('pending_order_id');
      localStorage.removeItem('pending_order_cart_sig');
      setCartChangedNotice(true);
    }

    pendingResolvedRef.current = true;
  }, [mounted, cart]);

  useEffect(() => {
    if (mounted) {
        localStorage.setItem('checkout_draft', JSON.stringify(formData));
    }
  }, [formData, mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // اگر فیلدی قبلا ارور داشت، با تایپ کردن کاربر ارور رو پاک کن
    if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: false }));
    }
    // اگر کاربر بعد از انتخاب یک آدرس ذخیره‌شده، دستی یکی از فیلدهای گیرنده
    // را ویرایش کند، دیگر آن چیپ را انتخاب‌شده نشان نمی‌دهیم (چون دیگر دقیقاً
    // همان آدرس نیست).
    if (['receiverName', 'receiverPhone', 'city', 'address'].includes(name) && selectedAddressId) {
      setSelectedAddressId(null);
    }
  };

  const clearForm = () => {
    const emptyState = {
        senderName: '', senderPhone: '', senderCountry: '',
        receiverName: '', receiverPhone: '', city: '', address: '', notes: ''
    };
    setFormData(emptyState);
    setFormErrors({});
    setGlobalError('');
    setSelectedAddressId(null);
    setSaveNewAddress(false);
    setNewAddressLabel('');
    localStorage.removeItem('checkout_draft');
    setShowClearModal(false);
  };

  const handleGoBack = () => {
    // اگر کاربر خواست برگرده اطلاعات رو اصلاح کنه، سفارش قبلی رو از لوکال پاک می‌کنیم
    // توجه: عمداً «checkout_draft» را پاک نمی‌کنیم، چون همان اطلاعاتی است که
    // کاربر قرار است الان ویرایش کند؛ پاک کردنش دقیقاً همان باگ گم‌شدن اطلاعات بود.
    localStorage.removeItem('pending_order_id');
    localStorage.removeItem('pending_order_cart_sig');
    setResumedOrder(false);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    
    // اعتبارسنجی دستی (Validation) برای تجربه کاربری بهتر
    const errors: Record<string, boolean> = {};
    if (!formData.senderName.trim()) errors.senderName = true;
    if (!formData.senderPhone.trim()) errors.senderPhone = true;
    if (!formData.senderCountry.trim()) errors.senderCountry = true;
    if (!formData.receiverName.trim()) errors.receiverName = true;
    if (!formData.receiverPhone.trim()) errors.receiverPhone = true;
    if (!formData.city.trim()) errors.city = true;
    if (!formData.address.trim()) errors.address = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setGlobalError(t('errors.fill_all'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      // اگر کاربر با گوگل لاگین کرده، توکنش را می‌فرستیم تا سرور بتواند
      // این سفارش را به حسابش وصل کند (برای تب «سفارش‌های من» در پروفایل).
      // اگر لاگین نکرده باشد (مهمان)، این مقدار خالی می‌ماند و سفارش
      // دقیقاً مثل قبل و بدون هیچ مشکلی ثبت می‌شود.
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
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
        // توجه: عمداً «checkout_draft» را اینجا پاک نمی‌کنیم. این دقیقاً همان
        // خطی بود که باعث می‌شد اگر کاربر بعداً به سبد خرید برگردد و دوباره
        // به این صفحه بیاید، فرم خالی نشانش داده شود. پیش‌نویس فقط وقتی پاک
        // می‌شود که پرداخت واقعاً نهایی شود (در کامپوننت پرداخت کریپتو).
        localStorage.setItem('pending_order_id', result.id);
        localStorage.setItem('pending_order_cart_sig', getCartSignature(cart));

        // اگر کاربر لاگین بود و تیک «ذخیره این آدرس» را زده بود، آدرس گیرنده
        // را در دفترچه آدرسش ذخیره می‌کنیم تا دفعه‌ی بعد نیازی به تایپ دوباره نباشد.
        if (isLoggedIn && saveNewAddress && newAddressLabel.trim() && session?.user) {
          (supabaseBrowser.from('saved_addresses') as any)
            .insert([
              {
                user_id: session.user.id,
                label: newAddressLabel.trim(),
                receiver_name: formData.receiverName,
                receiver_phone: formData.receiverPhone,
                city: formData.city,
                address: formData.address,
                is_default: !savedAddresses || savedAddresses.length === 0,
              },
            ])
            .then(() => {});
        }

        setOrderId(result.id);
        setStep(2);
        setResumedOrder(false);
        setCartChangedNotice(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error: any) {
      setGlobalError(t('errors.server_error') + ': ' + error.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <div className="text-xl font-bold text-gray-800 dir-ltr font-mono">{symbol} {displayTotal.toFixed(2)}</div>
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

              {/* اطلاع‌رسانی وقتی سفارشِ در انتظار پرداخت قبلی، به‌خاطر تغییر سبد خرید کنار گذاشته شده */}
              {cartChangedNotice && (
                <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-bold leading-6">{t('cart_changed_notice')}</span>
                </div>
              )}

              {/* باکس نمایش خطای سراسری */}
              {globalError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in">
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-bold">{globalError}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} noValidate className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between gap-3 mb-4 border-b border-blue-200 pb-2">
                      <h3 className="font-bold text-blue-800 flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          {t('sender.title')}
                      </h3>
                      {isLoggedIn && profileInfo && (profileInfo.full_name || profileInfo.phone || profileInfo.country) && (
                        <button
                          type="button"
                          onClick={fillSenderFromProfile}
                          className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          {t('sender.fill_from_profile')}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">{t('sender.name')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="senderName"
                                placeholder={t('sender.name_ph')}
                                className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors ${formErrors.senderName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white focus:border-blue-500'}`}
                                onChange={handleInputChange}
                                value={formData.senderName}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">{t('sender.country')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="senderCountry"
                                placeholder={t('sender.country_ph')}
                                className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors ${formErrors.senderCountry ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white focus:border-blue-500'}`}
                                onChange={handleInputChange}
                                value={formData.senderCountry}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">{t('sender.phone')} <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="senderPhone"
                                dir="ltr"
                                placeholder={t('sender.phone_ph')}
                                className={`w-full rounded-lg border p-3 text-sm outline-none font-mono text-left transition-colors ${formErrors.senderPhone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white focus:border-blue-500'}`}
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

                    {/* انتخاب سریع از آدرس‌های ذخیره‌شده — فقط برای کاربر لاگین‌شده */}
                    {savedAddresses && savedAddresses.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs text-gray-500 mb-2">{t('receiver.saved_addresses_hint')}</p>
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                          {savedAddresses.map((addr) => (
                            <button
                              type="button"
                              key={addr.id}
                              onClick={() => applySavedAddress(addr)}
                              className={`flex-shrink-0 text-right rounded-xl border px-3.5 py-2.5 transition-colors min-w-[150px] max-w-[220px] ${
                                selectedAddressId === addr.id
                                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                  : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
                              }`}
                            >
                              <span className="flex items-center gap-1 text-xs font-bold text-gray-800 whitespace-nowrap">
                                {addr.is_default && <Star className="h-3 w-3 text-amber-500 fill-current flex-shrink-0" />}
                                <span className="truncate">{addr.label}</span>
                              </span>
                              <span className="block text-[11px] text-gray-500 mt-0.5 truncate">
                                {addr.city} — {addr.address}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">{t('receiver.name')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="receiverName"
                                placeholder={t('receiver.name_ph')}
                                className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors ${formErrors.receiverName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500'}`}
                                onChange={handleInputChange}
                                value={formData.receiverName}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-600">{t('receiver.phone')} <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="receiverPhone"
                                dir="ltr"
                                placeholder={t('receiver.phone_ph')}
                                className={`w-full rounded-lg border p-3 text-sm outline-none text-left font-mono transition-colors ${formErrors.receiverPhone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500'}`}
                                onChange={handleInputChange}
                                value={formData.receiverPhone}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">{t('receiver.city')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="city"
                                placeholder={t('receiver.city_ph')}
                                className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors ${formErrors.city ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500'}`}
                                onChange={handleInputChange}
                                value={formData.city}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-gray-600">{t('receiver.address')} <span className="text-red-500">*</span></label>
                            <textarea
                                name="address"
                                rows={2}
                                placeholder={t('receiver.address_ph')}
                                className={`w-full rounded-lg border p-3 text-sm outline-none resize-none transition-colors ${formErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white focus:border-blue-500'}`}
                                onChange={handleInputChange}
                                value={formData.address}
                            />
                        </div>
                    </div>

                    {/* ذخیره‌ی این آدرس برای دفعه‌ی بعد — فقط اگر لاگین باشد و از یک
                        آدرس ذخیره‌شده‌ی قبلی استفاده نکرده باشد (چون آن یکی از قبل ذخیره است) */}
                    {isLoggedIn && !selectedAddressId && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveNewAddress}
                            onChange={(e) => setSaveNewAddress(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{t('receiver.save_for_next_time')}</span>
                        </label>
                        {saveNewAddress && (
                          <input
                            type="text"
                            value={newAddressLabel}
                            onChange={(e) => setNewAddressLabel(e.target.value)}
                            placeholder={t('receiver.save_label_ph')}
                            className="mt-3 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                          />
                        )}
                      </div>
                    )}
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
              {/* === طراحی جدید دکمه بازگشت در مرحله پرداخت === */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-in fade-in">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="text-blue-600 h-7 w-7" />
                  {t('btn_pay_title')}
                </h1>
                
                <button 
                  onClick={handleGoBack}
                  className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-blue-600 px-5 py-2.5 rounded-xl transition-all shadow-sm group"
                >
                  <ArrowLeft className={`h-4 w-4 transition-transform ${!isEn ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                  {t('btn_back')}
                </button>
              </div>

              {/* وقتی کاربر با «ادامه‌ی سفارش قبلی» به این مرحله رسیده (نه با ثبت تازه) */}
              {resumedOrder && (
                <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-bold leading-6">{t('resumed_notice')}</span>
                </div>
              )}
              
              <CryptoPayment orderId={orderId} />
            </>
          )}

        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">{t('cart_summary.title')}</h3>
              {step === 1 && (
                <Link href="/cart" className="text-xs text-blue-600 hover:underline font-bold">
                  {t('cart_summary.edit')}
                </Link>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              {mounted && cart.map((item) => {
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
                <span>{mounted ? `${symbol} ${displayTotal.toFixed(2)}` : '...'}</span>
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