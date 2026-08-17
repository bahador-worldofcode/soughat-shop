// مسیر واقعی در پروژه: components/CityLinksGrid.tsx
//
// کامپوننت دکمه‌های رنگیِ صفحه‌ی اصلی، لینک به لندینگ‌پیج‌های شهر.
// در (home)/page.tsx ایمپورت و صدا بزن: <CityLinksGrid locale={locale} />
//
// رنگ‌ها مستقیم از Hero.tsx و Header.tsx خودِ پروژه استخراج شدن
// (bg-{رنگ}-50 / text-{رنگ}-900 / ring-{رنگ}-100، همون پترنِ بج‌های
// دسته‌بندی توی Hero.tsx).
//
// 🆕 حالا که هر ۴۰ شهر محتوا دارن، دیگه همه رو اینجا نشون نمی‌دیم (شلوغ
// می‌شد) — فقط ۱۲ تا از پرجست‌وجوترین/بزرگ‌ترین شهرها با پخش متعادل بین
// قاره‌ها انتخاب شدن. لیست کامل (۴۰ تا) توی صفحه‌ی هاب
// (/send-gift-to-iran) هست که پایین همین بخش لینک داده شده.

import { targetCities } from "@/lib/data/cities";
import { citiesContent } from "@/lib/data/citiesContent";

type Locale = "fa" | "en";

// ۱۲ شهر منتخب برای صفحه‌ی اصلی — بر اساس جمعیت واقعی جامعه‌ی ایرانی هر
// شهر (طبق تحقیقی که موقع ساخت لیست ۴۰ تایی انجام شد) + پخش جغرافیایی.
// اگه خواستی این لیست رو عوض کنی، فقط کافیه اسلاگ‌ها رو از lib/data/cities.ts
// بردار و اینجا جایگزین کن.
const FEATURED_CITY_SLUGS = [
  "los-angeles",
  "new-york",
  "toronto",
  "vancouver",
  "london",
  "berlin",
  "stockholm",
  "paris",
  "sydney",
  "dubai",
  "istanbul",
  "frankfurt",
];

const ACCENTS = [
  "bg-blue-50 text-blue-900 ring-blue-100 hover:bg-blue-100",
  "bg-rose-50 text-rose-900 ring-rose-100 hover:bg-rose-100",
  "bg-purple-50 text-purple-900 ring-purple-100 hover:bg-purple-100",
  "bg-green-50 text-green-900 ring-green-100 hover:bg-green-100",
  "bg-amber-50 text-amber-900 ring-amber-100 hover:bg-amber-100",
];

export function CityLinksGrid({ locale }: { locale: Locale }) {
  const allCities = targetCities.filter((c) => citiesContent[locale]?.[c.slug]);
  const featured = FEATURED_CITY_SLUGS
    .map((slug) => allCities.find((c) => c.slug === slug))
    .filter((c): c is (typeof allCities)[number] => Boolean(c));

  if (!featured.length) return null;

  const heading =
    locale === "fa" ? "ارسال هدیه به ایران از شهر خودت" : "Send Gifts to Iran From Your City";

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="text-2xl font-bold">{heading}</h2>
      <div className="mt-6 flex flex-wrap gap-3">
        {featured.map((city, i) => (
          <a
            key={city.slug}
            href={`/${locale}/send-gift-to-iran/${city.slug}`}
            className={`rounded-full px-5 py-2.5 text-sm font-medium ring-1 transition-colors ${ACCENTS[i % ACCENTS.length]}`}
          >
            {locale === "fa" ? `ارسال هدیه به ${city.nameFa}` : `Send a gift to ${city.nameEn}`}
          </a>
        ))}
        <a
          href={`/${locale}/send-gift-to-iran`}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
        >
          {locale === "fa" ? "همه‌ی ۴۰ شهر →" : "All 40 cities →"}
        </a>
      </div>
    </section>
  );
}