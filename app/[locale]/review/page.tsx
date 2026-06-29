'use client';

import { useState } from 'react';
import { Star, MessageSquare, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function SubmitReviewPage() {
  const t = useTranslations('Review');
  const locale = useLocale();
  const isEn = locale === 'en';

  const [orderId, setOrderId] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, rating, comment }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 font-[family-name:var(--font-vazir)]">
        <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('success_title')}</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">{t('success_desc')}</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
            {t('back_home')} <ArrowLeft className={`h-4 w-4 ${isEn ? 'rotate-180' : ''}`} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-[family-name:var(--font-vazir)]">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">{t('title')}</h1>
            <p className="text-gray-500 mt-2 text-sm">{t('subtitle')}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('order_id')}</label>
                <input 
                    type="text" 
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm dir-ltr text-center"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('rating')}</label>
                <div className="flex gap-2 justify-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                            key={star} 
                            onClick={() => setRating(star)}
                            className={`h-8 w-8 cursor-pointer transition-all ${star <= rating ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-gray-300'}`} 
                        />
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('comment')}</label>
                <textarea 
                    required
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('comment_ph')}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('submit')}
            </button>
        </form>
      </div>
    </div>
  );
}