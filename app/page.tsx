import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import CurrencyRatesBanner from "@/components/CurrencyRatesBanner";
import FAQ from "@/components/FAQ"; 
import HomeSEOContent from "@/components/HomeSEOContent"; // <--- اضافه شد
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Layers } from 'lucide-react';
import Link from 'next/link';

// کشینگ: هر ۶۰ ثانیه صفحه آپدیت میشه
export const revalidate = 60;

export default async function Home() {
  
  // 1. دریافت محصولات
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  // 2. دریافت دسته‌بندی‌ها
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // 3. دریافت تنظیمات سایت (بنر و متن‌ها)
  const { data: settingsData } = await supabase.from('site_settings').select('*');
  const settings: any = {};
  if (settingsData) {
    settingsData.forEach(item => { settings[item.key] = item.value });
  }

  return (
    <main className="flex flex-col min-h-screen font-[family-name:var(--font-vazir)]">
      
      {/* 1. Hero Section (Dynamic) */}
      <Hero 
        banner={settings.hero_banner}
        title={settings.hero_title}
        subtitle={settings.hero_subtitle}
      />
      
      {/* 2. Categories Section (Improved UI) */}
      <section className="container mx-auto px-4 -mt-10 relative z-30 mb-20">
         <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              دسترسی سریع به محصولات
           </h3>
           
           {!categories || categories.length === 0 ? (
             <p className="text-sm text-gray-400">هنوز دسته‌بندی تعریف نشده است.</p>
           ) : (
             <div className="flex flex-wrap justify-center gap-4">
               {categories.map((cat) => (
                 <Link 
                    key={cat.id} 
                    href={`/products?category=${cat.slug}`} 
                    className="group flex items-center gap-3 bg-gray-50 hover:bg-blue-600 hover:text-white border border-gray-200 hover:border-blue-600 text-gray-700 px-6 py-4 rounded-2xl transition-all duration-300"
                 >
                  <span className="font-bold text-sm">{cat.name}</span>
                 </Link>
               ))}
             </div>
           )}
        </div>
      </section>

      {/* 3. Products Showcase */}
      <section className="container mx-auto px-4 mb-20">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              جدیدترین‌های فروشگاه
            </h2>
            <p className="text-sm text-gray-500 mt-2 mr-4">
               منتخب بهترین سوغات‌های ایران، با کیفیت تضمین شده
            </p>
          </div>
          
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all group">
             مشاهده همه محصولات 
             <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        {(!products || products.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-lg">در حال چیدمان ویترین هستیم...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        )}
        
        <div className="text-center mt-8 md:hidden">
          <Link href="/products" className="inline-flex items-center justify-center w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
             مشاهده آرشیو کامل
          </Link>
        </div>
      </section>

      {/* 4. Currency Rates Banner */}
      <div className="bg-gray-50 py-10 border-t border-gray-200">
        <div className="container mx-auto px-4 mb-4 text-center">
             <h2 className="text-2xl font-bold text-gray-900">شفافیت مالی، افتخار ماست</h2>
             <p className="text-gray-500 mt-2">نرخ لحظه‌ای تبدیل ارزها را مشاهده کنید</p>
        </div>
        <div className="mt-8">
            <CurrencyRatesBanner />
        </div>
      </div>

      {/* 5. FAQ Section */}
      <FAQ />

      {/* 6. SEO Content (New) */}
      <HomeSEOContent /> {/* <--- اضافه شد */}

    </main>
  );
}