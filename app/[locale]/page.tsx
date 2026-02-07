import Hero from "@/components/Hero";
import MarketRates from "@/components/MarketRates"; 
import ProductCard from "@/components/ProductCard";
import CurrencyRatesBanner from "@/components/CurrencyRatesBanner";
import FAQ from "@/components/FAQ"; 
import HomeSEOContent from "@/components/HomeSEOContent";
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Layers } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export const revalidate = 60;

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('Home');
  const isEn = locale === 'en';

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

  // لاجیک انتخاب متن (فارسی یا انگلیسی)
  const heroTitle = isEn ? (settings['hero_title_en'] || settings['hero_title']) : settings['hero_title'];
  const heroSubtitle = isEn ? (settings['hero_subtitle_en'] || settings['hero_subtitle']) : settings['hero_subtitle'];

  return (
    <main className="flex flex-col min-h-screen font-[family-name:var(--font-vazir)]">
      
      {/* 1. Hero Section */}
      <Hero 
        banner={settings.hero_banner}
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      {/* 1.5. Market Rates Section */}
      <MarketRates />
      
      {/* 2. Categories Section */}
      <section className="container mx-auto px-4 -mt-4 relative z-10 mb-20">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
               <Layers className="h-5 w-5 text-blue-600" />
               {t('categories_title')}
            </h3>
            
            {!categories || categories.length === 0 ? (
              <p className="text-sm text-gray-400">{t('categories_empty')}</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((cat) => {
                  // انتخاب نام دسته (انگلیسی یا فارسی)
                  const catName = isEn ? (cat.name_en || cat.name) : cat.name;
                  return (
                    <Link 
                       key={cat.id} 
                       href={`/products?category=${cat.slug}`} 
                       className="group flex items-center gap-3 bg-gray-50 hover:bg-blue-600 hover:text-white border border-gray-200 hover:border-blue-600 text-gray-700 px-6 py-4 rounded-2xl transition-all duration-300"
                    >
                     {cat.icon_url && (
                       <img 
                          src={cat.icon_url} 
                          alt={catName} 
                          className="w-6 h-6 object-contain group-hover:invert transition-all" 
                       />
                     )}
                     <span className="font-bold text-sm">{catName}</span>
                    </Link>
                  );
                })}
              </div>
            )}
         </div>
      </section>

      {/* 3. Products Showcase */}
      <section className="container mx-auto px-4 mb-20">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              {t('newest_title')}
            </h2>
            <p className="text-sm text-gray-500 mt-2 mr-4">
               {t('newest_desc')}
            </p>
          </div>
          
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all group">
             {t('view_all')} 
             <ArrowLeft className={`h-4 w-4 transition-transform ${isEn ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
          </Link>
        </div>

        {(!products || products.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-lg">{t('products_loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    // ✅ تغییر اصلی: اضافه شدن تایپ قیمت
                    pricing_type={product.pricing_type}
                  />
                );
            })}
          </div>
        )}
        
        <div className="text-center mt-8 md:hidden">
          <Link href="/products" className="inline-flex items-center justify-center w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
             {t('view_archive')}
          </Link>
        </div>
      </section>

      {/* 4. Currency Rates Banner */}
      <div className="bg-gray-50 py-10 border-t border-gray-200">
        <div className="container mx-auto px-4 mb-4 text-center">
             <h2 className="text-2xl font-bold text-gray-900">{t('rates_title')}</h2>
             <p className="text-gray-500 mt-2">{t('rates_desc')}</p>
        </div>
        <div className="mt-8">
            <CurrencyRatesBanner />
        </div>
      </div>

      {/* 5. FAQ Section */}
      <FAQ />

      {/* 6. SEO Content */}
      <HomeSEOContent />

    </main>
  );
}