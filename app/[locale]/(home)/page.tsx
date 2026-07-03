import Hero from "@/components/Hero";
import MarketRates from "@/components/MarketRates"; 
import ProductCard from "@/components/ProductCard";
import CurrencyRatesBanner from "@/components/CurrencyRatesBanner";
import FAQ from "@/components/FAQ"; 
import HomeSEOContent from "@/components/HomeSEOContent";
import ReviewsFeed from "@/components/ReviewsFeed"; 
import LazySection from "@/components/LazySection";
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Layers, Sparkles, ChevronsRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

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
    .limit(4);

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const categorySections: { category: any; items: any[] }[] = [];
  if (categories && categories.length > 0) {
    const results = await Promise.all(
      categories.map((cat) =>
        supabase
          .from('products')
          .select('*')
          .eq('category', cat.slug)
          .order('created_at', { ascending: false })
          .limit(4)
      )
    );

    categories.forEach((cat, idx) => {
      const items = results[idx]?.data || [];
      if (items.length > 0) {
        categorySections.push({ category: cat, items });
      }
    });
  }

  const { data: settingsData } = await supabase.from('site_settings').select('*');
  const settings: any = {};
  if (settingsData) {
    settingsData.forEach(item => { settings[item.key] = item.value });
  }

  const heroTitle = isEn ? (settings['hero_title_en'] || settings['hero_title']) : settings['hero_title'];
  const heroSubtitle = isEn ? (settings['hero_subtitle_en'] || settings['hero_subtitle']) : settings['hero_subtitle'];

  return (
    <main className="flex flex-col min-h-screen font-[family-name:var(--font-vazir)] bg-gray-50/50">
      
      <Hero 
        banner={settings.hero_banner}
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      <MarketRates />
      
      {/* 3. Newest Products — همین بالای صفحه‌ست، بلافاصله نمایش داده می‌شود */}
      <section className="container mx-auto px-4 mb-14 md:mb-20">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              {t('newest_title')}
            </h2>
          </div>

          {/* یک لینک واحد «مشاهده همه محصولات» که فقط با کلاس‌های ریسپانسیو ظاهرش (نه تعدادش) تغییر می‌کند؛
              همین طراحی از تکرار المان در DOM جلوگیری می‌کند تا هیچ‌وقت دوتایی دیده نشود */}
          <div className="flex items-center justify-between md:justify-end gap-4 mt-1 md:mt-0">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 md:gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 md:hover:bg-blue-50 md:px-4 md:py-2 md:rounded-xl transition-all group"
            >
              {t('view_all')}
              <ArrowLeft className={`h-4 w-4 transition-transform ${isEn ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
            </Link>

            {/* هینت اسکرول عرضی، فقط زیر sm (موبایل واقعی) */}
            <div className="flex-shrink-0 flex sm:hidden items-center justify-center w-8 h-8 rounded-full bg-blue-50/50 border border-blue-100/60 opacity-80 animate-pulse shadow-sm pointer-events-none">
              <ChevronsRight className={`h-4 w-4 text-blue-500 ${!isEn ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {(!products || products.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-lg">{t('products_loading')}</p>
          </div>
        ) : (
          <div className="flex gap-4 items-stretch overflow-x-auto no-scrollbar overscroll-x-contain [-webkit-overflow-scrolling:touch] -mx-4 px-4 pb-1 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0 lg:grid-cols-4">
            {products.map((product) => {
                return (
                  <div
                    key={product.id}
                    className="w-[65%] min-w-[240px] max-w-[290px] flex-shrink-0 sm:w-auto sm:flex-none sm:contents"
                  >
                    <ProductCard
                      id={product.id}
                      title={product.title}
                      title_en={product.title_en}
                      price={product.price}
                      image={product.image}
                      slug={product.slug}
                      pricing_type={product.pricing_type}
                      weight={product.weight}
                    />
                  </div>
                );
            })}
          </div>
        )}
      </section>

      {/* 4. Category Sections — کمی پایین‌تر از دید اولیه؛ فقط وقتی کاربر
          به این نقطه نزدیک می‌شود مانت می‌شود تا اسکرول اولیه سبک بماند */}
      {categorySections.length > 0 && (
        <LazySection minHeight={600}>
          <section className="container mx-auto px-4 mb-14 md:mb-20">
            <div className="flex flex-col">
              {categorySections.map(({ category: cat, items }, index) => {
                const catName = isEn ? (cat.name_en || cat.name) : cat.name;
                const isLast = index === categorySections.length - 1;

                return (
                  <div
                    key={cat.id}
                    className={`pb-8 md:pb-10 ${!isLast ? 'mb-8 md:mb-10 border-b border-gray-100' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                          {cat.icon_url ? (
                            <Image
                              src={cat.icon_url}
                              alt={catName}
                              width={32}
                              height={32}
                              className="w-7 h-7 md:w-8 md:h-8 object-contain"
                            />
                          ) : (
                            <Layers className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                          )}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                          {catName}
                        </h3>
                      </div>

                      <Link
                        href={`/products?category=${cat.slug}`}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all group"
                      >
                        <span className="hidden sm:inline">{t('view_all')}</span>
                        <span className="sm:hidden">{t('view_category')}</span>
                        <ArrowLeft className={`h-4 w-4 transition-transform ${isEn ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                      </Link>
                    </div>

                    <div className="flex gap-4 items-stretch overflow-x-auto no-scrollbar overscroll-x-contain [-webkit-overflow-scrolling:touch] -mx-4 px-4 pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0 md:gap-6 lg:grid-cols-4">
                      {items.map((product) => (
                        <div
                          key={product.id}
                          className="w-[65%] min-w-[240px] max-w-[290px] flex-shrink-0 sm:w-auto sm:flex-none sm:contents"
                        >
                          <ProductCard
                            id={product.id}
                            title={product.title}
                            title_en={product.title_en}
                            price={product.price}
                            image={product.image}
                            slug={product.slug}
                            pricing_type={product.pricing_type}
                            weight={product.weight}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </LazySection>
      )}

      {/* 5. نرخ لحظه‌ای ارزها — پایین‌تر از دسته‌بندی‌ها */}
      <LazySection minHeight={400}>
        <div className="bg-white py-12 border-t border-gray-200">
          <div className="container mx-auto px-4 mb-8 text-center">
               <h2 className="text-2xl font-bold text-gray-900">{t('rates_title')}</h2>
               <p className="text-gray-500 mt-2 max-w-2xl mx-auto leading-7">{t('rates_desc')}</p>
          </div>
          <div>
              <CurrencyRatesBanner />
          </div>
        </div>
      </LazySection>

      {/* 6. نظرات کاربران */}
      <LazySection minHeight={500}>
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
                  {t('write_review')}
              </Link>
            </div>

            <ReviewsFeed />
            
          </div>
        </section>
      </LazySection>

      {/* 7. سوالات متداول */}
      <LazySection minHeight={700}>
        <FAQ />
      </LazySection>

      {/* 8. متن سئوی صفحه اصلی — پایین‌ترین بخش صفحه */}
      <LazySection minHeight={500}>
        <HomeSEOContent />
      </LazySection>

    </main>
  );
}