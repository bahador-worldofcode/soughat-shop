'use client';

// --------------------------------------------------------------
// مودال خوش‌آمدگویی + تور ۳ مرحله‌ای پروفایل
// --------------------------------------------------------------
// این کامپوننت کاملاً "بی‌حالت نسبت به دیتابیس" است — فقط UI را نشان
// می‌دهد و کنترل می‌کند. تصمیم‌گیری در مورد "آیا اصلاً باید نشان داده
// شود یا نه" و "ذخیره‌ی اینکه دیگر نمایش داده نشود" به‌عهده‌ی کامپوننت
// والد (app/[locale]/profile/page.tsx) است؛ این‌جا فقط با یک prop به
// اسم open کنترل می‌شود و با فراخوانی onDone به والد خبر می‌دهد که
// کاربر کارش تمام شده (چه با «رد کردن»، چه با اتمام کامل تور).
//
// جریان نمایش:
//   مرحله‌ی ۱ (welcome): «حساب شما ساخته شد!» + دو دکمه: شروع تور / رد کردن
//   مرحله‌ی ۲ (tour):    ۳ اسلایدِ پشت‌سرهم، هرکدوم برای یکی از تب‌های
//                         پروفایل (اطلاعات حساب / آدرس‌ها / سفارش‌ها)
//                         با دات‌های پیشرفت + دکمه‌ی «رد کردن» همیشه در دسترس
//
// در هر لحظه (کلیک روی بک‌دراپ، دکمه‌ی X گوشه، دکمه‌ی «رد کردن»، یا
// اتمام آخرین مرحله) onDone صدا زده می‌شود و مودال برای همیشه بسته
// می‌ماند (چون والد has_seen_welcome را true می‌کند).
// --------------------------------------------------------------

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { PartyPopper, User as UserIcon, MapPin, Package, X } from 'lucide-react';

interface WelcomeOnboardingModalProps {
  /** وقتی true باشد، مودال نمایش داده می‌شود */
  open: boolean;
  /** وقتی کاربر رد کند یا تور را کامل تمام کند صدا زده می‌شود — دقیقاً یک‌بار */
  onDone: () => void;
}

type Phase = 'welcome' | 'tour';

export default function WelcomeOnboardingModal({ open, onDone }: WelcomeOnboardingModalProps) {
  const t = useTranslations('ProfileWelcome');
  const [phase, setPhase] = useState<Phase>('welcome');
  const [step, setStep] = useState(0);

  if (!open) return null;

  const tourSteps = [
    { icon: UserIcon, title: t('tab1_title'), desc: t('tab1_desc') },
    { icon: MapPin, title: t('tab2_title'), desc: t('tab2_desc') },
    { icon: Package, title: t('tab3_title'), desc: t('tab3_desc') },
  ];

  const isLastStep = step === tourSteps.length - 1;
  const current = tourSteps[step];
  const CurrentIcon = current.icon;

  const handleStartTour = () => {
    setPhase('tour');
    setStep(0);
  };

  const handleNext = () => {
    if (isLastStep) {
      onDone();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[60]"
      onClick={onDone}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative"
      >
        {/* دکمه‌ی بستن گوشه — معادل «رد کردن» در هر لحظه */}
        <button
          onClick={onDone}
          aria-label={t('skip')}
          className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-gray-400 hover:text-gray-600 z-10 p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          {phase === 'welcome' ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="p-8 pt-10 text-center"
            >
              <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
                <PartyPopper className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{t('created_title')}</h2>
              <p className="text-sm text-gray-500 mb-7 leading-6">{t('created_desc')}</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleStartTour}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
                >
                  {t('start_tour')}
                </button>
                <button
                  onClick={onDone}
                  className="w-full py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm transition-colors"
                >
                  {t('skip')}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`tour-${step}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="p-8 pt-10 text-center"
            >
              <p className="text-xs font-bold text-blue-600 mb-3">
                {t('step_label', { current: step + 1, total: tourSteps.length })}
              </p>

              <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
                <CurrentIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{current.title}</h2>
              <p className="text-sm text-gray-500 mb-6 leading-6">{current.desc}</p>

              {/* دات‌های پیشرفت */}
              <div className="flex items-center justify-center gap-1.5 mb-6">
                {tourSteps.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onDone}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold text-sm transition-colors"
                >
                  {t('skip')}
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
                >
                  {isLastStep ? t('finish') : t('next')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}