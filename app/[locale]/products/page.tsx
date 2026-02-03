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
  XCircle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation'; 
import { useTranslations, useLocale } from 'next-intl'; 

// --- Types ---
interface Product {
  id: string;
  title: string;
  title_en?: string;
  price: number;
  image: string;
  slug: string;
  category: string;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
  name_en?: string;
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

  // --- Effects ---
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, page, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [currentCategory, currentSearch]);

  // --- Data Fetching ---
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

    // Search Logic
    if (currentSearch) {
        if (isEn) {
             query = query.or(`title.ilike.%${currentSearch}%,title_en.ilike.%${currentSearch}%`);
        } else {
             query = query.ilike('title', `%${currentSearch}%`);
        }
    }

    // Category Filter
    if (currentCategory !== 'all') {
      query = query.eq('category', currentCategory);
    }

    // Sorting
    if (sortOrder === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortOrder === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sortOrder === 'price-desc') {
      query = query.order('price', { ascending: false });
    }

    // Pagination
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

  // --- Handlers ---
  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') params.delete('category');
    else params.set('category', slug);
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('q', val);
    else params.delete('q');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="container mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* === SIDEBAR (Desktop) / TOPBAR (Mobile) === */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
                
                {/* 1. Search Box */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="relative">
                        <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 ${isEn ? 'left-3' : 'right-3'}`} />
                        <input 
                            type="text" 
                            placeholder={t('search_placeholder')}
                            defaultValue={currentSearch}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isEn ? 'pl-10 pr-4' : 'pr-10 pl-4'}`} 
                        />
                        {currentSearch && (
                            <button onClick={() => handleSearchChange('')} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 ${isEn ? 'right-3' : 'left-3'}`}>
                                <XCircle className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Sorting (Mobile & Desktop) */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between lg:flex-col lg:items-start lg:gap-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <ArrowDownUp className="h-4 w-4" />
                        <span className="hidden lg:inline">{isEn ? 'Sort By:' : 'مرتب‌سازی بر اساس:'}</span>
                    </span>
                    <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="bg-transparent lg:bg-gray-50 lg:w-full lg:p-3 lg:rounded-xl lg:border lg:border-gray-200 text-sm outline-none cursor-pointer font-medium text-gray-600"
                    >
                        <option value="newest">{t('sort_newest')}</option>
                        <option value="price-asc">{t('sort_cheapest')}</option>
                        <option value="price-desc">{t('sort_expensive')}</option>
                    </select>
                </div>

                {/* 3. Categories List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Layers className="h-5 w-5 text-blue-600" />
                            {isEn ? 'Categories' : 'دسته‌بندی‌ها'}
                        </h3>
                    </div>
                    
                    {/* Desktop: Vertical List */}
                    <div className="hidden lg:flex flex-col p-2 gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {categories.length === 0 ? (
                             <div className="p-4 space-y-3">
                                <div className="h-8 bg-gray-100 rounded-lg w-full animate-pulse"></div>
                                <div className="h-8 bg-gray-100 rounded-lg w-full animate-pulse"></div>
                                <div className="h-8 bg-gray-100 rounded-lg w-full animate-pulse"></div>
                             </div>
                        ) : (
                            categories.map(cat => {
                                const catName = isEn ? (cat.name_en || cat.name) : cat.name;
                                const isActive = currentCategory === cat.slug;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryChange(cat.slug)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                                            isActive 
                                            ? 'bg-blue-50 text-blue-700 shadow-sm' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        {cat.slug === 'all' ? (
                                            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                <Filter className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <div className={`p-1.5 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-200' : 'bg-gray-100'}`}>
                                                {cat.icon_url ? (
                                                    <img src={cat.icon_url} alt="" className={`w-4 h-4 object-contain ${isActive ? '' : 'opacity-60 grayscale'}`} />
                                                ) : (
                                                    <Layers className={`h-4 w-4 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                                                )}
                                            </div>
                                        )}
                                        <span className="flex-1 text-start">{catName}</span>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Mobile: Horizontal List */}
                    <div className="lg:hidden flex overflow-x-auto p-4 gap-2 no-scrollbar">
                         {categories.map(cat => {
                            const catName = isEn ? (cat.name_en || cat.name) : cat.name;
                            const isActive = currentCategory === cat.slug;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.slug)}
                                    className={`whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border transition-all ${
                                        isActive 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {cat.icon_url && cat.slug !== 'all' && (
                                        <img src={cat.icon_url} alt="" className={`w-4 h-4 object-contain ${isActive ? 'invert brightness-0' : ''}`} />
                                    )}
                                    {catName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* === MAIN CONTENT (Products Grid) === */}
            <div className="lg:col-span-3">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 h-80 animate-pulse border border-gray-100">
                                <div className="bg-gray-200 h-48 w-full rounded-xl mb-4"></div>
                                <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-xl text-gray-500 font-bold">{t('empty')}</p>
                        <button onClick={() => {handleCategoryChange('all'); handleSearchChange('')}} className="mt-4 text-blue-600 text-sm hover:underline">
                            {isEn ? 'Clear Filters' : 'پاک کردن فیلترها'}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Result Count Info */}
                        <div className="mb-4 text-sm text-gray-500 px-1">
                            {isEn 
                                ? `Showing ${products.length} products` 
                                : `نمایش ${products.length} محصول`
                            }
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {products.map((product) => {
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-fit mx-auto" dir="ltr"> 
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                                >
                                    {isEn ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </button>
                                
                                <span className="text-sm font-bold text-gray-700 min-w-[80px] text-center">
                                    {t('page')} {page} {t('from')} {totalPages}
                                </span>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
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
    <div className="min-h-screen bg-gray-50 pb-20 font-[family-name:var(--font-vazir)]">
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 py-10 mb-2 shadow-sm">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{t('title')}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-7">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-20"><Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" /></div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}