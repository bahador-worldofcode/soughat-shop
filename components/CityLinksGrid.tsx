// مسیر واقعی در پروژه: components/CityLinksGrid.tsx
//
// کامپوننت دکمه‌های رنگیِ صفحه‌ی اصلی، لینک به لندینگ‌پیج‌های شهر.
// در (home)/page.tsx ایمپورت و صدا بزن: <CityLinksGrid locale={locale} />
//
// 🖼️ آیکون هر شهر از public/images/city-icons/{slug}.png خونده می‌شه.
// لیست دقیق اسم فایل‌ها رو در پیام جدا (همین چت) نوشتم — همون‌جا بخون.
// تا وقتی فایل‌ها رو نذاشتی، فقط جای آیکون خالی/شکسته دیده می‌شه؛ بقیه‌ی
// صفحه (متن، رنگ، لینک) کاملاً درست کار می‌کنه.

import Image from "next/image";
import { ChevronLeft, Globe } from "lucide-react";
import { targetCities } from "@/lib/data/cities";
import { citiesContent } from "@/lib/data/citiesContent";

type Locale = "fa" | "en";

// ترتیب و رنگ همون چیزیه که توی پیش‌نمایش HTML تایید کردی.
const FEATURED_CITY_SLUGS = [
  "new-york",
  "london",
  "dubai",
  "paris",
  "sydney",
  "frankfurt",
  "istanbul",
  "stockholm",
  "los-angeles",
  "vancouver",
  "berlin",
  "toronto",
];

type Accent = { bg: string; ring: string; text: string; chevron: string };

const CITY_ACCENTS: Record<string, Accent> = {
  "new-york": { bg: "from-emerald-50 to-white", ring: "ring-emerald-100", text: "text-emerald-900", chevron: "text-emerald-400" },
  london: { bg: "from-violet-50 to-white", ring: "ring-violet-100", text: "text-violet-900", chevron: "text-violet-400" },
  dubai: { bg: "from-sky-50 to-white", ring: "ring-sky-100", text: "text-sky-900", chevron: "text-sky-400" },
  paris: { bg: "from-amber-50 to-white", ring: "ring-amber-100", text: "text-amber-900", chevron: "text-amber-400" },
  sydney: { bg: "from-rose-50 to-white", ring: "ring-rose-100", text: "text-rose-900", chevron: "text-rose-400" },
  frankfurt: { bg: "from-teal-50 to-white", ring: "ring-teal-100", text: "text-teal-900", chevron: "text-teal-400" },
  istanbul: { bg: "from-orange-50 to-white", ring: "ring-orange-100", text: "text-orange-900", chevron: "text-orange-400" },
  stockholm: { bg: "from-indigo-50 to-white", ring: "ring-indigo-100", text: "text-indigo-900", chevron: "text-indigo-400" },
  "los-angeles": { bg: "from-lime-50 to-white", ring: "ring-lime-100", text: "text-lime-900", chevron: "text-lime-400" },
  vancouver: { bg: "from-cyan-50 to-white", ring: "ring-cyan-100", text: "text-cyan-900", chevron: "text-cyan-400" },
  berlin: { bg: "from-fuchsia-50 to-white", ring: "ring-fuchsia-100", text: "text-fuchsia-900", chevron: "text-fuchsia-400" },
  toronto: { bg: "from-red-50 to-white", ring: "ring-red-100", text: "text-red-900", chevron: "text-red-400" },
};

const DEFAULT_ACCENT: Accent = CITY_ACCENTS["new-york"];

export function CityLinksGrid({ locale }: { locale: Locale }) {
  const allCities = targetCities.filter((c) => citiesContent[locale]?.[c.slug]);
  const featured = FEATURED_CITY_SLUGS
    .map((slug) => allCities.find((c) => c.slug === slug))
    .filter((c): c is (typeof allCities)[number] => Boolean(c));

  if (!featured.length) return null;

  const heading =
    locale === "fa"
      ? "ارسال هدیه به ایران از سراسر شهرهای جهان"
      : "Send Gifts to Iran From Cities All Over the World";
  const subtitle =
    locale === "fa"
      ? "شهر خود را انتخاب کنید و هدیه‌ای خاص برای عزیزانتان در ایران ارسال کنید"
      : "Pick your city and send a special gift to your loved ones in Iran";

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-slate-900">{heading}</h2>
        <p className="mt-3 text-slate-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {featured.map((city) => {
          const accent = CITY_ACCENTS[city.slug] ?? DEFAULT_ACCENT;
          const cityName = locale === "fa" ? city.nameFa : city.nameEn;

          return (
            <a
              key={city.slug}
              href={`/${locale}/send-gift-to-iran/${city.slug}`}
              className={`group flex items-center gap-3 rounded-3xl bg-gradient-to-br p-4 ring-1 transition-transform hover:-translate-y-0.5 hover:shadow-md ${accent.bg} ${accent.ring}`}
            >
              {/* 🖼️ جای آیکون — فایل رو توی public/images/city-icons/{slug}.png بذار */}
              <Image
                src={`/images/city-icons/${city.slug}.png`}
                alt={locale === "fa" ? `نماد ${cityName}` : `${cityName} landmark icon`}
                width={44}
                height={44}
                className="shrink-0 object-contain"
              />

              <span className={`flex-1 text-right text-[15px] font-bold leading-tight ${accent.text}`}>
                {locale === "fa" ? `ارسال هدیه از ${cityName}` : `Send a gift from ${cityName}`}
              </span>

              <ChevronLeft className={`h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1 ${accent.chevron}`} />
            </a>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <a
          href={`/${locale}/send-gift-to-iran`}
          className="group flex items-center gap-3 rounded-3xl border-2 border-dashed border-blue-200 bg-white/60 px-8 py-4 transition-transform hover:-translate-y-0.5"
        >
          <Globe className="h-9 w-9 shrink-0 text-blue-500" />
          <div className="text-right">
            <p className="text-[15px] font-bold text-slate-800">
              {locale === "fa" ? `همه‌ی ${Object.keys(citiesContent.fa).length} شهر` : `All ${Object.keys(citiesContent.fa).length} cities`}
            </p>
            <p className="text-xs text-slate-400">
              {locale === "fa" ? "انتخاب از سایر شهرهای جهان" : "Browse every city we cover"}
            </p>
          </div>
          <ChevronLeft className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:-translate-x-1" />
        </a>
      </div>
    </section>
  );
}