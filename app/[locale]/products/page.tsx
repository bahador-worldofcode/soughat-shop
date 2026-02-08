'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { 
  Search, 
  ShoppingBag, 
  ArrowDownUp, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Filter,
  XCircle,
  SlidersHorizontal
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation'; 
import { useTranslations, useLocale } from 'next-intl'; 

interface Product {
  id: string;
  title: string;
  title_en?: string; 
  price: number;
  image: string;
  slug: string;
  category: string;
  created_at?: string;
  pricing_type?: string; 
  weight?: number; // ✅ اضافه شد
}

interface Category {
  id: string;
  name: string;
  name_en?: string;
  slug: string;
  icon_url?: string;
}

const PAGE_SIZE = 12;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function ProductList() {
  const t = useTranslations('ProductsPage');
  const locale = useLocale();
  const isEn = locale === 'en';

  const router = useRouter(); 
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const urlSearchQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
  const debouncedSearch = useDebounce(searchTerm, 500); 

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set('q', debouncedSearch);
    } else {
      params.delete('q');
    }
    if (params.get('q') !== urlSearchQuery) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, page, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [currentCategory, debouncedSearch]);

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

    const activeSearch = searchParams.get('q') || '';
    if (activeSearch) {
        if (isEn) {
             query = query.or(`title.ilike.%${activeSearch}%,title_en.ilike.%${activeSearch}%`);
        } else {
             query = query.ilike('title', `%${activeSearch}%`);
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
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') params.delete('category');
    else params.set('category', slug);
    
    setPage(1);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
      setSearchTerm('');
      handleCategoryChange('all');
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="container mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            <aside className="lg:col-span-1 lg:sticky lg:top-24 flex flex-col gap-6 lg:max-h-[calc(100vh-8rem)]">
                
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative group">
                        <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors ${isEn ? 'left-3' : 'right-3'}`} />
                        <input 
                            type="text" 
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isEn ? 'pl-10 pr-9' : 'pr-10 pl-9'}`} 
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')} 
                                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors ${isEn ? 'right-2' : 'left-2'}`}
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between lg:flex-col lg:items-start lg:gap-3 transition-shadow hover:shadow-md">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                             <ArrowDownUp className="h-4 w-4" />
                        </div>
                        <span className="hidden lg:inline">{isEn ? 'Sort By:' : 'مرتب‌سازی:'}</span>
                    </span>
                    <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="bg-transparent lg:bg-gray-50 lg:hover:bg-gray-100 lg:w-full lg:p-3 lg:rounded-xl lg:border lg:border-gray-200 text-sm outline-none cursor-pointer font-medium text-gray-700 transition-colors"
                    >
                        <option value="newest">{t('sort_newest')}</option>
                        <option value="price-asc">{t('sort_cheapest')}</option>
                        <option value="price-desc">{t('sort_expensive')}</option>
                    </select>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:overflow-hidden flex-1 transition-shadow hover:shadow-md">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Layers className="h-5 w-5 text-blue-600" />
                            {isEn ? 'Categories' : 'دسته‌بندی‌ها'}
                        </h3>
                    </div>
                    
                    <div className="hidden lg:block overflow-y-auto overflow-x-hidden p-2 gap-1 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                        {categories.length === 0 ? (
                             <div className="p-4 space-y-3">
                                <div className="h-10 bg-gray-100 rounded-xl w-full animate-pulse"></div>
                                <div className="h-10 bg-gray-100 rounded-xl w-full animate-pulse"></div>
                                <div className="h-10 bg-gray-100 rounded-xl w-full animate-pulse"></div>
                             </div>
                        ) : (
                            categories.map(cat => {
                                const catName = isEn ? (cat.name_en || cat.name) : cat.name;
                                const isActive = currentCategory === cat.slug;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryChange(cat.slug)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                            isActive 
                                            ? 'bg-blue-50 text-blue-700 shadow-sm translate-x-1' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                                        }`}
                                    >
                                        {cat.slug === 'all' ? (
                                            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500 group-hover:bg-white'}`}>
                                                <Filter className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <div className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-blue-200' : 'bg-gray-100 group-hover:bg-white'}`}>
                                                {cat.icon_url ? (
                                                    <img src={cat.icon_url} alt="" className="w-4 h-4 object-contain" />
                                                ) : (
                                                    <Layers className={`h-4 w-4 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                                )}
                                            </div>
                                        )}
                                        <span className="flex-1 text-start truncate">{catName}</span>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="lg:hidden flex overflow-x-auto p-3 gap-2 no-scrollbar items-center">
                         {categories.map(cat => {
                            const catName = isEn ? (cat.name_en || cat.name) : cat.name;
                            const isActive = currentCategory === cat.slug;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.slug)}
                                    className={`whitespace-nowrap flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                        isActive 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    {cat.icon_url && cat.slug !== 'all' && (
                                        <img src={cat.icon_url} alt="" className={`w-4 h-4 object-contain ${isActive ? 'brightness-200 grayscale-0' : ''}`} />
                                    )}
                                    {catName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>

            <div className="lg:col-span-3 min-h-[500px]">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 h-[340px] border border-gray-100 flex flex-col gap-4">
                                <div className="bg-gray-100 h-48 w-full rounded-xl animate-pulse relative overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-white to-gray-100 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="bg-gray-100 h-4 w-3/4 rounded animate-pulse"></div>
                                    <div className="bg-gray-100 h-4 w-1/2 rounded animate-pulse"></div>
                                </div>
                                <div className="flex justify-between items-center mt-auto">
                                     <div className="bg-gray-100 h-6 w-20 rounded animate-pulse"></div>
                                     <div className="bg-gray-100 h-8 w-8 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 text-center px-4">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                            <ShoppingBag className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-xl text-gray-800 font-bold mb-2">{t('empty')}</p>
                        <p className="text-gray-500 text-sm mb-6 max-w-xs">{isEn ? 'Try adjusting your search or filter to find what you are looking for.' : 'لطفا جستجو یا فیلترهای خود را تغییر دهید تا نتیجه‌ای پیدا کنید.'}</p>
                        <button 
                            onClick={clearFilters} 
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            {isEn ? 'Clear All Filters' : 'پاک کردن تمام فیلترها'}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                             <div className="text-sm text-gray-500 font-medium px-1">
                                {isEn 
                                    ? `Showing ${products.length} of ${totalCount} results` 
                                    : `نمایش ${products.length} از ${totalCount} نتیجه`
                                }
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => {
                                // ✅ اضافه کردن weight برای پاس دادن به کارت محصول
                                return (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        title={product.title}
                                        title_en={product.title_en}
                                        price={product.price}
                                        image={product.image}
                                        slug={product.slug}
                                        pricing_type={product.pricing_type}
                                        weight={product.weight} // ✅ پاس دادن وزن
                                    />
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-16" dir="ltr"> 
                                <button
                                    onClick={() => {
                                        setPage(p => Math.max(1, p - 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={page === 1}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-500 bg-white"
                                >
                                    {isEn ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </button>
                                
                                <div className="bg-white border border-gray-200 rounded-xl px-4 h-10 flex items-center text-sm font-bold text-gray-700 shadow-sm">
                                    {page} <span className="text-gray-400 mx-2">/</span> {totalPages}
                                </div>

                                <button
                                    onClick={() => {
                                        setPage(p => Math.min(totalPages, p + 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={page === totalPages}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-500 bg-white"
                                >
                                    {isEn ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
  );
}

export default function ProductsPage() {
  const t = useTranslations('ProductsPage'); 

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-[family-name:var(--font-vazir)]">
      
      <div className="bg-white border-b border-gray-200 pt-12 pb-10 mb-2 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">{t('title')}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <Suspense fallback={
          <div className="h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-gray-400 text-sm font-medium animate-pulse">Loading products...</p>
              </div>
          </div>
      }>
        <ProductList />
      </Suspense>
    </div>
  );
}