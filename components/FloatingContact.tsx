'use client';

import { useState, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { MessageCircle, X, Send, Phone, MessageSquare, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslations, useLocale } from 'next-intl';

type ViewState = 'menu' | 'form' | 'success';

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

export default function FloatingContact() {
  const t = useTranslations('FloatingContact');
  const locale = useLocale();
  const isEn = locale === 'en';

  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ViewState>('menu');

  const [formData, setFormData] = useState({ contact: '', content: '' });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  // استثنائات نمایش را برمی‌داریم. قانون کلی می‌گوید دکمه باید به خاطر
  // حضور همیشگی Navigation اصلی به انداره ۶ رِم به سمت بالا شناور شود.
  const hasBottomNav = !pathname?.startsWith('/admin');

  // وقتی کاربر به وب‌سایت وارد میشه، در هیروی اولیه شناور مخفیست و وقتی پایین‌تر رفت دیده می‌شود.
  const [hideForHero, setHideForHero] = useState(() => pathname === '/' && isMobileViewport());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname !== '/' || !isMobileViewport()) {
      setHideForHero(false);
      return;
    }

    const heroEl = document.getElementById('home-hero');
    if (!heroEl) {
      setHideForHero(false);
      return;
    }

    setHideForHero(true);
    const observer = new IntersectionObserver(
      ([entry]) => setHideForHero(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [pathname]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content || !formData.contact) return;

    setSending(true);
    setSendError('');
    try {
      const { error } = await supabase.from('messages').insert([{
        user_contact: formData.contact,
        content: formData.content
      }]);
      if (error) throw error;

      await fetch('/api/bale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TICKET',
          data: {
            contact: formData.contact,
            content: formData.content
          }
        })
      });

      setView('success');
      setFormData({ contact: '', content: '' });
    } catch (error) {
      console.error(error);
      setSendError(t('error_generic'));
    } finally {
      setSending(false);
    }
  };

  const resetWidget = () => {
    setIsOpen(false);
    setTimeout(() => {
        setView('menu');
        setFormData({ contact: '', content: '' });
        setSendError('');
    }, 300);
  };

  if (!mounted) return null;
  // این دکمه کاملا از فضای محیط‌های شرکتی (داشبورد) منفک شده.
  if (pathname?.startsWith('/admin')) return null;

  // با قانون طلایی، تنها با توجه به بود و نبود هدر مرکزی تنظیم می‌شود
  // BottomNav ما ارتفاع حدودی ۸۰ پیکسل از انتهای کادر اشغال می‌کند (تلاقی محیط امن در iOS)
  // ما عدد را استاندارد ست میکنیم. 
  const bottomPosClass = hasBottomNav ? 'bottom-[6rem] md:bottom-6' : 'bottom-6';

  return (
    <div
      className={`fixed right-6 z-50 flex flex-col items-end font-[family-name:var(--font-vazir)] transition-all duration-300 ${bottomPosClass} ${hideForHero ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'}`}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      
      {isOpen && (
        <div className="mb-4 w-[290px] sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 relative z-50">
          
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
             <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                   <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} className="rounded-full" alt="Admin" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div className="text-start">
                <h4 className="font-bold text-sm leading-snug">{t('title')}</h4>
                <p className="text-[10px] text-blue-100 tracking-wide mt-0.5">{t('subtitle')}</p>
              </div>
            </div>
            {view === 'form' && (
                <button onClick={() => setView('menu')} className="text-white/80 hover:text-white hover:bg-blue-500/50 p-1.5 rounded-lg transition-colors">
                  <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180' : ''}`} />
                </button>
            )}
          </div>

          <div className="p-4 sm:p-5 min-h-[220px]">
            
            {view === 'menu' && (
                <div className="space-y-4">
                    <p className="text-gray-600 text-xs md:text-sm font-medium mb-1 text-start">{t('greeting')}</p>
                    
                    <a 
                    href={`https://wa.me/989168038017?text=${encodeURIComponent(t('whatsapp_msg'))}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 w-full p-3.5 bg-green-50/70 hover:bg-green-100 border border-green-100 text-green-700 rounded-xl transition-all group shadow-sm hover:shadow"
                    >
                    <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-2.5 rounded-[14px] shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <Phone className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="text-start">
                        <span className="block font-bold text-sm tracking-wide">{t('whatsapp_title')}</span>
                        <span className="block text-[11px] opacity-70 mt-0.5 leading-snug">{t('whatsapp_desc')}</span>
                    </div>
                    </a>

                    <button 
                    onClick={() => setView('form')}
                    className="flex items-center gap-3.5 w-full p-3.5 bg-gray-50/80 border border-gray-200/60 hover:bg-gray-100 text-gray-700 rounded-xl transition-all group text-start shadow-sm hover:shadow"
                    >
                    <div className="bg-gradient-to-br from-gray-500 to-gray-700 text-white p-2.5 rounded-[14px] shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                        <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1 text-start">
                        <span className="block font-bold text-sm tracking-wide">{t('ticket_title')}</span>
                        <span className="block text-[11px] opacity-70 mt-0.5 leading-snug">{t('ticket_desc')}</span>
                    </div>
                    </button>
                </div>
            )}

            {view === 'form' && (
               <form onSubmit={handleSend} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 mb-1.5 block text-start tracking-wider">{t('form_phone')}</label>
                        <input 
                            required
                            type="tel" 
                            dir="ltr"
                            value={formData.contact}
                            onChange={(e) => setFormData({...formData, contact: e.target.value})}
                            className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all text-left font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 mb-1.5 block text-start tracking-wider">{t('form_msg')}</label>
                        <textarea 
                            required
                            rows={3}
                            placeholder={t('form_ph')}
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] resize-none transition-all"
                       />
                    </div>
                    <button 
                        type="submit" 
                        disabled={sending}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />}
                        {sending ? t('btn_sending') : t('btn_send')}
                    </button>

                    {sendError && (
                        <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-center shadow-sm">
                            {sendError}
                        </p>
                    )}
                </form>
            )}

            {view === 'success' && (
                <div className="flex flex-col items-center justify-center h-full py-8 animate-in zoom-in duration-400">
                    <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mb-5 shadow-sm">
                        <CheckCircle className="h-10 w-10 text-green-500 drop-shadow-sm" />
                    </div>
                    <h4 className="font-black text-gray-900 mb-2 text-lg text-center tracking-tight">{t('success_title')}</h4>
                    <p className="text-xs text-gray-500 text-center mb-8 font-medium leading-relaxed max-w-[200px] mx-auto">
                        {t('success_desc')}
                    </p>
                    <button 
                        onClick={() => setView('menu')}
                        className="text-gray-600 hover:text-gray-900 text-sm font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />
                      {t('btn_back')}
                    </button>
                </div>
            )}

          </div>

          <div className="bg-gray-50/50 p-2.5 text-center border-t border-gray-100/60">
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('footer')}</span>
          </div>
        </div>
      )}

      {/* دکمه شناور، حالا بسیار روان‌تر طراحی شده */}
      <button 
        onClick={isOpen ? resetWidget : () => setIsOpen(true)}
        className={`group relative flex items-center justify-center w-[54px] h-[54px] sm:w-14 sm:h-14 ${
            isOpen ? 'bg-slate-800' : 'bg-blue-600'
        } hover:brightness-110 text-white rounded-full shadow-[0_6px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all active:scale-95 z-50`}
      >
        {isOpen ? (
          <X className="h-6 w-6 sm:h-7 sm:w-7 rotate-90 animate-in fade-in zoom-in duration-200 drop-shadow-md" strokeWidth={2.5} />
        ) : (
          <>
            <MessageCircle className="h-[26px] w-[26px] sm:h-7 sm:w-7 animate-in fade-in duration-200 drop-shadow-sm" />
            <span className="absolute top-0 right-0 flex h-[18px] w-[18px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-[18px] w-[18px] bg-red-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </button>

    </div>
  );
}