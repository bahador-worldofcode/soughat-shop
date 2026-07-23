// مسیر فایل در پروژه: components/OrderDetailsModal.tsx
// این یک فایل جدید است — باید دقیقاً با همین اسم در پوشه‌ی components/ ساخته شود.
// --------------------------------------------------------------
// مودالِ «جزئیات کامل سفارش» — از تبِ «سفارش‌های من» در پروفایل صدا زده
// می‌شود. با گرفتنِ orderId، جزئیاتِ کامل را از یک API امنِ جدید
// (app/api/profile/orders/[id]/route.ts) می‌خواند — همان API که تضمین
// می‌کند مشتری فقط می‌تواند سفارشِ خودش را ببیند، نه سفارش‌های بقیه.
//
// چیزهایی که این مودال نشان می‌دهد (که قبلاً در هیچ‌جای پنلِ مشتری کامل
// دیده نمی‌شد):
//   • وضعیتِ سفارش (نوارِ پیشرفت، دقیقاً هم‌سبک با صفحه‌ی پیگیریِ عمومی)
//   • خلاصه‌ی مالی: دقیقاً همان مبلغ و ارزی که مشتری پرداخت کرد
//   • اطلاعاتِ فرستنده (خودِ مشتری) برای اطمینان از صحتِ ثبت
//   • اطلاعاتِ کاملِ گیرنده در ایران (نام، تلفن، شهر، آدرس)
//   • اطلاعاتِ واریزِ حواله (کارت/شبا/حساب) — فقط اگر سفارش این نوع باشد
//   • یادداشتِ خودِ مشتری برای سفارش (در صورت وجود)
//   • لیستِ کاملِ اقلام با عکس، تعداد و قیمت
//   • لینکِ رفتن به صفحه‌ی پیگیریِ عمومی (برای اشتراک‌گذاری با دیگران)
// --------------------------------------------------------------

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { supabaseBrowser, legacySessionReady } from '@/lib/supabase-browser';
import {
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Copy,
  CheckCircle2,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Globe,
  Phone,
  MapPin,
  Landmark,
  FileText,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface OrderItem {
  title?: string;
  price?: number;
  quantity?: number;
  image?: string;
}

interface OrderDetail {
  id: string;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  address: string;
  recipient_card_number: string | null;
  recipient_iban: string | null;
  recipient_account_number: string | null;
  recipient_account_holder_name: string | null;
  sender_name: string;
  sender_phone: string;
  sender_country: string;
  display_currency: string | null;
  display_fiat_amount: number | null;
  order_notes: string | null;
  total_price: number;
  items: OrderItem[];
}

interface Props {
  orderId: string | null;
  onClose: () => void;
}

// نمادِ هر ارز — همان نگاشتی که در بقیه‌ی پروژه (WalletTopupPayment،
// پروفایل و ...) هم استفاده می‌شود.
const FIAT_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SEK: 'kr',
};

// محصولی که فیلدهای «واریز حواله» فقط برای آن معنا دارند — همان اسلاگی
// که در app/api/orders/confirm/route.ts هم استفاده شده.
export default function OrderDetailsModal({ orderId, onClose }: Props) {
  const t = useTranslations('OrderDetails');
  const tTrack = useTranslations('Track');
  const locale = useLocale();
  const isEn = locale === 'en';

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(false);
    setOrder(null);

    try {
      await legacySessionReady;
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      const res = await fetch(`/api/profile/orders/${orderId}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const json = await res.json();
      if (!res.ok || !json.order) throw new Error(json.error || 'error');
      setOrder(json.order as OrderDetail);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId, fetchOrder]);

  // بستن مودال با کلید Escape — برای راحتیِ بیشتر، علاوه بر دکمه‌ی ضربدر
  useEffect(() => {
    if (!orderId) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [orderId, onClose]);

  if (!orderId) return null;

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField((cur) => (cur === field ? null : cur)), 2000);
    } catch {
      // اگر کپیِ خودکار در مرورگر مشتری ممکن نبود، حداقل خطایی نمایش
      // نمی‌دهیم — خودِ مقدار همین الان روی صفحه قابلِ انتخاب و کپیِ دستی است.
    }
  };

  const formatDate = (iso: string) => {
    try {
      const loc = isEn ? 'en-US' : 'fa-IR';
      return new Intl.DateTimeFormat(loc, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const steps = [
    { status: 'pending', label: tTrack('steps.pending'), icon: Clock },
    { status: 'paid', label: tTrack('steps.paid'), icon: CheckCircle },
    { status: 'sent', label: tTrack('steps.sent'), icon: Truck },
    { status: 'delivered', label: tTrack('steps.delivered'), icon: Package },
  ];
  const currentStepIndex = order ? steps.findIndex((s) => s.status === order.status) : -1;

  const hasBankInfo =
    !!order && (order.recipient_card_number || order.recipient_iban || order.recipient_account_number);

  const CopyButton = ({ value, field }: { value: string; field: string }) => (
    <button
      type="button"
      onClick={() => handleCopy(value, field)}
      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors flex-shrink-0"
      title={t('copy')}
      aria-label={t('copy')}
    >
      {copiedField === field ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 font-[family-name:var(--font-vazir)]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر مودال */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900">{t('modal_title')}</h3>
            {order && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-gray-400 font-mono dir-ltr truncate">{order.id}</span>
                <CopyButton value={order.id} field="order_id" />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 flex-shrink-0"
            aria-label={t('close')}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* بدنه‌ی مودال */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">{t('loading')}</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="font-bold text-gray-900">{t('error_title')}</p>
              <p className="text-sm text-gray-500 max-w-xs">{t('error_desc')}</p>
              <button
                onClick={fetchOrder}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                {t('retry')}
              </button>
            </div>
          )}

          {!loading && !error && order && (
            <>
              {/* نوارِ وضعیت */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <span className="text-sm text-gray-500">{t('current_status')}</span>
                  <span className="text-xs text-gray-400">
                    {t('order_date')}: {formatDate(order.created_at)}
                  </span>
                </div>

                {order.status === 'cancelled' ? (
                  <div className="text-center p-4 mt-2 bg-red-50 rounded-xl border border-red-100">
                    <XCircle className="h-8 w-8 text-red-500 mx-auto mb-1.5" />
                    <p className="font-bold text-red-700 text-sm">{tTrack('status_cancelled')}</p>
                    <p className="text-red-600 text-xs mt-0.5">{tTrack('status_cancelled_desc')}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-4 px-1 overflow-x-auto">
                    {steps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const StepIcon = step.icon;
                      return (
                        <div key={step.status} className="flex flex-col items-center gap-1.5 flex-1 min-w-[64px]">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCompleted
                                ? 'bg-green-500 border-green-200 text-white'
                                : 'bg-white border-gray-200 text-gray-300'
                            }`}
                          >
                            <StepIcon className="h-4 w-4" />
                          </div>
                          <span
                            className={`text-[11px] text-center ${
                              isCurrent ? 'font-bold text-blue-600' : 'text-gray-500'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* خلاصه‌ی مالی */}
              <div className="bg-green-50/50 p-5 rounded-2xl border border-green-200">
                <h4 className="font-bold text-green-900 flex items-center gap-2 text-sm border-b border-green-200 pb-2 mb-2">
                  <Landmark className="h-4 w-4" /> {t('payment_summary_title')}
                </h4>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-700">{t('amount_charged')}</span>
                  <span className="text-xl text-green-700 font-mono dir-ltr">
                    {order.display_fiat_amount
                      ? `${FIAT_SYMBOLS[order.display_currency || ''] || ''} ${order.display_fiat_amount.toLocaleString(
                          'en-US',
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )} ${!FIAT_SYMBOLS[order.display_currency || ''] ? order.display_currency ?? '' : ''}`
                      : `$${order.total_price}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                  <span>{t('usd_reference')}</span>
                  <span className="font-mono text-gray-700 dir-ltr">${order.total_price} USD</span>
                </div>
              </div>

              {/* فرستنده / گیرنده */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2 text-sm border-b border-blue-200 pb-2 mb-2">
                    <Globe className="h-4 w-4" /> {t('sender_title')}
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 block mb-0.5">{t('sender_name')}</span>
                      <span className="font-bold text-gray-800">{order.sender_name || '---'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-0.5">{t('sender_country')}</span>
                      <span className="font-bold text-gray-800">{order.sender_country || '---'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-0.5">{t('sender_phone')}</span>
                      <span className="font-bold text-gray-800 font-mono dir-ltr block">
                        {order.sender_phone || '---'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 space-y-3">
                  <h4 className="font-bold text-red-900 flex items-center gap-2 text-sm border-b border-red-200 pb-2 mb-2">
                    <MapPin className="h-4 w-4" /> {t('recipient_title')}
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 block mb-0.5">{t('recipient_name')}</span>
                      <span className="font-bold text-gray-800">{order.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-0.5">{t('recipient_phone')}</span>
                      <span className="font-bold text-gray-800 font-mono dir-ltr block">
                        {order.customer_phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-0.5">{t('recipient_address')}</span>
                      <p className="font-medium text-gray-800 text-xs leading-5">
                        {order.city} - {order.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* اطلاعات واریز حواله — فقط اگر حداقل یکی از سه فیلد پر باشد */}
              {hasBankInfo && (
                <div className="bg-green-50/60 p-5 rounded-2xl border border-green-200 space-y-3">
                  <h4 className="font-bold text-green-900 flex items-center gap-2 text-sm border-b border-green-200 pb-2 mb-2">
                    <Landmark className="h-4 w-4" /> {t('bank_title')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {order.recipient_account_holder_name && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-gray-500 block mb-1">{t('account_holder_name')}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-800">{order.recipient_account_holder_name}</span>
                          <CopyButton value={order.recipient_account_holder_name} field="holder" />
                        </div>
                      </div>
                    )}
                    {order.recipient_card_number && (
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">{t('card_number')}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-800 font-mono dir-ltr">
                            {order.recipient_card_number}
                          </span>
                          <CopyButton value={order.recipient_card_number} field="card" />
                        </div>
                      </div>
                    )}
                    {order.recipient_iban && (
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">{t('iban')}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-800 font-mono dir-ltr">{order.recipient_iban}</span>
                          <CopyButton value={order.recipient_iban} field="iban" />
                        </div>
                      </div>
                    )}
                    {order.recipient_account_number && (
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">{t('account_number')}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-800 font-mono dir-ltr">
                            {order.recipient_account_number}
                          </span>
                          <CopyButton value={order.recipient_account_number} field="account" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* یادداشت مشتری */}
              {order.order_notes && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm">
                  <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> {t('notes_title')}
                  </h4>
                  <p className="text-gray-700 leading-6 italic">&quot;{order.order_notes}&quot;</p>
                </div>
              )}

              {/* اقلام سفارش */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> {t('items_title')}
                </h4>
                <div className="space-y-2">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50 items-center">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.title || ''}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.title || '---'}</p>
                        <p className="text-xs text-gray-500">
                          {t('unit_price_label')}: ${item.price ?? 0}
                        </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <span className="block font-bold text-gray-900 text-sm">x{item.quantity ?? 1}</span>
                        <span className="block text-sm font-bold text-blue-600 font-mono">
                          ${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-600">{t('order_total_label')}</span>
                  <span className="text-2xl font-bold text-blue-700 font-mono">${order.total_price}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* فوتر مودال */}
        {!loading && !error && order && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a
              href={`/${locale}/track?id=${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t('public_track_link')}
            </a>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {t('contact_support')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}