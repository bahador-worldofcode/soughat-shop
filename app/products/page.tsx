// app/products/page.tsx

'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Search, ShoppingBag, ArrowDownUp, Loader2, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
// اضافه شدن هوک‌های ضروری برای مدیریت URL
import { useSearchParams, useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  category: string;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string; // فیلد آیکون اضافه شد
}

// تعداد محصول در هر صفحه
const PAGE_SIZE = 12;

function ProductList() {
  const router = useRouter(); 
  const searchParams = useSearchParams();

  // خواندن مقادیر مستقیماً از URL (منبع حقیقت)
  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // صفحه‌بندی و تعداد کل
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // مرتب‌سازی (فعلاً لوکال نگه داشتیم چون پیچیدگی URL ندارد)
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // ۱. دریافت دسته‌بندی‌ها (فقط یکبار در زمان لود)
  useEffect(() => {
    fetchCategories();
  }, []);

  // ۲. هر وقت URL (دسته‌بندی یا سرچ)، شماره صفحه یا ترتیب نمایش عوض شد، محصولات جدید بگیر
  useEffect(() => {
    fetchProducts();
  }, [searchParams, page, sortOrder]);

  // ۳. اگر دسته‌بندی یا سرچ عوض شد، حتماً برگرد به صفحه ۱ (تا کاربر در صفحه خالی گیر نکند)
  useEffect(() => {
    setPage(1);
  }, [currentCategory, currentSearch]);

  const fetchCategories = async () => {
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (catData) {
      setCategories([
        { id: 'all', name: 'همه محصولات', slug: 'all' }, 
        ...catData
      ]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // فیلتر بر اساس جستجو (از URL)
    if (currentSearch) {
      query = query.ilike('title', `%${currentSearch}%`);
    }

    // فیلتر بر اساس دسته‌بندی (از URL)
    if (currentCategory !== 'all') {
      query = query.eq('category', currentCategory);
    }

    // اعمال مرتب‌سازی
    if (sortOrder === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortOrder === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sortOrder === 'price-desc') {
      query = query.order('price', { ascending: false });
    }

    // اعمال صفحه‌بندی
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
    } else {
        setProducts(data || []);
        setTotalCount(count || 0);
    }
    
    setLoading(false);
  };

  // --- هندلرهای جدید برای تغییر URL ---

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    
    // پارامتر scroll: false باعث می‌شود صفحه پرش نکند
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="container mx-auto px-4">
        
        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                    type="text" 
                    placeholder="جستجو..." 
                    // استفاده از defaultValue برای جلوگیری از پرش فوکوس هنگام تایپ
                    defaultValue={currentSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <ArrowDownUp className="h-5 w-5 text-gray-500" />
                    <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full md:w-48 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer hover:bg-gray-100"
                    >
                        <option value="newest">جدیدترین‌ها</option>
                        <option value="price-asc">ارزان‌ترین</option>
                        <option value="price-desc">گران‌ترین</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.length === 0 ? (
                    <div className="flex gap-2 animate-pulse">
                        <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
                        <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
                        <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
                    </div>
                ) : (
                    categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.slug)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${
                                currentCategory === cat.slug 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                        >
                            {/* نمایش آیکون دسته بندی */}
                            {cat.slug === 'all' ? (
                              <Layers className={`h-4 w-4 ${currentCategory === 'all' ? 'text-white' : 'text-blue-600'}`} />
                            ) : (
                              cat.icon_url && (
                                <img 
                                  src={cat.icon_url} 
                                  alt="" 
                                  className={`w-4 h-4 object-contain ${currentCategory === cat.slug ? 'invert' : ''}`} 
                                />
                              )
                            )}
                            {cat.name}
                        </button>
                    ))
                )}
            </div>
        </div>

        {loading ? (
            <div className="text-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">در حال دریافت محصولات...</p>
            </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 font-bold">محصولی یافت نشد</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  slug={product.slug}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    <span className="text-sm font-bold text-gray-700">
                        صفحه {page} از {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>
            )}
          </>
        )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-[family-name:var(--font-vazir)]">
      <div className="bg-white border-b border-gray-200 py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">فروشگاه سوغات شاپ</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            بهترین سوغات ایران را انتخاب کنید. پرداخت امن با کریپتو، تحویل درب منزل در ایران.
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="text-center py-10">در حال بارگذاری...</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}