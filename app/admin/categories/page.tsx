'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Layers, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string; // فیلد جدید اضافه شد
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // فرم افزودن
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newIconUrl, setNewIconUrl] = useState(''); // استیت جدید برای آیکون

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
      // چک کنیم تکراری نباشه
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', newSlug)
        .single();
      
      if (existing) {
        alert('این نامک (Slug) قبلاً استفاده شده است.');
        setAdding(false);
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name: newName, 
          slug: newSlug, 
          icon_url: newIconUrl // ارسال آیکون به دیتابیس
        }]);

      if (error) throw error;

      await fetchCategories();
      setNewName('');
      setNewSlug('');
      setNewIconUrl(''); // ریست کردن فیلد
    } catch (error: any) {
      alert('خطا: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟ حذف دسته‌بندی ممکن است محصولات متصل به آن را بدون دسته کند.')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
    } else {
      alert('خطا در حذف');
    }
  };

  const handleNameChange = (val: string) => {
    setNewName(val);
  };

  if (loading) return <div className="p-10 text-center">در حال بارگذاری...</div>;

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      <div>
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-600" />
            مدیریت دسته‌بندی‌ها
         </h2>
         <p className="text-sm text-gray-500 mt-1">دسته‌های محصول را اینجا تعریف کنید تا در سایت نمایش داده شوند.</p>
      </div>

      {/* فرم افزودن */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4 text-sm">افزودن دسته جدید</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="w-full">
              <label className="text-xs text-gray-500 mb-1 block">عنوان فارسی (مثال: زعفران)</label>
              <input 
                type="text" 
                required
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                placeholder="نام دسته..."
              />
            </div>
            <div className="w-full">
              <label className="text-xs text-gray-500 mb-1 block">نامک انگلیسی (Slug)</label>
              <input 
                type="text" 
                required
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none dir-ltr text-left font-mono"
                placeholder="e.g: saffron-premium"
              />
            </div>
            <div className="w-full">
              <label className="text-xs text-gray-500 mb-1 block">لینک آیکون (PNG یا SVG)</label>
              <input 
                type="text" 
                value={newIconUrl}
                onChange={(e) => setNewIconUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none dir-ltr text-left"
                placeholder="https://example.com/icon.png"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={adding}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm flex justify-center gap-2 items-center"
            >
              {adding ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus className="h-5 w-5" />}
              افزودن دسته
            </button>
          </div>
        </form>
      </div>

      {/* لیست دسته‌ها */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">آیکون</th>
              <th className="px-6 py-4">نام دسته</th>
              <th className="px-6 py-4">نامک (Slug)</th>
              <th className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  {cat.icon_url ? (
                    <img src={cat.icon_url} alt={cat.name} className="h-10 w-10 object-contain bg-gray-50 rounded-lg p-1" />
                  ) : (
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">{cat.name}</td>
                <td className="px-6 py-4 font-mono text-gray-500 text-sm dir-ltr text-right">{cat.slug}</td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                           <AlertCircle className="h-8 w-8 opacity-50" />
                           هنوز دسته‌بندی نساخته‌اید.
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}