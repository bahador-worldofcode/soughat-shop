'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { Send, Loader2, CheckCircle, User, Phone, Mail, MessageSquare } from 'lucide-react';

type ViewState = 'form' | 'success';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TicketForm() {
  const t = useTranslations('TicketForm');

  const [view, setView] = useState<ViewState>('form');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    content: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', content: '' });
    setErrorMsg('');
    setView('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // شماره تماس، ایمیل و متن پیام ضروری هستند (نام اختیاری است)
    if (!formData.phone.trim() || !formData.email.trim() || !formData.content.trim()) {
      setErrorMsg(t('error_required'));
      return;
    }

    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setErrorMsg(t('error_email_invalid'));
      return;
    }

    setSending(true);
    try {
      // ✅ نکته‌ی مهم: علاوه بر phone/email جداگانه، user_contact هم پر می‌شود
      // تا با ساختار قدیمی جدول (که فقط یک فیلد تماس داشت) سازگار بماند و
      // پنل ادمین قدیمی هم بدون مشکل کار کند.
      const { error } = await supabase.from('messages').insert([
        {
          name: formData.name.trim() || null,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          user_contact: formData.phone.trim(),
          content: formData.content.trim(),
        },
      ]);
      if (error) throw error;

      await fetch('/api/bale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TICKET',
          data: {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            content: formData.content.trim(),
          },
        }),
      });

      setView('success');
    } catch (err) {
      console.error(err);
      setErrorMsg(t('error_generic'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t('section_title')}</h2>
      </div>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">{t('section_desc')}</p>

      {view === 'success' ? (
        <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="font-black text-gray-900 mb-1 text-lg text-center">{t('success_title')}</h3>
          <p className="text-sm text-gray-500 text-center mb-6 max-w-sm">{t('success_desc')}</p>
          <button
            onClick={resetForm}
            className="text-blue-600 hover:text-blue-700 text-sm font-bold transition-colors"
          >
            {t('btn_new')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {t('label_name')}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('label_name_ph')}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {t('label_phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                dir="ltr"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('label_phone_ph')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-left font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {t('label_email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                dir="ltr"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('label_email_ph')}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-left font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 block">
              {t('label_message')} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              required
              rows={4}
              value={formData.content}
              onChange={handleChange}
              placeholder={t('label_message_ph')}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? t('btn_sending') : t('btn_send')}
          </button>

          {errorMsg && (
            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-center">
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </div>
  );
}