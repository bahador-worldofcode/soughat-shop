'use client';

import { useState, useEffect, useTransition } from 'react';
import ProductCard from '@/components/ProductCard';
import {
  Search,
  ShoppingBag,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Layers,
  Filter,
  XCircle,
  SlidersHorizontal,
  Info,
  Loader2,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { sanitizePostHtml } from '@/lib/sanitizeHtml';

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
  weight?: number;
}

interface Category {
  id: string;
  name: string;
  name_en?: string;
  slug: string;
  icon_url?: string;
  description?: string;
  description_en?: string;
  seo_title?: string;
  seo_desc?: string;
}

interface ProductsClientViewProps {
  initialProducts: Product[];
  categories: Category[];
  currentCategory: string;
  currentSearch: string;
  currentSort: 'newest' | 'price-asc' | 'price-desc';
  currentPage: number;
  totalCount: number;
  totalPages: number;
  activeCategoryInfo: Category | null;
}

// هوک برای تاخیر در جستجو (Debounce)
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

export default function ProductsClientView({
  initialProducts,
  categories: rawCategories,
  currentCategory,
  currentSearch,
  currentSort,
  currentPage,
  totalCount,
  totalPages,
  activeCategoryInfo,
}: ProductsClientViewProps) {
  const t = useTranslations('ProductsPage');
  const locale = useLocale();
  const isEn = locale === 'en';

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // چون داده‌ها از سرور می‌آن، تنها چیزی که لازمه در حین جابه‌جایی فیلترها نشون
  // بدیم یک حالت «در حال بارگذاری» ملایمه، نه یک اسکلت کامل جداگانه.
  const [isPending, startTransition] = useTransition();

  const products = initialProducts;
  const categories: Category[] = [
    { id: 'all', name: t('all_categories'), name_en: 'All Products', slug: 'all' },
    ...rawCategories,
  ];

  const isCatActive = (slug: string) => (slug || '').trim() === currentCategory;

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // اگر آدرس از بیرون تغییر کنه (مثلاً دکمه‌ی back مرورگر)، فیلد جستجو رو هم‌گام کن
  useEffect(() => {
    setSearchTerm(currentSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSearch]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  // با تاخیر، جستجو رو در URL منعکس کن (که سرور دوباره فچ می‌کنه)
  useEffect(() => {
    if (debouncedSearch === currentSearch) return;
    updateParams({ q: debouncedSearch || null, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleCategoryChange = (slug: string) => {
    updateParams({ category: slug === 'all' ? null : slug, page: null });
  };

  const handleSortChange = (value: string) => {
    updateParams({ sort: value === 'newest' ? null : value, page: null });
  };

  const goToPage = (p: number) => {
    updateParams({ page: p > 1 ? String(p) : null });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    updateParams({ category: null, q: null, page: null, sort: null });
  };

  const activeDescription = activeCategoryInfo
    ? sanitizePostHtml(
        (isEn ? activeCategoryInfo.description_en : activeCategoryInfo.description) || ''
      ) || null
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile Filter Bar */}
      <div className="lg:hidden flex flex-col gap-3 mb-6">
        <div className="bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative group">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors ${isEn ? 'left-3' : 'right-3'}`}
            />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-3 bg-transparent text-sm outline-none transition-all ${isEn ? 'pl-10 pr-9' : 'pr-10 pl-9'}`}
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

        <button
          onClick={() => setIsFilterSheetOpen(true)}
          className="flex items-center justify-between bg-white px-4 py-3.5 rounded-2xl border border-gray-200 shadow-sm text-sm font-bold text-gray-700 active:scale-[0.98] transition-transform"
        >
          <span className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">
              {currentCategory === 'all'
                ? t('filter_sort')
                : isEn
                  ? activeCategoryInfo?.name_en || activeCategoryInfo?.name || t('category_label')
                  : activeCategoryInfo?.name || t('category_label')}
            </span>
            {currentCategory !== 'all' && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600"></span>}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </button>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsFilterSheetOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                {t('filters')}
              </h3>
              <button onClick={() => setIsFilterSheetOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              {/* Sort */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wide">{t('sort_by')}</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { value: 'newest', label: t('sort_newest') },
                    { value: 'price-asc', label: t('sort_cheapest') },
                    { value: 'price-desc', label: t('sort_expensive') },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleSortChange(opt.value);
                        setIsFilterSheetOpen(false);
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                        currentSort === opt.value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {opt.label}
                      {currentSort === opt.value && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wide">{t('category_label')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const catName = isEn ? cat.name_en || cat.name : cat.name;
                    const isActive = isCatActive(cat.slug);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          handleCategoryChange(cat.slug);
                          setIsFilterSheetOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-bold border transition-all text-start ${
                          isActive ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {cat.slug === 'all' ? (
                          <Filter className="h-4 w-4 flex-shrink-0" />
                        ) : cat.icon_url ? (
                          <img src={cat.icon_url} alt="" className={`w-4 h-4 object-contain flex-shrink-0 ${isActive ? 'brightness-200' : ''}`} />
                        ) : (
                          <Layers className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{catName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="p-4 border-t border-gray-100 flex-shrink-0 flex gap-3"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
            >
              <button
                onClick={() => {
                  clearFilters();
                  setIsFilterSheetOpen(false);
                }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                {t('clear')}
              </button>
              <button
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                {t('show_results')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters (Desktop only — mobile uses the filter sheet above) */}
        <aside className="hidden lg:flex lg:col-span-1 lg:sticky lg:top-24 flex-col gap-6 lg:max-h-[calc(100vh-8rem)]">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="relative group">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors ${isEn ? 'left-3' : 'right-3'}`}
              />
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

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-start gap-3 transition-shadow hover:shadow-md">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                <ArrowDownUp className="h-4 w-4" />
              </div>
              <span>{t('sort_by_colon')}</span>
            </span>
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-gray-50 hover:bg-gray-100 w-full p-3 rounded-xl border border-gray-200 text-sm outline-none cursor-pointer font-medium text-gray-700 transition-colors"
            >
              <option value="newest">{t('sort_newest')}</option>
              <option value="price-asc">{t('sort_cheapest')}</option>
              <option value="price-desc">{t('sort_expensive')}</option>
            </select>
          </div>

          {/* 🆕 دسته‌بندی‌ها به‌صورت یک «ابر برچسب» (tag cloud) داخل همین کارت اصلی
              نمایش داده می‌شن، نه به‌صورت چیپ‌های جدا با border/bg مستقل که حس
              «کارت توی کارت» می‌دادن. هر آیتم فقط آیکون+اسمشه، بدون قاب دور خودش؛
              سایز فونت/آیکون بین سه سایز کوچک تناوب داره تا فضای کارت رو با تنوع و
              حس بازیگوش پر کنه، و دسته‌ی فعال با رنگ آبی + زیرخط مشخص می‌شه (نه
              پس‌زمینه‌ی توپر) تا همچنان جدا از بقیه به‌نظر برسه ولی از فضای کارت
              اصلی بیرون نزنه. */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-blue-600" />
              {t('categories_label')}
            </h3>

            <div className="flex flex-wrap items-center gap-x-1 gap-y-2.5">
              {categories.map((cat, idx) => {
                const catName = isEn ? cat.name_en || cat.name : cat.name;
                const isActive = isCatActive(cat.slug);
                const sizeTier = idx % 3;
                const textSize = sizeTier === 0 ? 'text-base' : sizeTier === 1 ? 'text-sm' : 'text-[13px]';
                const iconSize = sizeTier === 0 ? 'h-4 w-4' : sizeTier === 1 ? 'h-3.5 w-3.5' : 'h-3 w-3';

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    title={catName}
                    className={`group inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-bold transition-all duration-200 ${textSize} ${
                      isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/70'
                    }`}
                  >
                    {cat.slug === 'all' ? (
                      <Filter className={`${iconSize} flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                    ) : cat.icon_url ? (
                      <img
                        src={cat.icon_url}
                        alt=""
                        className={`${iconSize} object-contain flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${!isActive ? 'opacity-60 group-hover:opacity-100' : ''}`}
                      />
                    ) : (
                      <Layers className={`${iconSize} flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                    )}
                    <span className={`truncate max-w-[9rem] ${isActive ? 'underline underline-offset-4 decoration-2 decoration-blue-300' : ''}`}>
                      {catName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`lg:col-span-3 min-h-[500px] transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
          {isPending && (
            <div className="flex items-center justify-center gap-2 text-blue-600 text-sm font-medium mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('loading')}
            </div>
          )}

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 text-center px-4">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-xl text-gray-800 font-bold mb-2">{t('empty')}</p>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">{t('empty_desc')}</p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('clear_all_filters')}
              </button>
            </div>
          ) : (
            <>
              {(currentCategory !== 'all' || currentSearch) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {currentCategory !== 'all' && (
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      {activeCategoryInfo
                        ? isEn
                          ? activeCategoryInfo.name_en || activeCategoryInfo.name
                          : activeCategoryInfo.name
                        : t('category_label')}
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {currentSearch && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="flex items-center gap-1.5 bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors"
                    >
                      "{currentSearch}"
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-gray-500 font-medium px-1">
                  {isEn ? `Showing ${products.length} of ${totalCount} results` : `نمایش ${products.length} از ${totalCount} نتیجه`}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    title_en={product.title_en}
                    price={product.price}
                    image={product.image}
                    slug={product.slug}
                    pricing_type={product.pricing_type}
                    weight={product.weight}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-16" dir="ltr">
                  <button
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-500 bg-white"
                  >
                    {isEn ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>

                  <div className="bg-white border border-gray-200 rounded-xl px-4 h-10 flex items-center text-sm font-bold text-gray-700 shadow-sm">
                    {currentPage} <span className="text-gray-400 mx-2">/</span> {totalPages}
                  </div>

                  <button
                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-500 bg-white"
                  >
                    {isEn ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                  </button>
                </div>
              )}

              {/* --- SEO CONTENT SECTION --- */}
              {activeDescription && (
                <div className="mt-16 pt-10 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    <div className="absolute top-10 right-10 text-gray-50 opacity-50 rotate-12">
                      <Info className="h-32 w-32" />
                    </div>

                    <div
                      className="relative z-10 text-gray-700 leading-8 text-justify
                      [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-gray-900 [&>h2]:mb-6 [&>h2]:mt-2
                      [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-gray-800 [&>h3]:mb-4 [&>h3]:mt-8
                      [&>p]:mb-6 [&>p]:text-base [&>p]:opacity-90
                      [&>ul]:list-disc [&>ul]:pr-6 [&>ul]:mb-6 [&>ul]:space-y-2
                      [&>strong]:text-blue-700 [&>strong]:font-bold
                      "
                      dangerouslySetInnerHTML={{ __html: activeDescription }}
                    />
                  </div>
                </div>
              )}
              {/* ----------------------------- */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}