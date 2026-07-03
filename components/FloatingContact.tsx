'use client';

import { useState, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { MessageCircle, X, Send, Phone, MessageSquare, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslations, useLocale } from 'next-intl';
import { isMobileNavHidden } from '@/lib/navVisibility';

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

  const isProductPage = pathname?.startsWith('/products/') && pathname !== '/products';
  const hasBottomNav = !isMobileNavHidden(pathname);

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
      setSendError(isEn ? 'Something went wrong. Please try again.' : 'مشکلی پیش اومد. لطفاً دوباره امتحان کنید.');
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
  if (pathname?.startsWith('/admin')) return null;

  // محاسبه هوشمند جایگاه دکمه شناور 
  let bottomPosClass = 'bottom-6';
  if (isProductPage) {
     // در صفحه محصول باید بیاد بالاتر از (نوار اصلی منو + نوار افزودن به سبد)
     bottomPosClass = 'bottom-[9.5rem] md:bottom-6'; 
  } else if (hasBottomNav) {
     // در بقیه صفحات فقط باید بیاد بالاتر از نوار منو
     bottomPosClass = 'bottom-24 md:bottom-6'; 
  }

  return (
    <div
      className={`fixed right-6 z-50 flex flex-col items-end font-[family-name:var(--font-vazir)] transition-all duration-300 ${bottomPosClass} ${hideForHero ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'}`}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
             <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                   <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} className="rounded-full" alt="Admin" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
              </div>
              <div className="text-start">
                <h4 className="font-bold text-sm">{t('title')}</h4>
                <p className="text-[10px] text-blue-100">{t('subtitle')}</p>
              </div>
            </div>
            {view === 'form' && (
                <button onClick={() => setView('menu')} className="text-white/80 hover:text-white">
                  <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180' : ''}`} />
                </button>
            )}
          </div>

          <div className="p-4 min-h-[200px]">
            
            {view === 'menu' && (
                <div className="space-y-3">
                    <p className="text-gray-600 text-xs mb-2 text-start">{t('greeting')}</p>
                    
                    <a 
                    href={`https://wa.me/989168038017?text=${encodeURIComponent(t('whatsapp_msg'))}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors group"
                    >
                    <div className="bg-green-500 text-white p-2 rounded-full group-hover:scale-110 transition-transform">
                        <Phone className="h-4 w-4" />
                    </div>
                    <div className="text-start">
                        <span className="block font-bold text-sm">{t('whatsapp_title')}</span>
                        <span className="block text-[10px] opacity-70">{t('whatsapp_desc')}</span>
                    </div>
                    </a>

                    <button 
                    onClick={() => setView('form')}
                    className="flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors group text-start"
                    >
                    <div className="bg-gray-500 text-white p-2 rounded-full group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-start">
                        <span className="block font-bold text-sm">{t('ticket_title')}</span>
                        <span className="block text-[10px] opacity-70">{t('ticket_desc')}</span>
                    </div>
                    </button>
                </div>
            )}

            {view === 'form' && (
               <form onSubmit={handleSend} className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block text-start">{t('form_phone')}</label>
                        <input 
                            required
                            type="tel" 
                            dir="ltr"
                            value={formData.contact}
                            onChange={(e) => setFormData({...formData, contact: e.target.value})}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 text-left font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block text-start">{t('form_msg')}</label>
                        <textarea 
                            required
                            rows={3}
                            placeholder={t('form_ph')}
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
                       />
                    </div>
                    <button 
                        type="submit" 
                        disabled={sending}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-70"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />}
                        {sending ? t('btn_sending') : t('btn_send')}
                    </button>

                    {sendError && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
                            {sendError}
                        </p>
                    )}
                </form>
            )}

            {view === 'success' && (
                <div className="flex flex-col items-center justify-center h-full py-6 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">{t('success_title')}</h4>
                    <p className="text-xs text-gray-500 text-center mb-6">
                        {t('success_desc')}
                    </p>
                    <button 
                        onClick={() => setView('menu')}
                        className="text-blue-600 text-sm font-bold hover:underline"
                    >
                      {t('btn_back')}
                    </button>
                </div>
            )}

          </div>

          <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
             <span className="text-[10px] text-gray-400">{t('footer')}</span>
          </div>
        </div>
      )}

      <button 
        onClick={isOpen ? resetWidget : () => setIsOpen(true)}
        className="group relative flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/50 transition-all active:scale-90"
      >
        {isOpen ? (
          <X className="h-6 w-6 rotate-90 animate-in fade-in duration-200" />
        ) : (
          <>
            <MessageCircle className="h-7 w-7 animate-in fade-in duration-200" />
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </button>

    </div>
  );
}