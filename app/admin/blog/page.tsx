'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Search, X, ImageIcon, Check, BookOpen, Loader2, Tag, Layers, FileText } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  created_at: string;
  // فیلدهای جدید سئو
  seo_title?: string;
  seo_desc?: string;
  summary?: string;
  category?: string;
  tags?: string[];
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
  
  // فرم دیتا شامل فیلدهای جدید
  const [formData, setFormData] = useState({ 
    title: '', 
    slug: '', 
    content: '', 
    image: '',
    summary: '',
    category: '',
    seo_title: '',
    seo_desc: '',
    tags: '' // تگ‌ها رو به صورت متنی (با کاما) از کاربر می‌گیریم
  });

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
      setFormData({ 
        title: post.title, 
        slug: post.slug, 
        content: post.content, 
        image: post.image,
        summary: post.summary || '',
        category: post.category || 'عمومی',
        seo_title: post.seo_title || '',
        seo_desc: post.seo_desc || '',
        tags: post.tags ? post.tags.join(', ') : '' // آرایه رو به رشته تبدیل می‌کنیم برای نمایش
      });
    } else {
      setEditingPost(null);
      setFormData({ 
        title: '', slug: '', content: '', image: '', 
        summary: '', category: 'عمومی', seo_title: '', seo_desc: '', tags: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // ساخت Slug خودکار
      let finalSlug = formData.slug;
      if (!finalSlug) {
        finalSlug = formData.title.trim().toLowerCase().replace(/\s+/g, '-');
      }

      // تبدیل تگ‌های متنی به آرایه
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');

      const postData = { 
        title: formData.title,
        slug: finalSlug,
        content: formData.content,
        image: formData.image,
        summary: formData.summary,
        category: formData.category,
        seo_title: formData.seo_title,
        seo_desc: formData.seo_desc,
        tags: tagsArray
      };

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
           <h2 className="text-2xl font-bold text-gray-800">وبلاگ و مقالات (SEO Pro)</h2>
           <p className="text-sm text-gray-500">مدیریت محتوای قدرتمند برای جذب ترافیک گوگل</p>
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
            <div className="relative h-48 bg-gray-100 group">
                {post.image ? (
                    <img src={post.image} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300"><BookOpen className="h-10 w-10"/></div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(post)} className="p-2 bg-white/90 rounded-full text-blue-600 shadow-sm"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 bg-white/90 rounded-full text-red-500 shadow-sm"><Trash2 className="h-4 w-4" /></button>
                </div>
                {post.category && (
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                        {post.category}
                    </span>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{post.title}</h3>
                <p className="text-xs text-gray-400 font-mono mb-2">/{post.slug}</p>
                {post.summary ? (
                    <p className="text-sm text-gray-600 line-clamp-3 mt-auto">{post.summary}</p>
                ) : (
                    <p className="text-sm text-gray-400 line-clamp-3 mt-auto italic">بدون چکیده</p>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDIT/ADD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{editingPost ? 'ویرایش مقاله' : 'نوشتن مقاله جدید'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* بخش ۱: اطلاعات اصلی */}
              <div className="space-y-4">
                 <h4 className="font-bold text-blue-800 text-sm border-b pb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4"/> ۱. اطلاعات اصلی مقاله
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">عنوان مقاله (H1)</label>
                        <input type="text" required className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="مثال: راهنمای جامع ارسال پسته" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">آدرس (Slug)</label>
                        <input type="text" className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dir-ltr text-left" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="send-pistachio-iran" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">دسته‌بندی</label>
                        <input type="text" className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="مثال: آموزش ارز دیجیتال" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">خلاصه‌ی مقاله (چکیده)</label>
                        <textarea rows={2} className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 resize-none" value={formData.summary} onChange={(e) => setFormData({...formData, summary: e.target.value})} placeholder="یک متن کوتاه ۲-۳ خطی برای نمایش در کارت مقاله..." />
                    </div>
                 </div>
              </div>

              {/* بخش ۲: محتوا */}
              <div className="space-y-4">
                 <h4 className="font-bold text-blue-800 text-sm border-b pb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4"/> ۲. محتوای مقاله و تصویر
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">متن کامل مقاله</label>
                        <textarea required className="w-full h-64 p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 resize-none" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="متن خود را اینجا بنویسید..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">تصویر شاخص</label>
                        {formData.image ? (
                        <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={formData.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button type="button" onClick={openGallery} className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm">تغییر</button>
                                <button type="button" onClick={() => setFormData({...formData, image: ''})} className="bg-red-500 text-white p-1 rounded-full"><X className="h-4 w-4"/></button>
                            </div>
                        </div>
                        ) : (
                        <button type="button" onClick={openGallery} className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all">
                            <ImageIcon className="h-8 w-8 mb-2"/>
                            <span className="text-xs">انتخاب تصویر</span>
                        </button>
                        )}
                    </div>
                 </div>
              </div>

              {/* بخش ۳: تنظیمات سئو */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-200">
                 <h4 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Search className="h-4 w-4"/> ۳. تنظیمات پیشرفته سئو (SEO)
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">عنوان سئو (SEO Title)</label>
                        <input type="text" className="w-full p-2 rounded border border-gray-300 text-sm" value={formData.seo_title} onChange={(e) => setFormData({...formData, seo_title: e.target.value})} placeholder="اگر خالی باشد، از عنوان اصلی استفاده می‌شود" />
                        <p className="text-[10px] text-gray-400 mt-1">عنوانی که در نتایج گوگل نمایش داده می‌شود (حداکثر ۶۰ کاراکتر).</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">توضیحات متا (Meta Description)</label>
                        <textarea rows={2} className="w-full p-2 rounded border border-gray-300 text-sm" value={formData.seo_desc} onChange={(e) => setFormData({...formData, seo_desc: e.target.value})} placeholder="توضیحی جذاب برای نمایش در گوگل..." />
                        <p className="text-[10px] text-gray-400 mt-1">مهم‌ترین بخش برای افزایش کلیک (حداکثر ۱۶۰ کاراکتر).</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Tag className="h-3 w-3"/> کلمات کلیدی (Tags)</label>
                        <input type="text" className="w-full p-2 rounded border border-gray-300 text-sm" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="ارسال پول، ارز دیجیتال، سوغات (با کاما جدا کنید)" />
                    </div>
                 </div>
              </div>

            </form>
            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">انصراف</button>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Check className="h-5 w-5" />}
                    {isSaving ? 'در حال انتشار...' : 'انتشار مقاله'}
                </button>
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
                     <div key={file.id} onClick={() => selectImage(file.url)} className="aspect-square rounded-xl overflow-hidden cursor-pointer border hover:border-blue-500 relative group">
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