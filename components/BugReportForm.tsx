'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, Bug, CheckCircle, ImagePlus, Loader2, Mail, Send, User, X } from 'lucide-react';
import { compressBugReportImage, ImageCompressError } from '@/lib/imageCompress';

type ViewState = 'form' | 'success';

// حداکثر حجمِ خامِ فایلِ انتخابی قبل از هر پردازشی — صرفاً برای جلوگیری
// از هنگ کردنِ مرورگر روی عکس‌های خیلی حجیم (مثلاً عکس خامِ دوربین موبایل)
const MAX_RAW_SELECT_BYTES = 20 * 1024 * 1024; // 20MB

export default function BugReportForm() {
  const t = useTranslations('BugReportForm');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<ViewState>('form');
  const [sending, setSending] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({ name: '', contact: '', description: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // هانی‌پات ضد اسپم — کاربر واقعی هرگز این فیلد را نمی‌بیند/پر نمی‌کند
  const [honeypot, setHoneypot] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg(t('error_image_format'));
      e.target.value = '';
      return;
    }

    if (file.size > MAX_RAW_SELECT_BYTES) {
      setErrorMsg(t('error_image_too_large_raw'));
      e.target.value = '';
      return;
    }

    setProcessingImage(true);
    try {
      const compressed = await compressBugReportImage(file);
      const ext = compressed.type === 'image/png' ? 'png' : compressed.type === 'image/webp' ? 'webp' : 'jpg';
      const finalFile = new File([compressed], `bug-report.${ext}`, { type: compressed.type });

      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(finalFile);
      setImagePreview(URL.createObjectURL(compressed));
    } catch (err) {
      setErrorMsg(err instanceof ImageCompressError ? err.message : t('error_image_generic'));
      e.target.value = '';
    } finally {
      setProcessingImage(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormData({ name: '', contact: '', description: '' });
    removeImage();
    setErrorMsg('');
    setView('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.description.trim()) {
      setErrorMsg(t('error_required'));
      return;
    }

    setSending(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('contact', formData.contact.trim());
      fd.append('description', formData.description.trim());
      // آدرس صفحه‌ای که کاربر احتمالاً همان‌جا با مشکل مواجه شده (خودکار)
      fd.append('page_url', typeof document !== 'undefined' ? document.referrer : '');
      fd.append('user_agent', typeof navigator !== 'undefined' ? navigator.userAgent : '');
      fd.append('website', honeypot); // هانی‌پات
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch('/api/bug-reports', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || t('error_generic'));

      setView('success');
    } catch (err: any) {
      setErrorMsg(err.message || t('error_generic'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
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
          {/* هانی‌پات: از دید کاربر واقعی کاملاً مخفی است، فقط ربات‌ها پرش می‌کنند */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                maxLength={100}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {t('label_contact')}
              </label>
              <input
                type="text"
                name="contact"
                dir="ltr"
                value={formData.contact}
                onChange={handleChange}
                placeholder={t('label_contact_ph')}
                maxLength={150}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-left font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 block">
              {t('label_description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder={t('label_description_ph')}
              maxLength={5000}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white resize-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1.5 block">{t('label_image')}</label>

            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="پیش‌نمایش عکس"
                  className="h-28 w-28 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  aria-label={t('btn_remove_image')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label
                className={`flex items-center gap-2 justify-center border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 text-sm text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors ${
                  processingImage ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {processingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                <span>{processingImage ? t('processing_image') : t('label_image_ph')}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={processingImage}
                />
              </label>
            )}
            <p className="text-[11px] text-gray-400 mt-1.5">{t('image_hint')}</p>
          </div>

          <button
            type="submit"
            disabled={sending || processingImage}
            className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bug className="h-4 w-4" />}
            {sending ? t('btn_sending') : t('btn_send')}
          </button>

          {errorMsg && (
            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-center flex items-center justify-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
