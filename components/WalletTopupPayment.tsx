'use client';
// --------------------------------------------------------------
// این کامپوننت یک کپیِ تطبیق‌یافته‌ی components/CryptoPayment.tsx است
// که مخصوصِ «شارژ کیف‌پول» ساخته شده (نه پرداختِ سفارش). طبقِ تصمیمِ
// معماریِ شماره‌ی ۴ در WALLET_SYSTEM_SETUP.md، به‌جای دست‌بردن در
// CryptoPayment.tsx (که برای خریدِ واقعی تست‌شده و حساس است)، یک کپیِ
// مستقلِ کوچک ساختیم؛ کمی کدِ تکراری داریم ولی یک باگِ اینجا هیچ‌وقت
// نمی‌تونه فلوی خریدِ سفارش رو بشکنه.
//
// تفاوت‌ها با CryptoPayment.tsx:
//   ۱) به‌جای orderId، پراپ‌های topupId / requestedAmount / requestedCurrency
//      و تابعِ onDone() می‌گیره.
//   ۲) چون کیف‌پول به cart ربطی نداره، ارزشِ فیات مستقیم از
//      requestedAmount/requestedCurrency میاد.
//   ۳) به‌جای /api/crypto/calc از /api/wallet/topup/calc استفاده می‌کنه.
//   ۴) دکمه‌ی نهایی /api/wallet/topup/confirm رو با هدرِ Authorization
//      صدا می‌زنه (چون این روت برخلاف orders/confirm، ورود اجباری داره).
//   ۵) به‌جای router.push('/success?...')، در پایان onDone() صدا زده
//      می‌شه (شارژِ کیف‌پول صفحه‌ی موفقیتِ جدا نداره).
// بقیه‌ی اسکلت (انتخابِ روشِ پرداخت، باکسِ راهنمای محاسبه، دکمه‌ی
// تازه‌سازیِ نرخ) عیناً همون چیزیه که در CryptoPayment.tsx هست.
// --------------------------------------------------------------
import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useStore } from '@/lib/store';
import { Loader2, CheckCircle, Info, RefreshCw, ShieldCheck, Calculator } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useTranslations } from 'next-intl';

interface PaymentMethod {
  id: string;
  title: string;
  title_en?: string;
  symbol: string;
  network: string;
  address: string;
}

type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'SEK';

interface Props {
  topupId: string;
  requestedAmount: number;
  requestedCurrency: FiatCurrency;
  onDone: () => void;
}

// چون این کامپوننت به cart/currencyِ سراسری وابسته نیست (ارزِ فاکتور از
// قبل، هنگامِ ساختِ فاکتور در تسکِ ۲۳ مشخص شده)، نمادِ ارز رو خودمون
// نگه می‌داریم — دقیقاً همون نمادهایی که در lib/store.ts هم هست.
const FIAT_SYMBOLS: Record<FiatCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SEK: 'kr',
};

export default function WalletTopupPayment({ topupId, requestedAmount, requestedCurrency, onDone }: Props) {
  const t = useTranslations('CryptoPayment');
  const { rates } = useStore();

  const displayPrice = requestedAmount;
  const displaySymbol = FIAT_SYMBOLS[requestedCurrency] || requestedCurrency;

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const [serverRate, setServerRate] = useState<number | null>(null);
  const [payableAmount, setPayableAmount] = useState<string>('...');
  const [loadingCalc, setLoadingCalc] = useState(false);

  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    async function fetchMethods() {
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true);

      if (data && data.length > 0) {
        setMethods(data);
        setSelectedMethod(data[0]);
      }
      setLoadingMethods(false);
    }
    fetchMethods();
  }, []);

  const fetchSecurePrice = useCallback(async () => {
    if (!selectedMethod || !topupId) return;

    setLoadingCalc(true);
    try {
      const res = await fetch('/api/wallet/topup/calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topupId: topupId,
          symbol: selectedMethod.symbol,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');

      setPayableAmount(data.amount);
      setServerRate(data.rate);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoadingCalc(false);
    }
  }, [selectedMethod, topupId]);

  useEffect(() => {
    fetchSecurePrice();
  }, [fetchSecurePrice]);

  // ثبتِ نهایی: فقط یک پیامِ تلگرام برای ادمین می‌فرسته (طبقِ تسکِ ۱۱،
  // هنوز هیچ پولی جابه‌جا نمی‌شه — تاییدِ دستیِ ادمین در پنل، فاز ۷،
  // موجودی رو واقعاً شارژ می‌کنه). چون این روت برخلافِ orders/confirm
  // ورود اجباری داره، توکنِ سشن رو در هدرِ Authorization می‌فرستیم.
  const handlePaymentDone = async () => {
    setIsChecking(true);
    try {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      await fetch('/api/wallet/topup/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          topupId: topupId,
          paymentMethod: selectedMethod?.symbol || 'Crypto',
        }),
      });
    } catch (e) {
      console.error('Notification failed', e);
    }

    // برخلافِ CryptoPayment (که به صفحه‌ی /success می‌ره)، شارژِ کیف‌پول
    // صفحه‌ی موفقیتِ جدا نداره — نتیجه همین‌جا، داخلِ تبِ کیف‌پول نشون داده می‌شه.
    setTimeout(() => {
      onDone();
    }, 1000);
  };

  const getCryptoIcon = (symbol: string) => {
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase().trim()}.png`;
  };

  // ===== باکس راهنمای زنده و شفاف محاسبه قیمت (فیات -> دلار -> کریپتو) =====
  const currencyNames: Record<string, string> = {
    USD: t('currencies.USD'),
    EUR: t('currencies.EUR'),
    GBP: t('currencies.GBP'),
    SEK: t('currencies.SEK'),
  };

  const fiatName = currencyNames[requestedCurrency] || requestedCurrency;

  // rates[requestedCurrency] یعنی «۱ دلار معادل چند واحد از آن ارز است»؛
  // عکسِ همون نرخ، ارزِ فاکتور به دلاره — دقیقاً همون منطقِ CryptoPayment
  // و همون تبدیلی که موقعِ ساختِ فاکتور در تسکِ ۲۳ انجام شد.
  const currentFiatRate = rates[requestedCurrency];
  const fiatRateToUsd = currentFiatRate ? 1 / currentFiatRate : 1;
  const totalBaseUSD =
    requestedCurrency === 'USD'
      ? requestedAmount
      : Math.round((requestedAmount / (currentFiatRate || 1)) * 100) / 100;

  const isHintReady =
    !loadingCalc &&
    payableAmount !== '...' &&
    (selectedMethod?.symbol !== 'SOL' || serverRate !== null);

  const ltrIsolate = (chunks: ReactNode) => (
    <span dir="ltr" className="inline-block whitespace-nowrap">{chunks}</span>
  );

  const hintText = selectedMethod
    ? selectedMethod.symbol === 'USDT'
      ? requestedCurrency === 'USD'
        ? t.rich('hint_usdt_usd', {
            usdAmount: totalBaseUSD.toFixed(2),
            cryptoAmount: payableAmount,
            ltr: ltrIsolate,
          })
        : t.rich('hint_usdt', {
            fiatName,
            fiatCode: requestedCurrency,
            fiatRate: fiatRateToUsd.toFixed(4),
            usdAmount: totalBaseUSD.toFixed(2),
            cryptoAmount: payableAmount,
            ltr: ltrIsolate,
          })
      : t.rich('hint_sol', {
          usdAmount: totalBaseUSD.toFixed(2),
          solRate: serverRate ? serverRate.toFixed(2) : '0',
          cryptoAmount: payableAmount,
          ltr: ltrIsolate,
        })
    : '';

  if (loadingMethods) return <div className="p-10 text-center flex flex-col items-center"><Loader2 className="animate-spin mb-2" /> {t('loading')}</div>;
  if (methods.length === 0) return <div className="p-10 text-center text-red-500">{t('error_inactive')}</div>;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-lg overflow-hidden font-[family-name:var(--font-vazir)]">

      {/* انتخاب ارز */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <h3 className="font-bold text-blue-900 mb-3 text-center">{t('select_title')}</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                selectedMethod?.id === method.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <img src={getCryptoIcon(method.symbol)} className="w-5 h-5" alt="" />
              <span className="uppercase">{method.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">

        {/* نمایش مبلغ نهایی */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-8 space-y-3 relative overflow-hidden">
           {loadingCalc && (
             <div className="absolute inset-0 bg-gray-50/90 flex items-center justify-center z-10 backdrop-blur-sm">
               <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-xs text-blue-600 font-bold">{t('loading_rate')}</span>
               </div>
             </div>
           )}

           <div className="flex justify-between items-center text-gray-500 text-sm">
             <span>{t('fiat_value')}</span>
             <span className="font-mono">{displaySymbol} {displayPrice}</span>
           </div>

           <div className="flex justify-between items-center text-gray-900 border-t border-gray-200 pt-3">
              <div className="flex flex-col">
                <span className="font-bold text-sm flex items-center gap-1">
                    <Info className="h-4 w-4 text-blue-500"/> {t('payable')}
                </span>

                {selectedMethod?.symbol === 'USDT' ? (
                    <span className="text-[11px] text-green-700 mt-1 bg-green-100 px-2 py-0.5 rounded-md inline-block w-fit font-medium">
                        {t('rate_fixed')}
                    </span>
                ) : (
                  <span className="text-[11px] text-gray-500 mt-1 bg-gray-200 px-2 py-0.5 rounded-md inline-block w-fit">
                        {t('rate_live', {
                            symbol: selectedMethod?.symbol || '...',
                            rate: serverRate || 0
                        })}
                    </span>
                )}
              </div>

             <div className="text-right flex items-center gap-2">
                <span className="text-3xl font-black text-blue-700 font-mono tracking-tight drop-shadow-sm">
                    {payableAmount}
                </span>
                <img src={getCryptoIcon(selectedMethod?.symbol || '')} className="w-6 h-6 object-contain" alt="" />
             </div>
           </div>
        </div>

        {/* باکس راهنمای زنده و شفاف نحوه محاسبه قیمت */}
        {selectedMethod && (
          <div className="mb-8 bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-yellow-900 shadow-sm">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-yellow-800">
              <Calculator className="h-4 w-4 flex-shrink-0" />
              <span>{t('hint_title')}</span>
            </div>
            {isHintReady ? (
              <p className="text-xs leading-6 text-justify opacity-90">
                {hintText}
              </p>
            ) : (
              <p className="text-xs leading-6 flex items-center gap-2 opacity-70">
                <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
                {t('hint_loading')}
              </p>
            )}
          </div>
        )}

        {selectedMethod && (
            <div className="flex flex-col items-center animate-in fade-in duration-500">

                {/* پیام راهنمای مرحله بعد */}
                <div className="flex items-center justify-center gap-2 mb-6 text-blue-800 bg-blue-50 px-4 py-4 rounded-xl border border-blue-200 w-full text-center shadow-sm">
                    <ShieldCheck className="h-6 w-6 flex-shrink-0" />
                    <span className="text-sm font-bold leading-6">{t('security_msg')}</span>
                </div>

                {/* دکمه اتمام فرآیند در سایت */}
                <button
                    onClick={handlePaymentDone}
                    disabled={isChecking}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 hover:-translate-y-1"
                >
                    {isChecking ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                    {isChecking ? t('btn_checking') : t('btn_final_submit')}
                </button>

                <button
                    onClick={fetchSecurePrice}
                    className="mt-6 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                    <RefreshCw className="h-3 w-3" />
                    <span>{t('refresh_rate')}</span>
                </button>
            </div>
        )}

      </div>
    </div>
  );
}