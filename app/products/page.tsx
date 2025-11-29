'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Search, ShoppingBag, ArrowDownUp, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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
}

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    fetchData();
  }, []);

  // *** تغییر مهم: خواندن همزمان q (جستجو) و category (دسته‌بندی) از URL ***
  useEffect(() => {
    const query = searchParams.get('q');
    const catParam = searchParams.get('category');
    
    if (query) setSearchTerm(query);
    if (catParam) setSelectedCategory(catParam);
    
  }, [searchParams]);

  const fetchData = async () => {
    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (prodData) {
      setProducts(prodData);
      setFilteredProducts(prodData);
    }

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

    setLoading(false);
  };

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
        result = result.filter(p => p.category === selectedCategory);
    }

    if (sortOrder === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [searchTerm, sortOrder, selectedCategory, products]);

  // بقیه کد دقیقاً مثل قبله...
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                {loading ? (
                    <div className="flex gap-2 animate-pulse">
                        <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
                        <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
                        <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
                    </div>
                ) : (
                    categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                selectedCategory === cat.slug 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))
                )}
            </div>
        </div>

        {loading && (
            <div className="text-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">در حال چیدمان ویترین...</p>
            </div>
        )}

        {!loading && filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 font-bold">محصولی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredProducts.map((product) => (
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