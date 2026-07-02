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

  // جدیدترین محصولات (۴ کارت)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // برای هر دسته‌بندی، ۴ محصول تازه‌ی همان دسته را جداگانه واکشی می‌کنیم
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
      
      {/* 1. Hero Section */}
      <Hero 
        banner={settings.hero_banner}
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      {/* 2. Live Market Rates */}
      <MarketRates />
      
      {/* 3. Newest Products */}
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
          // موبایل: نوار افقی با اسکرول و اسنپ (مثل اسنپ/دیجی‌کالا) | از sm به بعد: همون گرید قبلی، بدون تغییر
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4 pb-1 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:snap-none sm:mx-0 sm:px-0 sm:pb-0 lg:grid-cols-4">
            {products.map((product) => {
                return (
                  <div
                    key={product.id}
                    className="w-[44%] min-w-[152px] max-w-[190px] flex-shrink-0 snap-start sm:contents"
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
        
        <div className="text-center mt-10 md:hidden">
          <Link href="/products" className="inline-flex items-center justify-center w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
             {t('view_archive')}
          </Link>
        </div>
      </section>

      {/* 4. Quick Access / Categories — نوار افقی دسته‌بندی‌ها، بدون بنر و بدون جعبه‌های سنگین */}
      {categorySections.length > 0 && (
        <section className="container mx-auto px-4 mb-20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Layers className="h-6 w-6 text-blue-600" />
              {t('categories_title')}
            </h2>
            <p className="text-sm text-gray-500 mt-2 mr-4">
              {t('categories_subtitle')}
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4 pb-1 sm:flex-wrap sm:overflow-visible sm:snap-none sm:mx-0 sm:px-0 sm:pb-0">
            {categorySections.map(({ category: cat }) => {
              const catName = isEn ? (cat.name_en || cat.name) : cat.name;

              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex w-[76px] flex-shrink-0 snap-start flex-col items-center gap-2 sm:w-24"
                >
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 transition-colors group-hover:border-blue-300 group-hover:bg-blue-100/70 sm:h-20 sm:w-20">
                    {cat.icon_url ? (
                      <img
                        src={cat.icon_url}
                        alt={catName}
                        className="h-9 w-9 object-contain sm:h-11 sm:w-11"
                      />
                    ) : (
                      <Layers className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <span className="line-clamp-2 text-center text-xs font-bold leading-tight text-gray-700 transition-colors group-hover:text-blue-600 sm:text-sm">
                    {catName}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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