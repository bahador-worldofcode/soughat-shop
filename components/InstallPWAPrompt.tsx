'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, X, Share, SquarePlus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

// کلید ذخیره‌سازی در sessionStorage (نه localStorage): طبق درخواست، فقط باید
// «در همین سشن مرورگر» که کاربر آن را بسته، دیگر نمایش داده نشود؛ با بستن تب/
// مرورگر و باز کردن دوباره، دوباره واجد شرایط نمایش می‌شود.
const DISMISS_KEY = 'soughat_pwa_prompt_dismissed';

// چند ثانیه بعد از لود صفحه نشان داده شود، نه بلافاصله — تا کاربر اول کمی با
// سایت آشنا شود و نوتیف مثل یک پاپ‌آپ مزاحم و فوری حس نشود.
const SHOW_DELAY_MS = 3000;

// تایپ رسمی TypeScript برای این ایونت وجود ندارد (هنوز استاندارد نهایی نشده)،
// برای همین خودمان تعریفش می‌کنیم.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari این پراپرتی غیراستاندارد را دارد
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  // مرورگرهای دیگر روی iOS (کروم، فایرفاکس، اج و ...) هم "Safari" را در UA خود
  // دارند، ولی گزینه‌ی «Add to Home Screen» فقط در خودِ سافاری وجود دارد.
  const isOtherIOSBrowser = /crios|fxios|opios|edgios|duckduckgo/i.test(ua);
  return isIOS && !isOtherIOSBrowser;
}

/**
 * نوتیف/کارت شناور «نصب اپلیکیشن» — فقط در صفحه‌ی اصلی رندر می‌شود (چون این
 * کامپوننت فقط داخل app/[locale]/(home)/page.tsx ایمپورت شده).
 *
 * رفتار:
 *  - اندروید/کروم/دسکتاپ: منتظر ایونت استاندارد beforeinstallprompt می‌ماند و
 *    دکمه‌ی نصب واقعی مرورگر را با تاخیر و در طراحی خودمان نشان می‌دهد.
 *  - آیفون/سافاری: چون این مرورگر اصلاً beforeinstallprompt را پشتیبانی
 *    نمی‌کند، به‌جایش راهنمای دو مرحله‌ای «Share ← Add to Home Screen» نشان
 *    داده می‌شود.
 *  - اگر برنامه از قبل نصب باشد (standalone) یا کاربر یک‌بار در همین سشن
 *    ضربدر را زده باشد، اصلاً چیزی رندر نمی‌شود.
 */
export default function InstallPWAPrompt() {
  const t = useTranslations('InstallPrompt');
  const locale = useLocale();
  const isEn = locale === 'en';

  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [mode, setMode] = useState<'native' | 'ios' | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // شرط‌های خروج زودهنگام: قبلاً بسته شده یا از قبل به‌صورت اپ نصب است
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    if (isRunningStandalone()) return;

    let showTimer: ReturnType<typeof setTimeout> | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      // جلوگیری از نمایش خودکار mini-infobar پیش‌فرض مرورگر؛ ما خودمان با
      // طراحی سفارشی و تاخیردار آن را نشان می‌دهیم.
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;

      showTimer = setTimeout(() => {
        setMode('native');
        setVisible(true);
      }, SHOW_DELAY_MS);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // آیفون/سافاری هیچ‌وقت beforeinstallprompt را شلیک نمی‌کند، پس این حالت
    // را دستی و مستقل بررسی می‌کنیم.
    if (isIOSSafari()) {
      showTimer = setTimeout(() => {
        setMode('ios');
        setVisible(true);
      }, SHOW_DELAY_MS);
    }

    // اگر کاربر از مسیر پرامپت مرورگر یا هر مسیر دیگری برنامه را نصب کرد،
    // بلافاصله کارت را مخفی و برای بقیه‌ی همین سشن هم غیرفعال می‌کنیم.
    const handleAppInstalled = () => {
      sessionStorage.setItem(DISMISS_KEY, '1');
      setAnimateIn(false);
      setVisible(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (showTimer) clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // یک فریم صبر می‌کنیم قبل از فعال کردن کلاس‌های transition، تا مرورگر
  // اول حالت اولیه (نامرئی) را رندر کند و بعد واقعاً انیمیشن ورود اجرا شود.
  useEffect(() => {
    if (!visible) {
      setAnimateIn(false);
      return;
    }
    const raf = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const dismiss = () => {
    setAnimateIn(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
    // اجازه می‌دهیم انیمیشن خروج قبل از حذف کامل از DOM تمام شود
    setTimeout(() => setVisible(false), 300);
  };

  const handleInstallClick = async () => {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) return;
    await promptEvent.prompt();
    // چه کاربر قبول کند چه رد کند، این ایونت یک‌بار مصرف است؛ در هر دو حالت
    // کارت را می‌بندیم (اگر قبول کرده باشد، appinstalled هم بعداً شلیک می‌شود).
    deferredPromptRef.current = null;
    dismiss();
  };

  if (!visible || !mode) return null;

  return (
    <div
      dir={isEn ? 'ltr' : 'rtl'}
      role="dialog"
      aria-live="polite"
      aria-label={t('title')}
      className={`fixed z-40 left-4 right-4 md:left-auto md:right-6 md:w-[380px] bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 font-[family-name:var(--font-vazir)] transition-all duration-300 ease-out ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Soughat Shop"
            className="w-12 h-12 rounded-xl flex-shrink-0 object-cover shadow-sm border border-gray-100"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-5">{t('title')}</p>
            <p className="text-xs text-gray-500 mt-1 leading-5">{t('description')}</p>
          </div>
          <button
            onClick={dismiss}
            aria-label={t('close_aria')}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 active:scale-95 transition-all p-1.5 -m-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {mode === 'native' ? (
          <div className="px-4 pb-4">
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Download className="h-4 w-4" />
              {t('install_button')}
            </button>
          </div>
        ) : (
          <div className="px-4 pb-4 pt-1 space-y-2 border-t border-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-600 pt-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <span className="flex items-center gap-1.5">
                {t('ios_step1')}
                <Share className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <span className="flex items-center gap-1.5">
                {t('ios_step2')}
                <SquarePlus className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
