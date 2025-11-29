'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UploadCloud, Trash2, Copy, Loader2, Check } from 'lucide-react';

interface MediaFile {
  name: string;
  url: string;
  id: string; 
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    // 1. دریافت لیست فایل‌ها از باکت media
    const { data, error } = await supabase.storage.from('media').list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (data) {
      // 2. ساخت لینک نمایش برای هر فایل
      const fileList = data.map((file) => {
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(file.name);
        return {
          name: file.name,
          id: file.id,
          url: publicUrlData.publicUrl,
        };
      });
      setFiles(fileList);
    } else if (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      // اسم فایل باید منحصر به فرد باشد (زمان + عدد شانسی)
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // آپلود به باکت 'media'
      const { error } = await supabase.storage.from('media').upload(fileName, file);

      if (error) throw error;

      await fetchImages(); // رفرش کردن لیست
    } catch (error: any) {
      alert('خطا در آپلود: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('آیا از حذف این تصویر مطمئن هستید؟ اگر در محصولی استفاده شده باشد، عکس آن حذف می‌شود!')) return;

    const { error } = await supabase.storage.from('media').remove([fileName]);
    
    if (error) {
      alert('خطا: ' + error.message);
    } else {
      await fetchImages();
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading && files.length === 0) return <div className="p-10 text-center">در حال بارگذاری گالری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">کتابخانه رسانه</h2>
           <p className="text-sm text-gray-500">مدیریت مرکزی تمام تصاویر سایت</p>
        </div>
        
        {/* دکمه آپلود */}
        <label className={`cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          <span>{uploading ? 'در حال آپلود...' : 'آپلود تصویر جدید'}</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* لیست تصاویر */}
      {files.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
            <div className="flex justify-center mb-4"><UploadCloud className="h-12 w-12 text-gray-300" /></div>
            <p className="text-gray-500">هنوز تصویری آپلود نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <div key={file.id} className="group relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <img src={file.url} alt="media" className="w-full h-full object-cover" />
              
              {/* دکمه‌های روی عکس */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button 
                  onClick={() => copyToClipboard(file.url, file.id)}
                  className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-100 w-full justify-center"
                >
                  {copiedId === file.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  {copiedId === file.id ? 'کپی شد' : 'لینک'}
                </button>
                
                <button 
                  onClick={() => handleDelete(file.name)}
                  className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                  title="حذف تصویر"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}