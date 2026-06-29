import Hero from "@/components/Hero";
import MarketRates from "@/components/MarketRates"; 
import ProductCard from "@/components/ProductCard";
import CurrencyRatesBanner from "@/components/CurrencyRatesBanner";
import FAQ from "@/components/FAQ"; 
import HomeSEOContent from "@/components/HomeSEOContent";
import ReviewsFeed from "@/components/ReviewsFeed"; // <--- فقط این خط به ایمپورت‌ها اضافه شد
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Layers, Sparkles } from 'lucide-react';
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

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const { data: settingsData } = await supabase.from('site_settings').select('*');
  const settings: any = {};
  if (settingsData) {
    settingsData.forEach(item => { settings[item.key] = item.value });
  }

  const heroTitle = isEn ? (settings['hero_title_en'] || settings['hero_title']) : settings['hero_title'];
  const heroSubtitle = isEn ? (settings['hero_subtitle_en'] || settings['hero_subtitle']) : settings['hero_subtitle'];

  return (
    <main className="flex flex-col min-h-screen font-[family-name:var(--font-vazir)] bg-gray-50/50">
      
      {/* 1. Hero Section */}
      <Hero 
        banner={settings.hero_banner}
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      {/* 2. Live Market Rates */}
      <MarketRates />
      
      {/* 3. Modern 3D Category Showcase */}
      <section className="container mx-auto px-4 py-12 mb-12">
          
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight flex items-center justify-center gap-3">
               <Layers className="h-8 w-8 text-blue-600 hidden md:block" />
               {t('categories_title')}
            </h3>
            <p className="text-gray-500 font-medium">{t('categories_subtitle')}</p>
          </div>
          
          {!categories || categories.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-300">
               <p className="text-sm text-gray-400">{t('categories_empty')}</p>
            </div>
          ) : (
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
              dir={isEn ? 'ltr' : 'rtl'}
            >
              {categories.map((cat, index) => {
                const catName = isEn ? (cat.name_en || cat.name) : cat.name;
                
                return (
                  <Link 
                     key={cat.id} 
                     href={`/products?category=${cat.slug}`} 
                     style={{ animationDelay: `${index * 50}ms` }}
                     className="
                       group relative flex flex-col items-center justify-center 
                       bg-white p-6 rounded-3xl 
                       border border-gray-100 
                       shadow-[0_4px_20px_rgba(0,0,0,0.03)] 
                       hover:shadow-[0_10px_40px_rgba(37,99,235,0.12)] 
                       hover:-translate-y-2 hover:border-blue-100
                       transition-all duration-300 ease-out
                       animate-in fade-in slide-in-from-bottom-8 fill-mode-both
                     "
                  >
                   <div className="relative w-24 h-24 mb-4 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                     <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150"></div>
                     
                     {cat.icon_url ? (
                       <img 
                          src={cat.icon_url} 
                          alt={catName} 
                          className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform duration-500" 
                       />
                     ) : (
                       <Layers className="relative z-10 w-10 h-10 text-gray-300" />
                     )}
                   </div>

                   <h3 className="font-bold text-gray-800 text-sm md:text-base group-hover:text-blue-600 transition-colors text-center leading-tight">
                      {catName}
                   </h3>
                   
                   <span className="
                      text-[10px] text-gray-400 mt-2 font-bold
                      opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                      transition-all duration-300
                      flex items-center gap-1
                   ">
                      {t('view_category')} <ArrowLeft className={`w-3 h-3 ${isEn ? 'rotate-180' : ''}`} />
                   </span>
                  </Link>
                );
              })}
            </div>
          )}
      </section>

      {/* 4. Newest Products */}
      <section className="container mx-auto px-4 mb-20">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              {t('newest_title')}
            </h2>
            <p className="text-sm text-gray-500 mt-2 mr-4">
               {t('newest_desc')}
            </p>
          </div>
          
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all group">
             {t('view_all')} 
             <ArrowLeft className={`h-4 w-4 transition-transform ${isEn ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
          </Link>
        </div>

        {(!products || products.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-lg">{t('products_loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
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
                    weight={product.weight}
                  />
                );
            })}
          </div>
        )}
        
        <div className="text-center mt-10 md:hidden">
          <Link href="/products" className="inline-flex items-center justify-center w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
             {t('view_archive')}
          </Link>
        </div>
      </section>

      {/* 5. Currency & Info */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 mb-8 text-center">
             <h2 className="text-2xl font-bold text-gray-900">{t('rates_title')}</h2>
             <p className="text-gray-500 mt-2 max-w-2xl mx-auto leading-7">{t('rates_desc')}</p>
        </div>
        <div>
            <CurrencyRatesBanner />
        </div>
      </div>

      {/* 6. Social Proof / Reviews Section (فقط این بخش تغییر کرد) */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-16 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              {t('reviews_title')}
            </h2>
            <p className="text-blue-200 text-sm mb-6">
              {t('reviews_subtitle')}
            </p>
            <Link href="/review" className="inline-block bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold px-8 py-3 rounded-full transition-all backdrop-blur-sm shadow-lg hover:-translate-y-1">
                {isEn ? 'Write a Review' : 'ثبت تجربه خرید شما'}
            </Link>
          </div>

          {/* کامپوننت فید نظرات با اسکرول نامحدود */}
          <ReviewsFeed />
          
        </div>
      </section>

      <FAQ />
      <HomeSEOContent />

    </main>
  );
}