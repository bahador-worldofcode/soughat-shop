'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UploadCloud, Trash2, Copy, Loader2, Check } from 'lucide-react';

interface MediaFile {
  name: string;
  url: string;
  id: string;
}

// تعداد عکس در هر بار لود
const BATCH_SIZE = 20;

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true); // لودینگ اولیه صفحه
  const [loadingMore, setLoadingMore] = useState(false); // لودینگ پایین صفحه (اسکرول)
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // برای تشخیص اینکه آیا عکس دیگه‌ای مونده یا نه
  const [hasMore, setHasMore] = useState(true);

  // این متغیر برای اینه که بدونیم الان چند تا عکس لود کردیم (آفست)
  const [loadedCount, setLoadedCount] = useState(0);

  // رفرنس برای تشخیص اسکرول به پایین
  const observer = useRef<IntersectionObserver | null>(null);

  // تابعی که وقتی به آخرین عکس میرسیم اجرا میشه
  const lastImageElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        // اگر کاربر رسید به ته لیست و هنوز عکس بود، لود کن
        loadMoreImages();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // لود اولیه
  useEffect(() => {
    fetchImages(true);
  }, []);

  const fetchImages = async (isInitial = true) => {
    if (isInitial) {
      setLoading(true);
      setFiles([]);
      setLoadedCount(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    // محاسبه آفست (از کجای لیست شروع کنیم)
    const currentOffset = isInitial ? 0 : files.length;

    const { data, error } = await supabase.storage.from('media').list('', {
      limit: BATCH_SIZE,
      offset: currentOffset,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (data) {
      const fileList = data.map((file) => {
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(file.name);
        return {
          name: file.name,
          // نکته: طبق تایپ‌های خودِ سوپابیس، file.id می‌تونه null باشه.
          // این id فقط به‌عنوان کلید محلی/شناسه‌ی ری‌اکت استفاده می‌شه (نه برای
          // حذف واقعی از استوریج — اون از fileName استفاده می‌کنه)، پس اگه id
          // نال بود، از همون fileName (که خودش یکتاست) به‌جاش استفاده می‌کنیم.
          id: file.id ?? file.name,
          url: publicUrlData.publicUrl,
        };
      });

      // اگر تعداد عکس‌های برگشتی کمتر از حد مجاز بود، یعنی دیگه عکسی نیست
      if (data.length < BATCH_SIZE) {
        setHasMore(false);
      }

      setFiles(prev => isInitial ? fileList : [...prev, ...fileList]);
      setLoadedCount(prev => prev + data.length);
    } else if (error) {
      console.error(error);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const loadMoreImages = () => {
    fetchImages(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // نکته‌ی مهندسی (کاهش مصرف Cached Egress سوپابیس):
      // چون fileName همیشه یکتاست (Date.now() + عدد رندوم)، هیچ‌وقت یک فایل
      // با همین اسم دوباره آپلود/جایگزین نمی‌شود؛ پس تنظیم cacheControl روی
      // یک عدد بزرگ (۱ سال) کاملاً امن است و هیچ‌وقت باعث نمایش عکس قدیمی/
      // اشتباه نمی‌شود. این تنظیم به مرورگر کاربر، شبکه‌ی توزیع سوپابیس، و
      // بهینه‌ساز عکس Next.js اجازه می‌دهد همین یک نسخه‌ی کش‌شده را برای مدت
      // خیلی طولانی‌تری (به‌جای پیش‌فرض ۱ ساعته‌ی سوپابیس) دوباره استفاده کنند.
      const { error } = await supabase.storage.from('media').upload(fileName, file, {
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw error;

      // بعد از آپلود، لیست رو رفرش میکنیم
      await fetchImages(true); 
    } catch (error: any) {
      alert('خطا در آپلود: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string, id: string) => {
    if (!confirm('آیا از حذف این تصویر مطمئن هستید؟')) return;
    
    const { error } = await supabase.storage.from('media').remove([fileName]);
    
    if (error) {
      alert('خطا: ' + error.message);
    } else {
      // حذف از استیت لوکال (بدون رفرش کل صفحه)
      setFiles(files.filter(f => f.id !== id));
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
        
        <label className={`cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          <span>{uploading ? 'در حال آپلود...' : 'آپلود تصویر جدید'}</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
            <div className="flex justify-center mb-4"><UploadCloud className="h-12 w-12 text-gray-300" /></div>
            <p className="text-gray-500">هنوز تصویری آپلود نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file, index) => {
            // اگر آخرین عکس بود، رفرنس رو بهش وصل میکنیم
            if (files.length === index + 1) {
                return (
                    <div ref={lastImageElementRef} key={file.id} className="group relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <img src={file.url} alt="media" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <button onClick={() => copyToClipboard(file.url, file.id)} className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-100 w-full justify-center">
                                {copiedId === file.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                {copiedId === file.id ? 'کپی شد' : 'لینک'}
                            </button>
                            <button onClick={() => handleDelete(file.name, file.id)} className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600" title="حذف تصویر">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div key={file.id} className="group relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <img src={file.url} alt="media" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <button onClick={() => copyToClipboard(file.url, file.id)} className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-100 w-full justify-center">
                                {copiedId === file.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                {copiedId === file.id ? 'کپی شد' : 'لینک'}
                            </button>
                            <button onClick={() => handleDelete(file.name, file.id)} className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600" title="حذف تصویر">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            }
          })}
        </div>
      )}
      
      {/* لودینگ پایین صفحه */}
      {loadingMore && (
        <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      {!hasMore && files.length > 0 && (
         <p className="text-center text-gray-400 text-xs mt-4">تمام تصاویر لود شدند.</p>
      )}
    </div>
  );
}