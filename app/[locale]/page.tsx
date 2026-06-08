import Hero from "@/components/Hero";
import MarketRates from "@/components/MarketRates"; 
import ProductCard from "@/components/ProductCard";
import CurrencyRatesBanner from "@/components/CurrencyRatesBanner";
import FAQ from "@/components/FAQ"; 
import HomeSEOContent from "@/components/HomeSEOContent";
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
      
      {/* 3. Modern Category Showcase (Bento Grid Style) */}
      <section className="container mx-auto px-4 py-8 mb-12">
          
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center justify-center gap-2 mb-2">
               <Layers className="h-6 w-6 text-blue-600" />
               {t('categories_title')}
            </h3>
            <p className="text-gray-500 text-sm">{t('categories_subtitle')}</p>
          </div>
          
          {!categories || categories.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-300">
               <p className="text-sm text-gray-400">{t('categories_empty')}</p>
            </div>
          ) : (
            <div className="relative">
              <div 
                className="
                  grid grid-flow-col auto-cols-[160px] md:auto-cols-auto gap-4 md:gap-6 
                  overflow-x-auto md:overflow-visible pb-6 md:pb-0 
                  md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
                  snap-x snap-mandatory scroll-smooth no-scrollbar
                "
                dir={isEn ? 'ltr' : 'rtl'}
              >
                {categories.map((cat) => {
                  const catName = isEn ? (cat.name_en || cat.name) : cat.name;
                  
                  return (
                    <Link 
                       key={cat.id} 
                       href={`/products?category=${cat.slug}`} 
                       className="
                         group relative flex flex-col items-center justify-center 
                         bg-white p-6 rounded-[2rem] 
                         border border-gray-100 
                         shadow-sm hover:shadow-xl hover:shadow-blue-100/50 
                         hover:-translate-y-1 hover:border-blue-200
                         transition-all duration-300 
                         snap-center h-full min-h-[180px]
                       "
                    >
                     <div className="
                        w-20 h-20 mb-5 rounded-full 
                        bg-blue-50/80 group-hover:bg-blue-600 
                        flex items-center justify-center 
                        transition-colors duration-300
                        shadow-inner group-hover:shadow-lg
                     ">
                       {cat.icon_url ? (
                         <img 
                            src={cat.icon_url} 
                            alt={catName} 
                            className="
                              w-10 h-10 object-contain 
                              group-hover:invert group-hover:brightness-0 
                              transition-all duration-300 group-hover:scale-110
                            " 
                         />
                       ) : (
                         <Layers className="w-8 h-8 text-blue-300 group-hover:text-white transition-colors" />
                       )}
                     </div>

                     <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-700 transition-colors text-center leading-tight">
                        {catName}
                     </h3>
                     
                     <span className="
                        text-[10px] text-gray-400 mt-2 
                        opacity-0 group-hover:opacity-100 
                        transition-opacity duration-300
                        flex items-center gap-1
                     ">
                        {t('view_category')} <ArrowLeft className={`w-3 h-3 ${isEn ? 'rotate-180' : ''}`} />
                     </span>
                    </Link>
                  );
                })}
              </div>
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

      {/* 6. Social Proof / Reviews Section */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-16 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">
              {t('reviews_title')}
            </h2>
            <p className="text-blue-200 text-sm">
              {t('reviews_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir={isEn ? 'ltr' : 'rtl'}>
            
            {/* Review 1 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Sparkles key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-blue-50 text-sm leading-7 mb-6 text-justify">
                {t('review1_text')}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
                <div>
                  <h4 className="text-white font-bold text-sm">{t('review1_name')}</h4>
                  <p className="text-blue-300 text-xs">{t('review1_loc')}</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 relative top-0 md:top-4">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Sparkles key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-blue-50 text-sm leading-7 mb-6 text-justify">
                {t('review2_text')}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
                <div>
                  <h4 className="text-white font-bold text-sm">{t('review2_name')}</h4>
                  <p className="text-blue-300 text-xs">{t('review2_loc')}</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <Sparkles key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-blue-50 text-sm leading-7 mb-6 text-justify">
                {t('review3_text')}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <h4 className="text-white font-bold text-sm">{t('review3_name')}</h4>
                  <p className="text-blue-300 text-xs">{t('review3_loc')}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <FAQ />
      <HomeSEOContent />

    </main>
  );
}