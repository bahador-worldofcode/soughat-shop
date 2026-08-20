'use client';

import { useState } from 'react';
import { X, HelpCircle, CreditCard, Globe2, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ModalKind = 'paypal' | 'revolut' | 'other' | null;

interface Props {
  trackingCode: string;
}

// ---------------------------------------------------------------
// این کامپوننت دو تکه‌ی مرتبط رو کنارِ هم نگه می‌داره:
//
// ۱) باکسِ شفافیت («چرا آدرس ولت رو مستقیم نذاشتیم») — دقیقاً بالای
//    دکمه‌ی واتساپِ صفحه‌ی موفقیت رندر می‌شه.
// ۲) سه‌تا کارتِ کنجکاوی‌برانگیز («آمریکایی هستید؟»، «اروپا/استرالیا؟»،
//    «پلتفرم دیگه؟») که هرکدوم یک مودالِ راهنمای قدم‌به‌قدم باز می‌کنن.
//
// همه‌چیز فقط وقتی رندر می‌شه که سفارش هنوز pending باشه (یعنی دقیقاً
// همونجایی که دکمه‌ی واتساپِ اصلی هم نشون داده می‌شه) — چون این کل
// ماجرا فقط برای همون لحظه‌ایه که مشتری داره تصمیم می‌گیره چطور
// پرداخت کنه.
// ---------------------------------------------------------------

export function PaymentSecurityNote() {
  const t = useTranslations('Success');
  return (
    <div className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-2xl p-4 text-right">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-900 mb-1">{t('security_note_title')}</p>
          <p className="text-[11px] text-amber-800 leading-6">{t('security_note_text')}</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentHelpCards({ trackingCode }: Props) {
  const t = useTranslations('Success');
  const [openModal, setOpenModal] = useState<ModalKind>(null);

  const waLink = (methodKey: 'paypal' | 'revolut' | 'generic') => {
    const methodText =
      methodKey === 'paypal'
        ? t('wa_method_paypal')
        : methodKey === 'revolut'
        ? t('wa_method_revolut')
        : '';
    const msg = methodText
      ? t('whatsapp_order_msg_with_method', { code: trackingCode, method: methodText })
      : t('whatsapp_order_msg', { code: trackingCode });
    return `https://wa.me/16506712358?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
      {/* ---- سه‌تا کارتِ کنجکاوی‌برانگیز ---- */}
      <div className="w-full max-w-md mt-2 space-y-2">
        <p className="text-[11px] text-gray-400 text-center mb-1">{t('alt_help_intro')}</p>

        <button
          onClick={() => setOpenModal('paypal')}
          className="w-full flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-xl px-4 py-3 text-right transition-all group"
        >
          <CreditCard className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="text-xs font-bold text-gray-700 flex-1">{t('paypal_question')}</span>
          <HelpCircle className="h-4 w-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
        </button>

        <button
          onClick={() => setOpenModal('revolut')}
          className="w-full flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-xl px-4 py-3 text-right transition-all group"
        >
          <Globe2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="text-xs font-bold text-gray-700 flex-1">{t('europe_question')}</span>
          <HelpCircle className="h-4 w-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
        </button>

        <button
          onClick={() => setOpenModal('other')}
          className="w-full flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-xl px-4 py-3 text-right transition-all group"
        >
          <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="text-xs font-bold text-gray-700 flex-1">{t('other_question')}</span>
          <HelpCircle className="h-4 w-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
        </button>
      </div>

      {/* ---- مودالِ پی‌پال ---- */}
      {openModal === 'paypal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col font-[family-name:var(--font-vazir)]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-blue-900">{t('paypal_modal_title')}</h3>
              <button onClick={() => setOpenModal(null)}>
                <X className="h-5 w-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <p className="text-xs text-gray-600 leading-6">{t('paypal_modal_intro')}</p>
              <ol className="space-y-3">
                {t.raw('paypal_steps').map((step: string, i: number) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs text-gray-700 leading-6">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-[11px] text-yellow-800 leading-6">{t('paypal_modal_note')}</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <a
                href={waLink('paypal')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                <MessageCircle className="h-5 w-5" />
                {t('modal_whatsapp_btn')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ---- مودالِ رولوت ---- */}
      {openModal === 'revolut' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col font-[family-name:var(--font-vazir)]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-blue-900">{t('revolut_modal_title')}</h3>
              <button onClick={() => setOpenModal(null)}>
                <X className="h-5 w-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <p className="text-xs text-gray-600 leading-6">{t('revolut_modal_intro')}</p>
              <ol className="space-y-3">
                {t.raw('revolut_steps').map((step: string, i: number) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs text-gray-700 leading-6">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="p-4 border-t border-gray-100">
              <a
                href={waLink('revolut')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                <MessageCircle className="h-5 w-5" />
                {t('modal_whatsapp_btn')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ---- مودالِ «پلتفرمِ دیگه» ---- */}
      {openModal === 'other' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col font-[family-name:var(--font-vazir)]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-blue-900">{t('other_modal_title')}</h3>
              <button onClick={() => setOpenModal(null)}>
                <X className="h-5 w-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-600 leading-6">{t('other_modal_text')}</p>
            </div>
            <div className="p-4 border-t border-gray-100">
              <a
                href={waLink('generic')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                <MessageCircle className="h-5 w-5" />
                {t('modal_whatsapp_btn')}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
