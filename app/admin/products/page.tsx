'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, Search, X, Loader2, ImageIcon, Check, Search as SearchIcon, Calculator, LayoutGrid, List, Package, AlertCircle, Gem, Scale } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  price_toman: number;
  image: string;
  slug: string;
  category: string;
  description: string;
  features: string[];
  seo_title: string;
  seo_desc: string;
  created_at?: string;
  weight?: number; 
  pricing_type?: 'fixed' | 'gold'; 
  gender?: 'male' | 'female' | 'unisex' | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
}

interface MediaFile {
  name: string;
  url: string;
  id: string | null;
}

const BATCH_SIZE = 20;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  const [stats, setStats] = useState({ total: 0, unavailable: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [dollarRate, setDollarRate] = useState(100000);
  const [profitMargin, setProfitMargin] = useState(25);
  const [shippingBase, setShippingBase] = useState(300000);
  const [goldMarkupPercent, setGoldMarkupPercent] = useState(40);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({ 
    title: '', price: '', price_toman: '', image: '', slug: '', category: '',
    description: '', features: '', seo_title: '', seo_desc: '', weight: '', pricing_type: 'fixed', gender: ''
  });

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaLoadingMore, setMediaLoadingMore] = useState(false);
  const [mediaHasMore, setMediaHasMore] = useState(true);

  const productObserver = useRef<IntersectionObserver | null>(null);
  const mediaObserver = useRef<IntersectionObserver | null>(null);

  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMoreProducts) return;
    if (productObserver.current) productObserver.current.disconnect();
    
    productObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreProducts && !searchTerm) {
        fetchProducts(false);
      }
    });
    
    if (node) productObserver.current.observe(node);
  }, [loading, loadingMoreProducts, hasMoreProducts, searchTerm]);

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

  useEffect(() => {
    initialLoad();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchProducts(true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const initialLoad = async () => {
    setLoading(true);
    await Promise.all([
        fetchProducts(true),
        fetchCategoriesAndSettings(),
        fetchStats()
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
    const { count: total } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: unavailable } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('price_toman', 0);

    setStats({ total: total || 0, unavailable: unavailable || 0 });
  };

  const fetchCategoriesAndSettings = async () => {
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    if (catData) setCategories(catData);
    
    const { data: settingsData } = await supabase.from('site_settings').select('*');
    if (settingsData) {
        settingsData.forEach(item => {
            if (item.key === 'dollar_rate') setDollarRate(Number(item.value));
            if (item.key === 'profit_margin') setProfitMargin(Number(item.value));
            if (item.key === 'shipping_base') setShippingBase(Number(item.value));
            if (item.key === 'admin_product_view_mode') setViewMode(item.value as 'grid' | 'list');
            if (item.key === 'gold_markup_percent') setGoldMarkupPercent(Number(item.value));
        });
    }
  };

  const fetchProducts = async (isInitial = true) => {
    if (isInitial) {
        if (!searchTerm) setLoading(true);
        setHasMoreProducts(true);
    } else {
        setLoadingMoreProducts(true);
    }

    const currentOffset = isInitial ? 0 : products.length;

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
    } else {
        query = query.range(currentOffset, currentOffset + BATCH_SIZE - 1);
    }

    const { data } = await query;

    if (data) {
        const typedData = data.map(item => ({
            ...item,
            weight: item.weight || 0,
            pricing_type: item.pricing_type || 'fixed'
        })) as Product[];

        if (isInitial) {
            setProducts(typedData);
        } else {
            setProducts(prev => [...prev, ...typedData]);
        }

        if (data.length < BATCH_SIZE) {
            setHasMoreProducts(false);
        }
    }

    setLoading(false);
    setLoadingMoreProducts(false);
  };

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

  const handleViewModeChange = async (mode: 'grid' | 'list') => {
    setViewMode(mode);
    await supabase.from('site_settings').upsert({ key: 'admin_product_view_mode', value: mode }, { onConflict: 'key' });
  };

  const calculateSuggestedUSD = (tomanStr: string) => {
    if (formData.pricing_type === 'gold') return;

    const toman = parseInt(tomanStr) || 0;
    if (toman === 0) return;
    const cost = toman + shippingBase;
    const inUSD = cost / dollarRate;
    const withProfit = inUSD * (1 + profitMargin / 100);
    const final = Math.round(withProfit * 100) / 100;
    setFormData(prev => ({ ...prev, price: String(final), price_toman: tomanStr }));
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        title: product.title, 
        price: product.price.toString(), 
        price_toman: product.price_toman ? product.price_toman.toString() : '0',
        image: product.image,
        slug: product.slug || '',
        category: product.category || (categories[0]?.slug || ''),
        description: product.description || '',
        features: product.features ? product.features.join('\n') : '',
        seo_title: product.seo_title || '',
        seo_desc: product.seo_desc || '',
        weight: product.weight ? product.weight.toString() : '',
        pricing_type: product.pricing_type === 'gold' ? 'gold' : 'fixed',
        gender: product.gender || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        title: '', price: '', price_toman: '', image: '', slug: '', 
        category: categories[0]?.slug || '', description: '', features: '', seo_title: '', seo_desc: '',
        weight: '', pricing_type: 'fixed', gender: ''
      });
    }
    setIsModalOpen(true);
  };

  const openGallery = () => { setIsGalleryOpen(true); fetchMedia(true); };
  const selectImageFromGallery = (url: string) => { setFormData({ ...formData, image: url }); setIsGalleryOpen(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // دیافت توکن ادمین برای ارسال به بک‌اند
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      const featuresArray = formData.features.split('\n').filter(line => line.trim() !== '');
      let finalSlug = formData.slug || formData.title;
      finalSlug = finalSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      const finalCategory = formData.category || categories[0]?.slug || 'nuts';

      const productData = {
        title: formData.title,
        price: Number(formData.price),
        price_toman: Number(formData.price_toman),
        image: formData.image,
        slug: finalSlug,
        category: finalCategory,
        description: formData.description,
        features: featuresArray,
        seo_title: formData.seo_title,
        seo_desc: formData.seo_desc,
        weight: Number(formData.weight) || 0,
        pricing_type: formData.pricing_type,
        gender: formData.gender || null
      };

      if (formData.pricing_type === 'gold') {
        productData.price = productData.price || 0;
        productData.price_toman = productData.price_toman || 0;
      }

      let response;
      if (editingProduct) {
        response = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ id: editingProduct.id, ...productData }),
        });
      } else {
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'خطا در ذخیره‌سازی');
      }

      await fetchProducts(true); 
      await fetchStats();
      setIsModalOpen(false);
    } catch (error: any) {
      alert('خطا: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      const response = await fetch(`/api/admin/products?id=${id}`, { 
          method: 'DELETE',
          headers: {
             'Authorization': `Bearer ${token}` 
          }
      });
      
      if (!response.ok) throw new Error('خطا در حذف');
      
      setProducts(products.filter(p => p.id !== id));
      fetchStats();
    } catch (error: any) {
      alert('خطا: ' + error.message);
    }
  };

  const getCategoryObj = (slug: string) => {
    return categories.find(c => c.slug === slug);
  };

  if (loading && products.length === 0) return <div className="p-10 text-center">در حال دریافت لیست...</div>;

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">مدیریت محصولات</h2>
           <p className="text-sm text-gray-500">مدیریت موجودی، قیمت‌گذاری و سئو</p>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-lg flex items-center border border-gray-200">
                <button 
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                    onClick={() => handleViewModeChange('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <List className="h-4 w-4" />
                </button>
            </div>
            <button onClick={() => openProductModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md h-[42px]">
            <Plus className="h-5 w-5" />
            محصول جدید
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <Package className="h-6 w-6" />
            </div>
            <div>
                <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
                <p className="text-xs text-gray-500">تعداد کل محصولات</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center gap-3">
            <div className="bg-red-50 p-3 rounded-lg text-red-500">
                <AlertCircle className="h-6 w-6" />
            </div>
            <div>
                <span className="text-2xl font-bold text-gray-800">{stats.unavailable}</span>
                <p className="text-xs text-gray-500">ناموجود (قیمت ۰)</p>
            </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input 
            type="text" 
            placeholder="جستجو در نام محصولات..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pr-9 pl-4 py-3 text-sm bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none" 
        />
      </div>

      {products.length === 0 && !loading ? (
          <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200">محصولی یافت نشد.</div>
      ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {products.map((product, index) => {
                const isLast = index === products.length - 1;
                const isUnavailable = product.price_toman === 0 && product.pricing_type !== 'gold'; 
                const isGold = product.pricing_type === 'gold';
                const catObj = getCategoryObj(product.category); 
                return (
                    <div 
                        key={product.id} 
                        ref={isLast ? lastProductElementRef : null}
                        className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col ${isUnavailable ? 'border-red-200 bg-red-50/10' : 'border-gray-100'} ${isGold ? 'border-yellow-200' : ''}`}
                    >
                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                            <img src={product.image} alt={product.title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${isUnavailable ? 'grayscale' : ''}`} />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openProductModal(product)} className="p-2 bg-white/90 rounded-full text-blue-600 shadow-sm"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(product.id)} className="p-2 bg-white/90 rounded-full text-red-500 shadow-sm"><Trash2 className="h-4 w-4" /></button>
                            </div>
                            
                            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                              {catObj?.icon_url && <img src={catObj.icon_url} className="w-3 h-3 object-contain invert" alt="" />}
                              {catObj ? catObj.name : product.category}
                            </span>
                            
                            {isGold && (
                                <span className="absolute top-2 left-2 bg-yellow-400 text-blue-900 text-[10px] px-2 py-1 rounded-full shadow-md flex items-center gap-1 font-bold">
                                    <Gem className="w-3 h-3" /> طلا
                                </span>
                            )}

                            {isUnavailable && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">ناموجود</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{product.title}</h3>
                            {product.gender && (
                                <div className="mb-1">
                                    {product.gender === 'female' && <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-bold">زنانه</span>}
                                    {product.gender === 'male' && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">مردانه</span>}
                                    {product.gender === 'unisex' && <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">یونیسکس</span>}
                                </div>
                            )}
                            <div className="mt-auto flex justify-between items-end">
                                <span className="text-lg font-bold text-blue-600">${product.price}</span>
                                {isGold && <span className="text-[10px] text-gray-400 font-mono">{product.weight}g</span>}
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
      ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="divide-y divide-gray-100">
                  {products.map((product, index) => {
                      const isLast = index === products.length - 1;
                      const isUnavailable = product.price_toman === 0 && product.pricing_type !== 'gold';
                      const isGold = product.pricing_type === 'gold';
                      return (
                        <div 
                            key={product.id} 
                            ref={isLast ? lastProductElementRef : null}
                            className={`p-3 hover:bg-gray-50 transition-colors flex items-center justify-between group ${isUnavailable ? 'bg-red-50/30' : ''} ${isGold ? 'bg-yellow-50/20' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <img src={product.image} className={`w-10 h-10 rounded object-cover border border-gray-100 ${isUnavailable ? 'grayscale' : ''}`} />
                                <div>
                                    <div className="font-bold text-gray-800 text-sm select-all cursor-text flex items-center gap-2">
                                        {product.title}
                                        {isGold && <span className="text-[9px] bg-yellow-200 text-yellow-800 px-1.5 rounded flex items-center gap-0.5"><Gem className="h-3 w-3"/> طلا</span>}
                                        {product.gender === 'female' && <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 rounded font-bold">زنانه</span>}
                                        {product.gender === 'male' && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 rounded font-bold">مردانه</span>}
                                        {product.gender === 'unisex' && <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 rounded font-bold">یونیسکس</span>}
                                        {isUnavailable && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ناموجود</span>}
                                    </div>
                                    <div className="text-xs text-gray-500 flex gap-2">
                                        <span>${product.price}</span>
                                        {isGold && <span className="border-r pr-2 border-gray-300">{product.weight} گرم</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openProductModal(product)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit2 className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                      );
                  })}
              </div>
          </div>
      )}
      
      {loadingMoreProducts && (
          <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-blue-600"/></div>
      )}
      {!hasMoreProducts && products.length > 0 && !searchTerm && (
          <p className="text-center text-gray-400 text-xs mt-4">تمام محصولات نمایش داده شدند.</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{editingProduct ? 'ویرایش' : 'افزودن'} محصول</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-red-500" /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                  <h4 className="font-bold text-blue-800 text-sm border-b pb-2">۱. اطلاعات پایه</h4>
                  
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, pricing_type: 'fixed'})}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${formData.pricing_type === 'fixed' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Package className="h-4 w-4" /> محصول عادی
                        </button>
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, pricing_type: 'gold'})}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${formData.pricing_type === 'gold' ? 'bg-yellow-400 text-blue-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Gem className="h-4 w-4" /> طلا و جواهر (وزنی)
                        </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">نام محصول</label>
                        <input type="text" required className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                      </div>
                      
                      {formData.pricing_type === 'fixed' ? (
                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in duration-200">
                              <div>
                                 <label className="block text-xs font-bold text-gray-700 mb-1">قیمت خرید (تومان)</label>
                                 <div className="relative">
                                    <input 
                                        type="number" 
                                        required 
                                        min="0" 
                                        className="w-full p-2 pl-8 rounded-lg border border-gray-300 outline-none focus:border-blue-500 text-sm font-mono" 
                                        value={formData.price_toman} 
                                        onChange={(e) => {
                                            setFormData({...formData, price_toman: e.target.value});
                                            calculateSuggestedUSD(e.target.value);
                                        }} 
                                    />
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">T</span>
                                 </div>
                                 <p className="text-[10px] text-gray-500 mt-1">مبنای محاسبه قیمت دلاری</p>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-blue-700 mb-1">قیمت فروش (دلار)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        required 
                                        min="0" 
                                        step="0.01" 
                                        className="w-full p-2 pl-6 rounded-lg border border-blue-300 outline-none focus:border-blue-600 text-sm font-bold text-blue-800 dir-ltr" 
                                        value={formData.price} 
                                        onChange={(e) => setFormData({...formData, price: e.target.value})} 
                                    />
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-blue-600">$</span>
                                </div>
                                <p className="text-[10px] text-blue-400 mt-1 flex items-center gap-1">
                                    <Calculator className="h-3 w-3"/>
                                    محاسبه شده با سود {profitMargin}٪
                                </p>
                              </div>
                          </div>
                      ) : (
                          <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 md:col-span-2 animate-in fade-in zoom-in duration-200">
                             <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-200 rounded-lg text-yellow-700">
                                    <Scale className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-800 mb-1">وزن خالص (گرم)</label>
                                    <div className="relative max-w-xs">
                                        <input 
                                            type="number" 
                                            required 
                                            min="0.01" 
                                            step="0.01"
                                            placeholder="مثال: 1.05"
                                            className="w-full p-2 pl-8 rounded-lg border border-yellow-400 outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-mono font-bold" 
                                            value={formData.weight} 
                                            onChange={(e) => setFormData({...formData, weight: e.target.value})} 
                                        />
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-bold">gr</span>
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>قیمت به صورت خودکار محاسبه می‌شود: </span>
                                        <span className="font-bold text-blue-800">(نرخ طلا × وزن) + {goldMarkupPercent}٪ سود</span>
                                    </div>
                                </div>
                             </div>
                          </div>
                      )}

                      <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">دسته‌بندی</label>
                         {categories.length > 0 ? (
                            <select 
                                value={formData.category} 
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 text-sm bg-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-xs text-red-500 flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin"/> در حال بارگذاری...
                            </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">آدرس صفحه (Slug)</label>
                        <input type="text" className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 text-sm dir-ltr text-left" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">جنسیت (فقط برای دسته‌بندی‌هایی مثل عطر و ادکلن)</label>
                          <select
                              value={formData.gender}
                              onChange={(e) => setFormData({...formData, gender: e.target.value})}
                              className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 text-sm bg-white"
                          >
                              <option value="">بدون جنسیت (پیش‌فرض)</option>
                              <option value="male">مردانه</option>
                              <option value="female">زنانه</option>
                              <option value="unisex">یونیسکس</option>
                          </select>
                          <p className="text-[10px] text-gray-500 mt-1">فقط وقتی «فیلتر جنسیت» برای این دسته‌بندی از صفحه‌ی دسته‌بندی‌ها فعال باشه، این مقدار روی سایت اثر می‌ذاره.</p>
                      </div>
                  </div>
              </div>

              <div className="space-y-4">
                   <h4 className="font-bold text-blue-800 text-sm border-b pb-2">۲. جزئیات</h4>
                   <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">توضیحات کامل</label>
                       <textarea rows={4} className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 text-sm" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                   </div>
                   <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">ویژگی‌ها</label>
                       <textarea rows={3} className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 text-sm" value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} />
                   </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-blue-800 text-sm border-b pb-2">۳. تصویر محصول</h4>
                {formData.image ? (
                  <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button type="button" onClick={openGallery} className="bg-white text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">تغییر</button>
                       <button type="button" onClick={() => setFormData({...formData, image: ''})} className="bg-red-500 text-white p-1.5 rounded-full shadow-sm"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={openGallery} className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-all">
                    <ImageIcon className="h-6 w-6 mb-1" />
                    <span className="text-xs">انتخاب تصویر</span>
                  </button>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-200">
                   <h4 className="font-bold text-gray-700 text-sm flex items-center gap-1"><SearchIcon className="h-4 w-4"/> سئو</h4>
                   <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">SEO Title</label>
                       <input type="text" className="w-full p-2 rounded border border-gray-300 text-sm" value={formData.seo_title} onChange={(e) => setFormData({...formData, seo_title: e.target.value})} />
                   </div>
                   <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                       <textarea rows={2} className="w-full p-2 rounded border border-gray-300 text-sm" value={formData.seo_desc} onChange={(e) => setFormData({...formData, seo_desc: e.target.value})} />
                   </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">انصراف</button>
                <button type="submit" disabled={isSaving || !formData.image} className="flex-1 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md disabled:opacity-50">
                  {isSaving ? 'در حال ذخیره...' : 'ذخیره محصول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isGalleryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-blue-600" />انتخاب تصویر</h3>
                <button onClick={() => setIsGalleryOpen(false)} className="bg-white p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"><X className="h-6 w-6" /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
               {loadingMedia && mediaFiles.length === 0 ? (
                 <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
               ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {mediaFiles.map((file, index) => {
                     const isLast = index === mediaFiles.length - 1;
                     return (
                      <div 
                          key={file.id} 
                          ref={isLast ? lastMediaElementRef : null}
                          onClick={() => selectImageFromGallery(file.url)} 
                          className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${formData.image === file.url ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-400'}`}
                      >
                       <img src={file.url} className="w-full h-full object-cover" />
                       {formData.image === file.url && <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-sm"><Check className="h-3 w-3" /></div>}
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