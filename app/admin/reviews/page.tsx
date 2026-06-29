'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, CheckCircle, XCircle, Edit2, MessageCircle, Trash2, Loader2, Save, X } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingReview, setEditingReview] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  };

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_approved: !currentStatus })
    });
    setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف شود؟')) return;
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/admin/reviews?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session?.access_token}` }
    });
    setReviews(reviews.filter(r => r.id !== id));
  };

  const openEditModal = (review: any) => {
    setEditingReview({ ...review });
    setIsModalOpen(true);
  };

  const saveEdit = async () => {
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: editingReview.id, 
        comment: editingReview.comment,
        admin_reply: editingReview.admin_reply,
        is_approved: editingReview.is_approved
      })
    });
    await fetchReviews();
    setIsModalOpen(false);
    setIsSaving(false);
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>;

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">مدیریت نظرات</h2>
           <p className="text-sm text-gray-500">تایید، ویرایش و پاسخ‌دهی به نظرات مشتریان</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map(review => (
            <div key={review.id} className={`p-5 rounded-2xl border transition-all ${review.is_approved ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="font-bold text-gray-900">{review.sender_name}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] truncate">{review.items_summary}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleToggleApprove(review.id, review.is_approved)} className={`p-2 rounded-lg ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {review.is_approved ? <CheckCircle className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
                        </button>
                        <button onClick={() => openEditModal(review)} className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Edit2 className="h-4 w-4"/></button>
                        <button onClick={() => handleDelete(review.id)} className="p-2 bg-red-100 text-red-700 rounded-lg"><Trash2 className="h-4 w-4"/></button>
                    </div>
                </div>
                
                <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                </div>
                
                <p className="text-sm text-gray-700 leading-7 bg-white/50 p-3 rounded-xl border border-gray-100">{review.comment}</p>

                {review.admin_reply && (
                    <div className="mt-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-800 flex items-center gap-1 mb-1"><MessageCircle className="h-3 w-3"/> پاسخ شما:</span>
                        <p className="text-xs text-blue-900">{review.admin_reply}</p>
                    </div>
                )}
            </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">ویرایش نظر و پاسخ</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">متن مشتری (قابلیت ادیت برای رفع غلط املایی)</label>
                        <textarea rows={3} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 text-sm" value={editingReview.comment} onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-blue-600 font-bold mb-1 block">پاسخ شما (به عنوان ادمین)</label>
                        <textarea rows={3} className="w-full p-3 border border-blue-200 bg-blue-50 rounded-xl outline-none focus:border-blue-500 text-sm" placeholder="از خرید شما متشکریم..." value={editingReview.admin_reply || ''} onChange={(e) => setEditingReview({...editingReview, admin_reply: e.target.value})} />
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border rounded-xl text-gray-600">انصراف</button>
                    <button onClick={saveEdit} disabled={isSaving} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex justify-center gap-2">
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} ذخیره
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}