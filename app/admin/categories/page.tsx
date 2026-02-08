'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Layers, Loader2, Image as ImageIcon, Edit2, X, Save, Globe, FileText, Search } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string;
  name_en?: string;
  // فیلدهای جدید
  description?: string;
  description_en?: string;
  seo_title?: string;
  seo_desc?: string;
  seo_title_en?: string;
  seo_desc_en?: string;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // برای مودال ویرایش
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // فرم افزودن سریع (فقط اطلاعات پایه)
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newIconUrl, setNewIconUrl] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSlug) return;
    setAdding(true);

    try {
      const { data: existing } = await supabase.from('categories').select('id').eq('slug', newSlug).single();
      if (existing) {
        alert('این نامک (Slug) قبلاً استفاده شده است.');
        setAdding(false);
        return;
      }

      const { error } = await supabase.from('categories').insert([{ 
          name: newName, 
          slug: newSlug, 
          icon_url: newIconUrl 
        }]);

      if (error) throw error;

      await fetchCategories();
      setNewName('');
      setNewSlug('');
      setNewIconUrl('');
    } catch (error: any) {
      alert('خطا: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) setCategories(categories.filter(c => c.id !== id));
    else alert('خطا در حذف');
  };

  // باز کردن مودال ویرایش
  const openEditModal = (cat: Category) => {
    setEditingCategory({ ...cat }); // کپی کردن آبجکت برای جلوگیری از تغییر مستقیم
    setIsModalOpen(true);
  };

  // ذخیره تغییرات کامل (شامل سئو و توضیحات)
  const handleUpdate = async () => {
    if (!editingCategory) return;
    setSaving(true);
    try {
        const { error } = await supabase
            .from('categories')
            .update({
                name: editingCategory.name,
                name_en: editingCategory.name_en,
                slug: editingCategory.slug,
                icon_url: editingCategory.icon_url,
                description: editingCategory.description,
                description_en: editingCategory.description_en,
                seo_title: editingCategory.seo_title,
                seo_desc: editingCategory.seo_desc,
                seo_title_en: editingCategory.seo_title_en,
                seo_desc_en: editingCategory.seo_desc_en
            })
            .eq('id', editingCategory.id);

        if (error) throw error;
        
        await fetchCategories();
        setIsModalOpen(false);
    } catch (error: any) {
        alert('خطا در بروزرسانی: ' + error.message);
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600"/></div>;

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      
      {/* Header */}
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Layers className="h-6 w-6 text-blue-600" />
                مدیریت دسته‌بندی‌ها
            </h2>
            <p className="text-sm text-gray-500 mt-1">مدیریت نام، آیکون و سئوی دسته‌ها</p>
         </div>
      </div>

      {/* فرم افزودن سریع */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4 text-sm">افزودن دسته جدید (اطلاعات پایه)</h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs text-gray-500 mb-1 block">عنوان فارسی</label>
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="مثال: زعفران" />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs text-gray-500 mb-1 block">نامک (Slug)</label>
              <input type="text" required value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none dir-ltr text-left" placeholder="saffron" />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs text-gray-500 mb-1 block">لینک آیکون</label>
              <input type="text" value={newIconUrl} onChange={(e) => setNewIconUrl(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none dir-ltr text-left" placeholder="https://..." />
            </div>
            <button type="submit" disabled={adding} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm flex gap-2 items-center">
              {adding ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus className="h-5 w-5" />} افزودن
            </button>
        </form>
      </div>

      {/* لیست دسته‌ها */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">آیکون</th>
              <th className="px-6 py-4">نام دسته</th>
              <th className="px-6 py-4">وضعیت سئو</th>
              <th className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  {cat.icon_url ? <img src={cat.icon_url} className="h-10 w-10 object-contain" /> : <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center"><ImageIcon className="h-5 w-5 text-gray-400"/></div>}
                </td>
                <td className="px-6 py-4">
                    <span className="font-bold text-gray-800 block">{cat.name}</span>
                    <span className="text-xs text-gray-400 dir-ltr">{cat.slug}</span>
                </td>
                <td className="px-6 py-4">
                    {cat.description ? (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full">تکمیل شده</span>
                    ) : (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded-full">بدون محتوا</span>
                    )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEditModal(cat)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg" title="ویرایش کامل">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL EDIT (FULL SEO) --- */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Edit2 className="h-5 w-5 text-blue-600"/> ویرایش دسته: {editingCategory.name}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="h-6 w-6 text-gray-400 hover:text-red-500"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* 1. Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">نام فارسی</label>
                            <input type="text" className="w-full p-2 border rounded-lg" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">نام انگلیسی (Name EN)</label>
                            <input type="text" className="w-full p-2 border rounded-lg dir-ltr" value={editingCategory.name_en || ''} onChange={e => setEditingCategory({...editingCategory, name_en: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">نامک (Slug - غیرقابل تغییر توصیه می‌شود)</label>
                            <input type="text" className="w-full p-2 border rounded-lg dir-ltr bg-gray-50" value={editingCategory.slug} onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">آدرس آیکون</label>
                            <input type="text" className="w-full p-2 border rounded-lg dir-ltr" value={editingCategory.icon_url || ''} onChange={e => setEditingCategory({...editingCategory, icon_url: e.target.value})} />
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 2. Persian SEO & Content */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-green-700 flex items-center gap-2 border-b pb-2">
                            <span className="text-xl">🇮🇷</span> سئو و محتوای فارسی
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">عنوان سئو (Browser Title)</label>
                                <input type="text" className="w-full p-2 border rounded-lg" placeholder="مثال: خرید آنلاین گل و گیاه | ارسال به ایران" value={editingCategory.seo_title || ''} onChange={e => setEditingCategory({...editingCategory, seo_title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">توضیحات متا (Meta Description)</label>
                                <input type="text" className="w-full p-2 border rounded-lg" placeholder="توضیح کوتاه برای گوگل..." value={editingCategory.seo_desc || ''} onChange={e => setEditingCategory({...editingCategory, seo_desc: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">متن کامل پایین صفحه (پشتیبانی از HTML)</label>
                            <textarea 
                                rows={6} 
                                className="w-full p-3 border rounded-lg text-sm font-mono leading-6" 
                                placeholder="اینجا می‌توانید متن طولانی بنویسید. از تگ‌های <h2> و <p> استفاده کنید..."
                                value={editingCategory.description || ''} 
                                onChange={e => setEditingCategory({...editingCategory, description: e.target.value})}
                            ></textarea>
                            <p className="text-[10px] text-gray-400 mt-1">نکته: برای تیترها از تگ &lt;h2&gt;تیتر&lt;/h2&gt; و برای پاراگراف از &lt;p&gt;متن&lt;/p&gt; استفاده کنید.</p>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 3. English SEO & Content */}
                    <div className="space-y-4" dir="ltr">
                        <h4 className="font-bold text-blue-700 flex items-center gap-2 border-b pb-2">
                            <span className="text-xl">🇺🇸</span> English SEO & Content
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">SEO Title</label>
                                <input type="text" className="w-full p-2 border rounded-lg" placeholder="e.g: Send Flowers to Iran | Same Day Delivery" value={editingCategory.seo_title_en || ''} onChange={e => setEditingCategory({...editingCategory, seo_title_en: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Meta Description</label>
                                <input type="text" className="w-full p-2 border rounded-lg" placeholder="Short description for Google..." value={editingCategory.seo_desc_en || ''} onChange={e => setEditingCategory({...editingCategory, seo_desc_en: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Category Description (HTML Supported)</label>
                            <textarea 
                                rows={6} 
                                className="w-full p-3 border rounded-lg text-sm font-mono leading-6" 
                                placeholder="Write detailed content here using HTML tags..."
                                value={editingCategory.description_en || ''} 
                                onChange={e => setEditingCategory({...editingCategory, description_en: e.target.value})}
                            ></textarea>
                        </div>
                    </div>

                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-white transition-colors">انصراف</button>
                    <button onClick={handleUpdate} disabled={saving} className="px-8 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md flex items-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 className="animate-spin h-5 w-5"/> : <Save className="h-5 w-5"/>}
                        ذخیره تغییرات
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}