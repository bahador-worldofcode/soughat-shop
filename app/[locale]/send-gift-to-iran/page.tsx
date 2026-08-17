// مسیر واقعی در پروژه: app/[locale]/send-gift-to-iran/page.tsx
//
// این صفحه، صفحه‌ی هاب/فهرست همه‌ی ۴۰ شهره. بدون این صفحه، ۴۰ تا لندینگ‌پیج
// فقط توی سایت‌مپ می‌مونن و از نظر لینکِ داخلی یتیم می‌شن — این صفحه دقیقاً
// همون چیزیه که به گوگل و ایجنت‌های AI مسیر رو نشون می‌ده.
//
// می‌تونه جایگزین محتوای فعلیِ app/[locale]/send-gift-to-iran-crypto/page.tsx بشه
// یا از اونجا بهش لینک بدیم؛ به نظرم گزینه‌ی دوم امن‌تره (صفحه‌ی موجود رو دست نمی‌زنیم).

import type { Metadata } from "next";
import { targetCities, type CityRegion } from "@/lib/data/cities";
import { citiesContent } from "@/lib/data/citiesContent";

type Locale = "fa" | "en";
const SITE_URL = "https://soughat.shop";

function isLocale(value: string): value is Locale {
  return value === "fa" || value === "en";
}

const REGION_LABEL: Record<CityRegion, { fa: string; en: string }> = {
  "north-america": { fa: "آمریکا و کانادا", en: "North America" },
  europe: { fa: "اروپا", en: "Europe" },
  oceania: { fa: "استرالیا و اقیانوسیه", en: "Australia & Oceania" },
  "middle-east": { fa: "خاورمیانه", en: "Middle East" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const title =
    locale === "fa"
      ? "ارسال هدیه به ایران از هر شهر دنیا"
      : "Send Gifts to Iran From Anywhere in the World";
  const description =
    locale === "fa"
      ? "شهر خودت رو پیدا کن و ببین چطور از همون‌جا هدیه، سوغات و پول به خانواده‌ت در ایران بفرستی."
      : "Find your city and see exactly how to send gifts, treats, and money to your family in Iran.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/send-gift-to-iran`,
      languages: {
        fa: `${SITE_URL}/fa/send-gift-to-iran`,
        en: `${SITE_URL}/en/send-gift-to-iran`,
      },
    },
  };
}

export default async function SendGiftToIranHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const isRtl = locale === "fa";

  // فقط شهرهایی که واقعاً محتوا دارن نشون بده (تا لینک‌های 404 نساخته باشیم)
  const readyCities = targetCities.filter((c) => citiesContent[locale]?.[c.slug]);
  const byRegion = readyCities.reduce<Record<CityRegion, typeof readyCities>>(
    (acc, city) => {
      acc[city.region] = [...(acc[city.region] ?? []), city];
      return acc;
    },
    { "north-america": [], europe: [], oceania: [], "middle-east": [] }
  );

  return (
    <main dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">
        {locale === "fa" ? "ارسال هدیه به ایران از هر شهر دنیا" : "Send Gifts to Iran From Anywhere in the World"}
      </h1>

      {(Object.keys(byRegion) as CityRegion[]).map((region) =>
        byRegion[region].length ? (
          <section key={region} className="mt-10">
            <h2 className="text-xl font-semibold">{REGION_LABEL[region][locale]}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {byRegion[region].map((city) => (
                <a
                  key={city.slug}
                  href={`/${locale}/send-gift-to-iran/${city.slug}`}
                  className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-900 ring-1 ring-blue-100 hover:bg-blue-100"
                >
                  {locale === "fa" ? city.nameFa : city.nameEn}
                </a>
              ))}
            </div>
          </section>
        ) : null
      )}
    </main>
  );
}