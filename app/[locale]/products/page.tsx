'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Search, ShoppingBag, ArrowDownUp, Loader2, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation'; // نویگیشن هوشمند
import { useTranslations, useLocale } from 'next-intl'; // هوک‌های ترجمه

interface Product {
  id: string;
  title: string;
  title_en?: string; // اضافه شد
  price: number;
  image: string;
  slug: string;
  category: string;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
  name_en?: string; // اضافه شد
  slug: string;
  icon_url?: string;
}

const PAGE_SIZE = 12;

function ProductList() {
  const t = useTranslations('ProductsPage');
  const locale = useLocale();
  const isEn = locale === 'en';

  const router = useRouter(); 
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, page, sortOrder]);

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
        { id: 'all', name: t('all_categories'), name_en: 'All Products', slug: 'all' }, 
        ...catData
      ]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (currentSearch) {
        // جستجو در هر دو زبان (اگر کاربر انگلیسی سرچ کرد در title_en بگردد)
        if (isEn) {
             query = query.or(`title.ilike.%${currentSearch}%,title_en.ilike.%${currentSearch}%`);
        } else {
             query = query.ilike('title', `%${currentSearch}%`);
        }
    }

    if (currentCategory !== 'all') {
      query = query.eq('category', currentCategory);
    }

    if (sortOrder === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortOrder === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sortOrder === 'price-desc') {
      query = query.order('price', { ascending: false });
    }

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

  const handleCategoryChange = (slug: string) => {
    // استفاده از URLSearchParams برای ساخت کوئری استرینگ
    const params = new URLSearchParams(searchParams.toString());
    
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    
    // استفاده از router هوشمند که زبان را حفظ می‌کند
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="container mx-auto px-4">
        
        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 ${isEn ? 'left-3' : 'right-3'}`} />
                    <input 
                    type="text" 
                    placeholder={t('search_placeholder')}
                    defaultValue={currentSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isEn ? 'pl-10 pr-4' : 'pr-10 pl-4'}`} 
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <ArrowDownUp className="h-5 w-5 text-gray-500" />
                    <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full md:w-48 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer hover:bg-gray-100"
                    >
                        <option value="newest">{t('sort_newest')}</option>
                        <option value="price-asc">{t('sort_cheapest')}</option>
                        <option value="price-desc">{t('sort_expensive')}</option>
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
                    categories.map(cat => {
                        // انتخاب نام دسته (انگلیسی یا فارسی)
                        const catName = isEn ? (cat.name_en || cat.name) : cat.name;
                        
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${
                                    currentCategory === cat.slug 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                            >
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
                                {catName}
                            </button>
                        );
                    })
                )}
            </div>
        </div>

        {loading ? (
            <div className="text-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">{t('loading')}</p>
            </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 font-bold">{t('empty')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {products.map((product) => {
                // انتخاب عنوان محصول (انگلیسی یا فارسی)
                const prodTitle = isEn ? (product.title_en || product.title) : product.title;
                
                return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={prodTitle}
                      price={product.price}
                      image={product.image}
                      slug={product.slug}
                    />
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12" dir="ltr"> 
                    {/* dir=ltr برای اینکه صفحه‌بندی همیشه چپ‌به‌راست باشد (اعداد) */}
                    
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {/* در زبان انگلیسی ChevronLeft یعنی عقب، در فارسی یعنی جلو. پس باید آیکون‌ها جابجا شوند */}
                        {isEn ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                    
                    <span className="text-sm font-bold text-gray-700">
                        {t('page')} {page} {t('from')} {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isEn ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                </div>
            )}
          </>
        )}
    </div>
  );
}

export default function ProductsPage() {
  const t = useTranslations('ProductsPage'); // ترجمه سربرگ صفحه

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-[family-name:var(--font-vazir)]">
      <div className="bg-white border-b border-gray-200 py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="text-center py-10">{t('loading')}</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}