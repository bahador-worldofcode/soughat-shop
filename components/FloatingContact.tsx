'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Phone, MessageSquare, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ViewState = 'menu' | 'form' | 'success';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ViewState>('menu');
  
  // فرم دیتا
  const [formData, setFormData] = useState({ contact: '', content: '' });
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content || !formData.contact) return;

    setSending(true);
    try {
      // 1. ذخیره در دیتابیس سوپابیس (برای پنل ادمین)
      const { error } = await supabase.from('messages').insert([{
        user_contact: formData.contact,
        content: formData.content
      }]);
      if (error) throw error;

      // 2. ارسال فوری به گروه بله (کد جدید اضافه شده)
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
      setFormData({ contact: '', content: '' }); // پاک کردن فرم
    } catch (error) {
      console.error(error);
      alert('خطا در ارسال پیام. لطفاً دوباره تلاش کنید.');
    } finally {
      setSending(false);
    }
  };

  const resetWidget = () => {
    setIsOpen(false);
    setTimeout(() => {
        setView('menu');
        setFormData({ contact: '', content: '' });
    }, 300);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-[family-name:var(--font-vazir)]">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    {/* آواتار ادمین */}
                   <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} className="rounded-full" alt="Admin" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm">پشتیبانی آنلاین</h4>
                <p className="text-[10px] text-blue-100">پاسخگویی سریع</p>
              </div>
            </div>
            {/* دکمه بازگشت (فقط در حالت فرم) */}
            {view === 'form' && (
                <button onClick={() => setView('menu')} className="text-white/80 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </button>
            )}
          </div>

          {/* Body Content */}
          <div className="p-4 min-h-[200px]">
            
            {/* 1. MENU VIEW */}
            {view === 'menu' && (
                <div className="space-y-3">
                    <p className="text-gray-600 text-xs mb-2">سلام! چطور می‌توانیم کمکتان کنیم؟</p>
                    
                    <a 
                    href="https://wa.me/989168038017" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors group"
                    >
                    <div className="bg-green-500 text-white p-2 rounded-full group-hover:scale-110 transition-transform">
                        <Phone className="h-4 w-4" />
                    </div>
                    <div className="text-right">
                        <span className="block font-bold text-sm">واتساپ (سریع‌ترین)</span>
                        <span className="block text-[10px] opacity-70">چت مستقیم با مدیریت</span>
                    </div>
                    </a>

                    <button 
                    onClick={() => setView('form')}
                    className="flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors group text-right"
                    >
                    <div className="bg-gray-500 text-white p-2 rounded-full group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                        <span className="block font-bold text-sm">ارسال پیام (تیکت)</span>
                        <span className="block text-[10px] opacity-70">اگر واتساپ ندارید، اینجا بنویسید</span>
                    </div>
                    </button>
                </div>
            )}

            {/* 2. FORM VIEW */}
            {view === 'form' && (
              <form onSubmit={handleSend} className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">شماره تماس شما (واتساپ):</label>
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
                        <label className="text-xs text-gray-500 mb-1 block">متن پیام:</label>
                        <textarea 
                            required
                            rows={3}
                            placeholder="سوالی دارید؟ بنویسید..." 
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
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {sending ? 'در حال ارسال...' : 'ارسال پیام'}
                    </button>
                </form>
            )}

            {/* 3. SUCCESS VIEW */}
            {view === 'success' && (
                <div className="flex flex-col items-center justify-center h-full py-6 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">پیام شما دریافت شد!</h4>
                    <p className="text-xs text-gray-500 text-center mb-6">
                        همکاران ما به زودی در واتساپ یا از طریق همین شماره با شما تماس می‌گیرند.
                    </p>
                    <button 
                        onClick={() => setView('menu')}
                        className="text-blue-600 text-sm font-bold hover:underline"
                    >
                       بازگشت به منو
                    </button>
                </div>
            )}

          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
             <span className="text-[10px] text-gray-400">پشتیبانی توسط سوغات شاپ</span>
          </div>
        </div>
      )}

      {/* Toggle Button */}
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