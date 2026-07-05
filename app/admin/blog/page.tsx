'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Search, X, ImageIcon, Check, BookOpen, Loader2, Tag, Layers, FileText, Eye, Code2 } from 'lucide-react';
import { sanitizePostHtml } from '@/lib/sanitizeHtml';

// --- Types ---
interface Post {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  content: string;
  content_en?: string;
  image: string;
  image_en?: string;
  created_at: string;
  seo_title?: string;
  seo_title_en?: string;
  seo_desc?: string;
  seo_desc_en?: string;
  summary?: string;
  summary_en?: string;
  category?: string;
  category_en?: string;
  tags?: string[];
  tags_en?: string[];
}

interface CategoryItem {
  id: string;
  name: string;
}

interface TagItem {
  id: string;
  name: string;
}

interface MediaFile {
  name: string;
  url: string;
  id: string;
}

const BATCH_SIZE = 20;

const EMPTY_FORM = {
  title: '', title_en: '',
  slug: '',
  content: '', content_en: '',
  image: '', image_en: '',
  summary: '', summary_en: '',
  category: '', category_en: '',
  seo_title: '', seo_title_en: '',
  seo_desc: '', seo_desc_en: '',
  tags: '', tags_en: '',
};

export default function BlogPage() {
  // --- States ---
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'tags'>('posts');
  
  // Data States
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  
  // Loading States for Posts
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Post Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // ✅ کدام زبان در حال ویرایش است (فارسی یا انگلیسی)
  const [contentLang, setContentLang] = useState<'fa' | 'en'>('fa');
  // ✅ نمایش کد HTML خام یا پیش‌نمایش رندر شده‌ی آن
  const [showPreview, setShowPreview] = useState(false);

  // Media Gallery States (Smart Loading)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaLoadingMore, setMediaLoadingMore] = useState(false);
  const [mediaHasMore, setMediaHasMore] = useState(true);
  // کدام فیلد (تصویر فارسی یا انگلیسی) توسط گالری پر می‌شود
  const [galleryTarget, setGalleryTarget] = useState<'image' | 'image_en'>('image');

  // Category/Tag Management States
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  // --- Observers ---
  const postObserver = useRef<IntersectionObserver | null>(null);
  const mediaObserver = useRef<IntersectionObserver | null>(null);

  // 1. Post Scroll Observer
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingPosts || loadingMorePosts) return;
    if (postObserver.current) postObserver.current.disconnect();
    
    postObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMorePosts && !searchTerm) {
        fetchPosts(false);
      }
    });
    
    if (node) postObserver.current.observe(node);
  }, [loadingPosts, loadingMorePosts, hasMorePosts, searchTerm]);

  // 2. Media Scroll Observer
  const lastMediaElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMedia || mediaLoadingMore) return;
    if (mediaObserver.current) mediaObserver.current.disconnect();
    
    mediaObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && mediaHasMore) {
        fetchMedia(false);
      }
    });
    
    if (node) mediaObserver.current.observe(node);
  }, [loadingMedia, mediaLoadingMore, mediaHasMore]);


  // --- Initial Fetch ---
  useEffect(() => {
    fetchAllData();
  }, []);

  // Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchPosts(true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchAllData = async () => {
    setLoadingPosts(true);
    await Promise.all([fetchPosts(true), fetchCategories(), fetchTags()]);
    setLoadingPosts(false);
  };

  // --- Smart Fetch Posts ---
  const fetchPosts = async (isInitial = true) => {
    if (isInitial) {
        if (!searchTerm) setLoadingPosts(true);
        setHasMorePosts(true);
    } else {
        setLoadingMorePosts(true);
    }

    const currentOffset = isInitial ? 0 : posts.length;

    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
    } else {
        query = query.range(currentOffset, currentOffset + BATCH_SIZE - 1);
    }

    const { data } = await query;

    if (data) {
        if (isInitial) {
            setPosts(data);
        } else {
            setPosts(prev => [...prev, ...data]);
        }

        if (data.length < BATCH_SIZE) {
            setHasMorePosts(false);
        }
    }
    setLoadingPosts(false);
    setLoadingMorePosts(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('blog_categories').select('*').order('created_at', { ascending: true });
    if (data) setCategories(data);
  };

  const fetchTags = async () => {
    const { data } = await supabase.from('blog_tags').select('*').order('created_at', { ascending: true });
    if (data) setTags(data);
  };

  // --- Smart Fetch Media ---
  const fetchMedia = async (isInitial = true) => {
    if (isInitial) {
      setLoadingMedia(true);
      setMediaFiles([]);
      setMediaHasMore(true);
    } else {
      setMediaLoadingMore(true);
    }

    const currentOffset = isInitial ? 0 : mediaFiles.length;

    const { data } = await supabase.storage.from('media').list('', {
      limit: BATCH_SIZE,
      offset: currentOffset,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (data) {
      const files = data.map((file) => {
        const { data: url } = supabase.storage.from('media').getPublicUrl(file.name);
        return { name: file.name, id: file.id, url: url.publicUrl };
      });

      if (data.length < BATCH_SIZE) {
        setMediaHasMore(false);
      }

      setMediaFiles(prev => isInitial ? files : [...prev, ...files]);
    }
    setLoadingMedia(false);
    setMediaLoadingMore(false);
  };

  // --- Post Logic ---
  const openModal = (post?: Post) => {
    const defaultCat = categories.length > 0 ? categories[0].name : '';
    setContentLang('fa');
    setShowPreview(false);

    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        title_en: post.title_en || '',
        slug: post.slug,
        content: post.content,
        content_en: post.content_en || '',
        image: post.image,
        image_en: post.image_en || '',
        summary: post.summary || '',
        summary_en: post.summary_en || '',
        category: post.category || defaultCat,
        category_en: post.category_en || '',
        seo_title: post.seo_title || '',
        seo_title_en: post.seo_title_en || '',
        seo_desc: post.seo_desc || '',
        seo_desc_en: post.seo_desc_en || '',
        tags: post.tags ? post.tags.join(', ') : '',
        tags_en: post.tags_en ? post.tags_en.join(', ') : '',
      });
    } else {
      setEditingPost(null);
      setFormData({ ...EMPTY_FORM, category: defaultCat });
    }
    setIsModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalSlug = formData.slug;
      if (!finalSlug) {
        finalSlug = formData.title.trim().toLowerCase().replace(/\s+/g, '-');
      }
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      const tagsEnArray = formData.tags_en.split(',').map(t => t.trim()).filter(t => t !== '');

      const postData = {
        title: formData.title,
        title_en: formData.title_en || null,
        slug: finalSlug,
        content: formData.content,
        content_en: formData.content_en || null,
        image: formData.image,
        image_en: formData.image_en || null,
        summary: formData.summary,
        summary_en: formData.summary_en || null,
        category: formData.category,
        category_en: formData.category_en || null,
        seo_title: formData.seo_title,
        seo_title_en: formData.seo_title_en || null,
        seo_desc: formData.seo_desc,
        seo_desc_en: formData.seo_desc_en || null,
        tags: tagsArray,
        tags_en: tagsEnArray,
      };
      if (editingPost) {
        const { error } = await supabase.from('posts').update(postData).eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert([postData]);
        if (error) throw error;
      }
      await fetchPosts(true);
      setIsModalOpen(false);
    } catch (error: any) {
      alert('خطا: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) setPosts(posts.filter(p => p.id !== id));
  };

  // --- Category & Tag Logic (Standard) ---
  const handleAddItem = async (type: 'category' | 'tag') => {
    if (!newItemName.trim()) return;
    setAddingItem(true);
    const table = type === 'category' ? 'blog_categories' : 'blog_tags';
    try {
      const { error } = await supabase.from(table).insert([{ name: newItemName }]);
      if (error) throw error;
      setNewItemName('');
      if (type === 'category') await fetchCategories();
      else await fetchTags();
    } catch (error: any) {
      alert('خطا: ' + error.message);
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (id: string, type: 'category' | 'tag') => {
    if (!confirm('حذف شود؟')) return;
    const table = type === 'category' ? 'blog_categories' : 'blog_tags';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      if (type === 'category') setCategories(categories.filter(c => c.id !== id));
      else setTags(tags.filter(t => t.id !== id));
    }
  };

  // ✅ حالا openGallery مشخص می‌کند که تصویر انتخاب‌شده برای کدام فیلد است (فارسی یا انگلیسی)
  const openGallery = (target: 'image' | 'image_en' = 'image') => {
    setGalleryTarget(target);
    setIsGalleryOpen(true);
    fetchMedia(true);
  };
  const selectImage = (url: string) => { setFormData({ ...formData, [galleryTarget]: url }); setIsGalleryOpen(false); };

  // --- کمک‌کننده‌های دوزبانه (فارسی/انگلیسی) برای فیلدهای محتوا ---
  const contentField = contentLang === 'fa' ? 'content' : 'content_en';
  const titleField = contentLang === 'fa' ? 'title' : 'title_en';
  const summaryField = contentLang === 'fa' ? 'summary' : 'summary_en';
  const seoTitleField = contentLang === 'fa' ? 'seo_title' : 'seo_title_en';
  const seoDescField = contentLang === 'fa' ? 'seo_desc' : 'seo_desc_en';
  const tagsField = contentLang === 'fa' ? 'tags' : 'tags_en';
  const categoryField = contentLang === 'fa' ? 'category' : 'category_en';

  if (loadingPosts && posts.length === 0) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">مدیریت وبلاگ</h2>
           <p className="text-sm text-gray-500">مدیریت محتوا، دسته‌بندی‌ها و تگ‌ها</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button 
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'posts' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                مقالات
            </button>
            <button 
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                دسته‌بندی‌ها
            </button>
            <button 
                onClick={() => setActiveTab('tags')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tags' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                تگ‌ها
            </button>
        </div>
      </div>

      {/* --- TAB 1: POSTS --- */}
      {activeTab === 'posts' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="جستجوی مقالات..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-9 pl-4 py-3 text-sm bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100" />
                 </div>
                 <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700 shadow-md font-bold">
                    <Plus className="h-5 w-5" />
                    مطلب جدید
                 </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => {
                    const isLast = index === posts.length - 1;
                    return (
                        <div 
                            key={post.id} 
                            ref={isLast ? lastPostElementRef : null}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all"
                        >
                            <div className="relative h-48 bg-gray-100 group">
                                {post.image ? <img src={post.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300"><BookOpen className="h-10 w-10"/></div>}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(post)} className="p-2 bg-white/90 rounded-full text-blue-600 shadow-sm"><Edit2 className="h-4 w-4" /></button>
                                    <button onClick={() => handleDeletePost(post.id)} className="p-2 bg-white/90 rounded-full text-red-500 shadow-sm"><Trash2 className="h-4 w-4" /></button>
                                </div>
                                {post.category && (
                                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                                        {post.category}
                                    </span>
                                )}
                                {(post.image_en || post.title_en || post.content_en) && (
                                    <span className="absolute bottom-2 left-2 bg-blue-600/90 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                                        EN ✓
                                    </span>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{post.title}</h3>
                                <p className="text-xs text-gray-400 font-mono mb-2">/{post.slug}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {loadingMorePosts && (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-blue-600"/></div>
            )}
            {!hasMorePosts && posts.length > 0 && !searchTerm && (
                <p className="text-center text-gray-400 text-xs mt-4">تمام مقالات بارگذاری شدند.</p>
            )}
            {posts.length === 0 && !loadingPosts && (
                <p className="text-center text-gray-400 text-sm py-10">مقاله‌ای یافت نشد.</p>
            )}
        </div>
      )}

      {/* --- TAB 2 & 3: CATEGORIES & TAGS (Shared Layout) --- */}
      {(activeTab === 'categories' || activeTab === 'tags') && (
         <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     {activeTab === 'categories' ? <Layers className="h-5 w-5"/> : <Tag className="h-5 w-5"/>}
                     {activeTab === 'categories' ? 'مدیریت دسته‌بندی‌ها' : 'مدیریت تگ‌ها'}
                 </h3>
             </div>
             
             {/* Add New */}
             <div className="p-4 border-b border-gray-100 flex gap-2">
                 <input 
                    type="text" 
                    placeholder={activeTab === 'categories' ? "نام دسته‌بندی جدید..." : "نام تگ جدید..."}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 text-sm"
                 />
                 <button 
                    onClick={() => handleAddItem(activeTab === 'categories' ? 'category' : 'tag')}
                    disabled={addingItem || !newItemName}
                    className="bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold"
                 >
                    {addingItem ? <Loader2 className="animate-spin h-5 w-5"/> : <Plus className="h-5 w-5"/>}
                 </button>
             </div>

             {/* List */}
             <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                 {(activeTab === 'categories' ? categories : tags).map((item) => (
                      <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                         <span className="font-medium text-gray-700">{item.name}</span>
                         <button onClick={() => handleDeleteItem(item.id, activeTab === 'categories' ? 'category' : 'tag')} className="text-red-400 hover:text-red-600 p-2">
                             <Trash2 className="h-4 w-4" />
                         </button>
                     </div>
                 ))}
                 {(activeTab === 'categories' ? categories : tags).length === 0 && (
                     <p className="p-8 text-center text-gray-400 text-sm">موردی یافت نشد.</p>
                 )}
             </div>
         </div>
      )}


      {/* --- POST MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="text-lg font-bold text-gray-900">{editingPost ? 'ویرایش مقاله' : 'نوشتن مقاله جدید'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-red-500" /></button>
            </div>

            <form onSubmit={handleSavePost} className="p-6 overflow-y-auto flex-1 space-y-8">

              {/* آدرس (Slug) - مشترک بین دو زبان چون هر دو نسخه از یک آدرس با پیشوند fa/en استفاده می‌کنند */}
              <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">آدرس (Slug) — مشترک برای هر دو زبان</label>
                  <input type="text" className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dir-ltr text-left" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="send-pistachio-iran" />
              </div>

              {/* سوییچ زبان: از اینجا به بعد، عنوان/دسته/خلاصه/محتوا/سئو/تگ‌ها بسته به زبان انتخابی نمایش داده می‌شوند */}
              <div className="flex items-center justify-between flex-wrap gap-2 bg-blue-50/60 border border-blue-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                      <button
                          type="button"
                          onClick={() => setContentLang('fa')}
                          className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${contentLang === 'fa' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                          🇮🇷 فارسی
                      </button>
                      <button
                          type="button"
                          onClick={() => setContentLang('en')}
                          className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${contentLang === 'en' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                          🇬🇧 English
                      </button>
                  </div>
                  <p className="text-[11px] text-gray-500 max-w-md">
                      نسخه‌ی انگلیسی اختیاری است؛ اگر خالی بماند، برای بازدیدکننده‌ی انگلیسی‌زبان همان نسخه‌ی فارسی نمایش داده می‌شود.
                  </p>
              </div>

              {/* بخش ۱: اطلاعات اصلی */}
              <div className="space-y-4">
                 <h4 className="font-bold text-blue-800 text-sm border-b pb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4"/> ۱. اطلاعات اصلی ({contentLang === 'fa' ? 'فارسی' : 'English'})
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">عنوان مقاله (H1)</label>
                        <input
                            type="text"
                            required={contentLang === 'fa'}
                            dir={contentLang === 'en' ? 'ltr' : 'rtl'}
                            className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
                            value={formData[titleField]}
                            onChange={(e) => setFormData({...formData, [titleField]: e.target.value})}
                            placeholder={contentLang === 'fa' ? 'مثال: راهنمای جامع ارسال پسته' : 'e.g. Complete Guide to Sending Pistachios'}
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-700 mb-1">دسته‌بندی</label>
                         {contentLang === 'fa' ? (
                            <select
                                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 bg-white"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                 {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                         ) : (
                            <input
                                type="text"
                                dir="ltr"
                                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
                                value={formData.category_en}
                                onChange={(e) => setFormData({...formData, category_en: e.target.value})}
                                placeholder="e.g. General (optional, free text)"
                            />
                         )}
                    </div>
                   <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">خلاصه‌ی مقاله (چکیده)</label>
                        <textarea
                            rows={2}
                            dir={contentLang === 'en' ? 'ltr' : 'rtl'}
                            className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 resize-none"
                            value={formData[summaryField]}
                            onChange={(e) => setFormData({...formData, [summaryField]: e.target.value})}
                            placeholder={contentLang === 'fa' ? 'یک متن کوتاه ۲-۳ خطی...' : 'A short 2-3 line summary...'}
                        />
                   </div>
                 </div>
              </div>

              {/* بخش ۲: محتوا و تصاویر */}
              <div className="space-y-4">
                 <h4 className="font-bold text-blue-800 text-sm border-b pb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4"/> ۲. محتوا و تصاویر ({contentLang === 'fa' ? 'فارسی' : 'English'})
                 </h4>

                 {/* راهنمای تگ‌های HTML مجاز */}
                 <details className="text-xs bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-700">
                    <summary className="cursor-pointer font-bold text-blue-700 select-none">
                       راهنمای نوشتن محتوا با HTML (برای رنگ، بولد و لینک) — کلیک کنید
                    </summary>
                    <ul className="mt-2 space-y-1.5 list-disc pr-4 dir-ltr text-left" dir="ltr">
                        <li><code className="bg-white px-1 rounded border">&lt;p&gt;متن پاراگراف&lt;/p&gt;</code> — یک پاراگراف تازه</li>
                        <li><code className="bg-white px-1 rounded border">&lt;b&gt;متن پررنگ&lt;/b&gt;</code> — بولد</li>
                        <li><code className="bg-white px-1 rounded border">&lt;span style="color:#e11d48;"&gt;متن رنگی&lt;/span&gt;</code> — رنگی کردن متن</li>
                        <li><code className="bg-white px-1 rounded border">&lt;a href="/fa/products/gaz-kermani"&gt;مشاهده محصول&lt;/a&gt;</code> — لینک به صفحه‌ی دیگر سایت</li>
                        <li><code className="bg-white px-1 rounded border">&lt;h2&gt;عنوان بخش&lt;/h2&gt;</code> — تیتر (h2, h3, h4 هم پشتیبانی می‌شود)</li>
                        <li><code className="bg-white px-1 rounded border">&lt;ul&gt;&lt;li&gt;مورد اول&lt;/li&gt;&lt;/ul&gt;</code> — لیست</li>
                    </ul>
                    <p className="mt-2 text-gray-500 dir-rtl text-right" dir="rtl">
                        فقط تگ‌ها و ویژگی‌های امن رندر می‌شوند؛ کدهای مخرب مثل اسکریپت به‌طور خودکار حذف می‌شوند. برای دیدن نتیجه، از دکمه‌ی «پیش‌نمایش» زیر استفاده کنید.
                    </p>
                 </details>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-gray-700">متن مقاله (کد HTML)</label>
                            <button
                                type="button"
                                onClick={() => setShowPreview(p => !p)}
                                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                            >
                                {showPreview ? <><Code2 className="h-3.5 w-3.5" /> نمایش کد</> : <><Eye className="h-3.5 w-3.5" /> پیش‌نمایش</>}
                            </button>
                        </div>

                        {showPreview ? (
                            <div
                                className="post-content w-full h-64 p-3 rounded-lg border border-gray-300 overflow-y-auto bg-white text-sm"
                                dir={contentLang === 'en' ? 'ltr' : 'rtl'}
                                dangerouslySetInnerHTML={{ __html: sanitizePostHtml(formData[contentField]) || '<p class="text-gray-400">چیزی برای پیش‌نمایش نوشته نشده...</p>' }}
                            />
                        ) : (
                            <textarea
                                required={contentLang === 'fa'}
                                dir="ltr"
                                className="w-full h-64 p-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500 resize-none font-mono text-xs leading-6"
                                value={formData[contentField]}
                                onChange={(e) => setFormData({...formData, [contentField]: e.target.value})}
                                placeholder={'<p>متن خود را اینجا بنویسید...</p>\n<p><b>پررنگ</b> و <span style="color:#e11d48;">رنگی</span> و <a href="/fa/products/xyz">لینک</a> هم می‌توانید اضافه کنید.</p>'}
                            />
                        )}
                    </div>

                    {/* تصویر شاخص (فارسی) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">تصویر شاخص (فارسی)</label>
                        {formData.image ? (
                        <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={formData.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button type="button" onClick={() => openGallery('image')} className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm">تغییر</button>
                                <button type="button" onClick={() => setFormData({...formData, image: ''})} className="bg-red-500 text-white p-1 rounded-full"><X className="h-4 w-4"/></button>
                            </div>
                        </div>
                        ) : (
                        <button type="button" onClick={() => openGallery('image')} className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all">
                            <ImageIcon className="h-8 w-8 mb-2"/>
                            <span className="text-xs">انتخاب تصویر</span>
                        </button>
                        )}
                    </div>

                    {/* ✅ تصویر انگلیسی (اختیاری) - در صورت خالی بودن، همان تصویر فارسی نمایش داده می‌شود */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">تصویر انگلیسی (اختیاری)</label>
                        {formData.image_en ? (
                        <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={formData.image_en} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button type="button" onClick={() => openGallery('image_en')} className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm">تغییر</button>
                                <button type="button" onClick={() => setFormData({...formData, image_en: ''})} className="bg-red-500 text-white p-1 rounded-full"><X className="h-4 w-4"/></button>
                            </div>
                        </div>
                        ) : (
                        <button type="button" onClick={() => openGallery('image_en')} className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all p-2">
                            <ImageIcon className="h-8 w-8 mb-2"/>
                            <span className="text-[11px] text-center leading-4">بدون تصویر جدا؛<br/>تصویر فارسی نمایش داده می‌شود</span>
                        </button>
                        )}
                    </div>
                 </div>
              </div>

              {/* بخش ۳: سئو */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-200">
                 <h4 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Search className="h-4 w-4"/> ۳. تنظیمات سئو ({contentLang === 'fa' ? 'فارسی' : 'English'})
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">عنوان سئو</label>
                        <input
                            type="text"
                            dir={contentLang === 'en' ? 'ltr' : 'rtl'}
                            className="w-full p-2 rounded border border-gray-300 text-sm"
                            value={formData[seoTitleField]}
                            onChange={(e) => setFormData({...formData, [seoTitleField]: e.target.value})}
                            placeholder={contentLang === 'fa' ? 'عنوان گوگل (۶۰ کاراکتر)' : 'Google title (60 chars)'}
                        />
                    </div>
                   <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">توضیحات متا</label>
                        <textarea
                            rows={2}
                            dir={contentLang === 'en' ? 'ltr' : 'rtl'}
                            className="w-full p-2 rounded border border-gray-300 text-sm"
                            value={formData[seoDescField]}
                            onChange={(e) => setFormData({...formData, [seoDescField]: e.target.value})}
                            placeholder={contentLang === 'fa' ? 'توضیحات گوگل (۱۶۰ کاراکتر)' : 'Google meta description (160 chars)'}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Tag className="h-3 w-3"/> کلمات کلیدی</label>
                        <input
                            type="text"
                            dir={contentLang === 'en' ? 'ltr' : 'rtl'}
                            className="w-full p-2 rounded border border-gray-300 text-sm"
                            value={formData[tagsField]}
                            onChange={(e) => setFormData({...formData, [tagsField]: e.target.value})}
                            placeholder={contentLang === 'fa' ? 'با کاما جدا کنید...' : 'Comma separated...'}
                        />
                        {contentLang === 'fa' && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {/* پیشنهاد تگ‌ها از لیست موجود */}
                                {tags.map(t => (
                                    <button type="button" key={t.id} onClick={() => setFormData({...formData, tags: formData.tags ? `${formData.tags}, ${t.name}` : t.name})} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md hover:border-blue-400 transition-colors">
                                        + {t.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                 </div>
              </div>

            </form>
            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">انصراف</button>
                <button onClick={handleSavePost} disabled={isSaving} className="flex-1 py-3 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                   {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Check className="h-5 w-5" />}
                    {isSaving ? 'در حال انتشار...' : 'انتشار مقاله'}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY MODAL (SMART) */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    انتخاب تصویر {galleryTarget === 'image_en' ? '(نسخه انگلیسی)' : '(نسخه فارسی)'}
                </h3>
                <button onClick={() => setIsGalleryOpen(false)}><X className="h-6 w-6 text-gray-400" /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
               {loadingMedia && mediaFiles.length === 0 ? (
                 <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
               ) : (
                 <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                   {mediaFiles.map((file, index) => {
                     const isLast = index === mediaFiles.length - 1;
                     return (
                        <div 
                            key={file.id} 
                            ref={isLast ? lastMediaElementRef : null}
                            onClick={() => selectImage(file.url)} 
                            className="aspect-square rounded-xl overflow-hidden cursor-pointer border hover:border-blue-500 relative group"
                        >
                            <img src={file.url} className="w-full h-full object-cover" />
                        </div>
                     );
                   })}
                 </div>
               )}
               {mediaLoadingMore && (
                  <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-blue-600"/></div>
               )}
            </div>
           </div>
        </div>
      )}
    </div>
  );
}