'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, Image as ImageIcon, LayoutTemplate } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // استیت برای نگهداری تنظیمات
  const [settings, setSettings] = useState({
    hero_banner: '',
    hero_title: '',
    hero_subtitle: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const newSettings: any = {};
      data.forEach(item => {
        newSettings[item.key] = item.value;
      });
      // اگر دیتابیس خالی بود، مقادیر پیش‌فرض نپره
      setSettings(prev => ({ ...prev, ...newSettings }));
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // ذخیره تک تک تنظیمات
      const updates = [
        { key: 'hero_banner', value: settings.hero_banner },
        { key: 'hero_title', value: settings.hero_title },
        { key: 'hero_subtitle', value: settings.hero_subtitle },
      ];

      for (const item of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(item, { onConflict: 'key' });
        if (error) throw error;
      }

      alert('تنظیمات با موفقیت ذخیره شد!');
    } catch (error: any) {
      alert('خطا در ذخیره سازی: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">در حال بارگذاری تنظیمات...</div>;

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      <div>
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-blue-600" />
            تنظیمات پوسته سایت
         </h2>
         <p className="text-sm text-gray-500 mt-1">مدیریت بنر اصلی، متن‌ها و ظاهر صفحه نخست</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        
        {/* بخش بنر اصلی */}
        <div className="space-y-4">
            <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">۱. تنظیمات بنر اصلی (Hero)</h3>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">آدرس تصویر بنر (لینک مستقیم)</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        dir="ltr"
                        placeholder="https://..."
                        value={settings.hero_banner}
                        onChange={(e) => setSettings({...settings, hero_banner: e.target.value})}
                        className="flex-1 p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    نکته: ابتدا تصویر را در بخش "رسانه" آپلود کنید، لینک آن را کپی کنید و اینجا قرار دهید.
                </p>
            </div>

            {/* پیش‌نمایش عکس */}
            {settings.hero_banner && (
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <img src={settings.hero_banner} className="w-full h-full object-cover" alt="Banner Preview" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تیتر اصلی (بزرگ)</label>
                    <input 
                        type="text" 
                        value={settings.hero_title}
                        onChange={(e) => setSettings({...settings, hero_title: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">زیرعنوان (توضیحات)</label>
                    <input 
                        type="text" 
                        value={settings.hero_subtitle}
                        onChange={(e) => setSettings({...settings, hero_subtitle: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
            <button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 shadow-md transition-all disabled:opacity-50"
            >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
        </div>

      </form>
    </div>
  );
}