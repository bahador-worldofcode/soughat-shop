'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Search, X, ImageIcon, Check, BookOpen, Loader2 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  created_at: string;
}

interface MediaFile {
  name: string;
  url: string;
  id: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', image: '' });

  // Gallery State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  const fetchMedia = async () => {
    setLoadingMedia(true);
    const { data } = await supabase.storage.from('media').list('', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
    if (data) {
      const files = data.map((file) => {
        const { data: url } = supabase.storage.from('media').getPublicUrl(file.name);
        return { name: file.name, id: file.id, url: url.publicUrl };
      });
      setMediaFiles(files);
    }
    setLoadingMedia(false);
  };

  const openModal = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      setFormData({ title: post.title, slug: post.slug, content: post.content, image: post.image });
    } else {
      setEditingPost(null);
      setFormData({ title: '', slug: '', content: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        // ساخت Slug (آدرس) خودکار از روی عنوان اگر خالی باشد
        let finalSlug = formData.slug;
        if (!finalSlug) {
            finalSlug = formData.title.trim().toLowerCase().replace(/\s+/g, '-');
        }

      const postData = { ...formData, slug: finalSlug };

      if (editingPost) {
        const { error } = await supabase.from('posts').update(postData).eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert([postData]);
        if (error) throw error;
      }
      await fetchPosts();
      setIsModalOpen(false);
    } catch (error: any) {
      alert('خطا: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) setPosts(posts.filter(p => p.id !== id));
  };

  // Gallery Logic
  const openGallery = () => { setIsGalleryOpen(true); fetchMedia(); };
  const selectImage = (url: string) => { setFormData({ ...formData, image: url }); setIsGalleryOpen(false); };

  const filteredPosts = posts.filter(p => p.title.includes(searchTerm));

  if (loading) return <div className="p-10 text-center">در حال دریافت مقالات...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">وبلاگ و مقالات</h2>
           <p className="text-sm text-gray-500">مدیریت محتوای آموزشی برای سئو</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md">
          <Plus className="h-5 w-5" />
          مطلب جدید
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" placeholder="جستجوی مقالات..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-9 pl-4 py-3 text-sm bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
            <div className="relative h-48 bg-gray-100">
                {post.image ? (
                    <img src={post.image} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300"><BookOpen className="h-10 w-10"/></div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => openModal(post)} className="p-2 bg-white/90 rounded-full text-blue-600 shadow-sm"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 bg-white/90 rounded-full text-red-500 shadow-sm"><Trash2 className="h-4 w-4" /></button>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{post.title}</h3>
                <p className="text-xs text-gray-400 font-mono mb-4">/{post.slug}</p>
                <p className="text-sm text-gray-600 line-clamp-3 mt-auto">{post.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDIT/ADD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingPost ? 'ویرایش مقاله' : 'نوشتن مقاله جدید'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان مقاله</label>
                <input type="text" required className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="مثال: راهنمای ارسال ارز" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">آدرس (Slug)</label>
                <input type="text" className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dir-ltr text-left" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="how-to-send-crypto (اختیاری)" />
                <p className="text-xs text-gray-400 mt-1">اگر خالی بگذارید، از روی عنوان ساخته می‌شود.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تصویر شاخص</label>
                {formData.image ? (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={formData.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" onClick={openGallery} className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm">تغییر</button>
                        <button type="button" onClick={() => setFormData({...formData, image: ''})} className="bg-red-500 text-white p-1 rounded-full"><X className="h-4 w-4"/></button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={openGallery} className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600">
                    <ImageIcon className="h-6 w-6 mb-1"/>
                    <span className="text-sm">انتخاب تصویر از رسانه</span>
                  </button>
                )}
              </div>
              <div className="h-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">متن مقاله</label>
                <textarea required className="w-full h-64 p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 resize-none" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="متن خود را اینجا بنویسید..." />
              </div>
            </form>
            <div className="p-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700">انصراف</button>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 rounded-lg bg-blue-600 text-white shadow-md disabled:opacity-50">{isSaving ? 'در حال ذخیره...' : 'انتشار مقاله'}</button>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY MODAL */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-blue-600" />انتخاب تصویر</h3>
                <button onClick={() => setIsGalleryOpen(false)}><X className="h-6 w-6 text-gray-400" /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
               {loadingMedia ? <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div> : (
                 <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                   {mediaFiles.map((file) => (
                     <div key={file.id} onClick={() => selectImage(file.url)} className="aspect-square rounded-xl overflow-hidden cursor-pointer border hover:border-blue-500 relative">
                       <img src={file.url} className="w-full h-full object-cover" />
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}