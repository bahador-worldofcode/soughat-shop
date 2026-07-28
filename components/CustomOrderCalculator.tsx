'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import {
  calculateCustomOrderPrice,
  FALLBACK_DOLLAR_RATE_TOMAN,
  FALLBACK_SHIPPING_TOMAN,
} from '@/lib/customOrderPricing';
import { Info, ChevronDown, MessageCircle, Loader2 } from 'lucide-react';

// =============================================================================
// ماشین‌حساب «هدایای سفارشی» + فرم درخواست واتساپ
// =============================================================================
// فایل کاملاً جدید — فقط داخل app/[locale]/custom-gifts/page.tsx استفاده
// می‌شود و هیچ کامپوننت موجود دیگری از پروژه را import یا تغییر نمی‌دهد.
//
// نکته‌ی مهم امنیتی/معماری: فیلدهای «نام محصول / لینک / توضیحات» هرگز به
// هیچ سروری ارسال یا در دیتابیس ذخیره نمی‌شوند. فقط لحظه‌ی کلیک روی دکمه‌ی
// واتساپ، همین مقادیر (که در state خودِ مرورگر کاربر هستند) داخل یک پیام
// متنی به لینک wa.me تبدیل می‌شوند. یعنی هیچ API Route یا جدول جدیدی در
// این پروژه لازم نبوده و هیچ سطح حمله‌ی جدیدی هم ایجاد نشده است.
//
// منبع نرخ‌ها:
//  - dollar_rate           → همان ردیف موجود در site_settings (فقط خوانده می‌شود)
//  - custom_order_shipping_toman → ردیف جدید و مستقل در site_settings
//    (اگر هنوز در دیتابیس درج نشده باشد، مقدار ۷۵۰,۰۰۰ تومان به‌صورت خودکار
//    جایگزین می‌شود — به فایل CUSTOM_GIFTS_SETUP.md مراجعه کنید)
// =============================================================================

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'SEK';

const CURRENCY_OPTIONS: { code: CurrencyCode; symbol: string }[] = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'SEK', symbol: 'kr' },
];

// همان شماره‌ی واتساپِ استفاده‌شده در components/FloatingContact.tsx —
// عمداً هاردکد شده تا با شماره‌ی فعلی سایت همیشه یکی بماند.
const WHATSAPP_NUMBER = '989168038017';

export default function CustomOrderCalculator() {
  const t = useTranslations('CustomOrder.calculator');
  const tReq = useTranslations('CustomOrder.request');

  // 🔧 دقیقاً مطابق الگوی رفع‌باگ‌شده‌ی components/ProductCard.tsx: مقدار
  // currency و توابع convertPrice/getSymbol هر کدام با یک سلکتور جدا گرفته
  // می‌شوند تا این کامپوننت بلافاصله با تغییر ارز در هدر، ری‌رندر شود.
  const currency = useStore((s) => s.currency);
  const convertPrice = useStore((s) => s.convertPrice);
  const getSymbol = useStore((s) => s.getSymbol);
  const setCurrency = useStore((s) => s.setCurrency);
  const fetchRates = useStore((s) => s.fetchRates);

  const [mounted, setMounted] = useState(false);
  const [tomanInput, setTomanInput] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [settings, setSettings] = useState({
    dollarRate: FALLBACK_DOLLAR_RATE_TOMAN,
    shippingToman: FALLBACK_SHIPPING_TOMAN,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(false);

  const [productName, setProductName] = useState('');
  const [productLink, setProductLink] = useState('');
  const [productNotes, setProductNotes] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchRates();
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['dollar_rate', 'custom_order_shipping_toman']);

        if (error) throw error;
        if (!active) return;

        const map: Record<string, string> = {};
        (data || []).forEach((row: { key: string; value: string }) => {
          map[row.key] = row.value;
        });

        setSettings({
          dollarRate: map.dollar_rate ? Number(map.dollar_rate) : FALLBACK_DOLLAR_RATE_TOMAN,
          shippingToman: map.custom_order_shipping_toman
            ? Number(map.custom_order_shipping_toman)
            : FALLBACK_SHIPPING_TOMAN,
        });
      } catch (err) {
        console.error('خطا در دریافت تنظیمات قیمت‌گذاری هدایای سفارشی:', err);
        if (active) setSettingsError(true);
      } finally {
        if (active) setSettingsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const numericToman = Number(tomanInput.replace(/[^0-9]/g, '')) || 0;

  const pricing = useMemo(
    () =>
      calculateCustomOrderPrice({
        customerPriceToman: numericToman,
        dollarRateToman: settings.dollarRate,
        shippingToman: settings.shippingToman,
      }),
    [numericToman, settings]
  );

  const handleTomanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setTomanInput(digitsOnly ? Number(digitsOnly).toLocaleString('en-US') : '');
  };

  // قبل از mount (یعنی روی سرور)، حالت پیش‌فرض USD نشان داده می‌شود تا با
  // خروجی سرور یکی بماند و خطای hydration رخ ندهد — دقیقاً همان تکنیکِ
  // استفاده‌شده در components/ProductCard.tsx
  const displaySymbol = mounted ? getSymbol() : '$';
  const displayFinalPrice = mounted ? convertPrice(pricing.finalPriceUsd) : pricing.finalPriceUsd;

  const hasPrice = numericToman > 0;

  const handleWhatsAppClick = () => {
    const lines = [tReq('whatsapp_msg_intro'), ''];
    lines.push(`${tReq('whatsapp_msg_name')}: ${productName || '-'}`);
    if (productLink) lines.push(`${tReq('whatsapp_msg_link')}: ${productLink}`);
    if (productNotes) lines.push(`${tReq('whatsapp_msg_notes')}: ${productNotes}`);

    if (hasPrice) {
      lines.push('');
      lines.push(`${tReq('whatsapp_msg_price')}: ${numericToman.toLocaleString('en-US')} ${t('toman_suffix')}`);
      lines.push(`${tReq('whatsapp_msg_calc')}: ${displaySymbol}${displayFinalPrice.toFixed(2)}`);
    }

    lines.push('');
    lines.push(tReq('whatsapp_msg_outro'));

    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* ---------- بخش ماشین‌حساب ---------- */}
      <div className="p-5 md:p-8">
        <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">{t('title')}</h3>
        <p className="text-sm text-gray-500 mb-6">{t('subtitle')}</p>

        <label htmlFor="custom-order-toman-input" className="block text-sm font-bold text-gray-700 mb-2">
          {t('input_label')}
        </label>
        <div className="relative mb-1">
          <input
            id="custom-order-toman-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={tomanInput}
            onChange={handleTomanChange}
            placeholder={t('input_placeholder')}
            dir="ltr"
            className="w-full ps-4 pe-16 py-3.5 md:py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-bold text-gray-900 transition-colors"
          />
          <span className="absolute top-1/2 -translate-y-1/2 end-4 text-sm text-gray-400 font-medium pointer-events-none">
            {t('toman_suffix')}
          </span>
        </div>

        {settingsLoading && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('loading_settings')}
          </p>
        )}
        {settingsError && <p className="text-xs text-red-500 mt-2">{t('error_settings')}</p>}

        {hasPrice ? (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <span className="text-sm text-blue-900 font-medium">{t('result_label')}</span>
              <div className="flex items-center gap-1.5" role="group" aria-label={t('currency_label')}>
                {CURRENCY_OPTIONS.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                      mounted && currency === c.code
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                    }`}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-3xl md:text-4xl font-extrabold text-blue-700 font-mono mb-4" dir="ltr">
              {displaySymbol}
              {displayFinalPrice.toFixed(2)}
            </div>

            <button
              type="button"
              onClick={() => setShowBreakdown((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800"
              aria-expanded={showBreakdown}
            >
              <Info className="h-3.5 w-3.5" />
              {t('breakdown_toggle')}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
            </button>

            {showBreakdown && (
              <div className="mt-4 pt-4 border-t border-blue-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t('breakdown_product')}</span>
                  <span className="font-mono" dir="ltr">
                    ${pricing.productCostUsd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('breakdown_shipping')}</span>
                  <span className="font-mono" dir="ltr">
                    ${pricing.shippingCostUsd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    {t('breakdown_margin')} ({pricing.effectiveMarginPercent.toFixed(0)}%)
                  </span>
                  <span className="font-mono" dir="ltr">
                    ${pricing.profitUsd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-dashed border-blue-200">
                  <span>{t('breakdown_total')}</span>
                  <span className="font-mono" dir="ltr">
                    ${pricing.finalPriceUsd.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 pt-2 leading-relaxed">{t('breakdown_margin_note')}</p>
                <p className="text-xs text-gray-400" dir="ltr">
                  {t('rate_note')} {settings.dollarRate.toLocaleString('en-US')} {t('toman_suffix')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            {t('empty_state')}
          </p>
        )}
      </div>

      {/* ---------- بخش درخواست/واتساپ (بدون هیچ تماس با سرور) ---------- */}
      <div className="bg-gray-50 border-t border-gray-100 p-5 md:p-8">
        <h4 className="font-extrabold text-gray-900 mb-1">{tReq('title')}</h4>
        <p className="text-sm text-gray-500 mb-5">{tReq('subtitle')}</p>

        <div className="space-y-3 mb-5">
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder={tReq('name_placeholder')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-sm bg-white"
          />
          <input
            type="text"
            value={productLink}
            onChange={(e) => setProductLink(e.target.value)}
            placeholder={tReq('link_placeholder')}
            dir="ltr"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-sm bg-white"
          />
          <textarea
            value={productNotes}
            onChange={(e) => setProductNotes(e.target.value)}
            placeholder={tReq('notes_placeholder')}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-sm resize-none bg-white"
          />
        </div>

        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          {tReq('whatsapp_btn')}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">{tReq('whatsapp_note')}</p>
      </div>
    </div>
  );
}