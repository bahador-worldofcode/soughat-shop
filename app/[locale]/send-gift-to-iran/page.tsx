// مسیر واقعی در پروژه: app/[locale]/send-gift-to-iran/page.tsx
// جایگزین کامل فایل قبلی — فقط ظاهر عوض شده، منطق و متادیتا دست‌نخورده.

import type { Metadata } from "next";
import { Globe } from "lucide-react";
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
  asia: { fa: "آسیا", en: "Asia" },
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

  const readyCities = targetCities.filter((c) => citiesContent[locale]?.[c.slug]);
  const byRegion = readyCities.reduce<Record<CityRegion, typeof readyCities>>(
    (acc, city) => {
      acc[city.region] = [...(acc[city.region] ?? []), city];
      return acc;
    },
    { "north-america": [], europe: [], oceania: [], "middle-east": [], asia: [] }
  );

  return (
    <main dir={isRtl ? "rtl" : "ltr"} className="font-[family-name:var(--font-vazir)]">
      <section className="bg-gradient-to-b from-blue-50 to-white py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 p-3">
            <Globe className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 md:text-3xl">
            {locale === "fa"
              ? "ارسال هدیه به ایران از هر شهر دنیا"
              : "Send Gifts to Iran From Anywhere in the World"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            {locale === "fa"
              ? "شهر خودت رو پیدا کن و ببین چطور از همون‌جا هدیه، سوغات و پول به خانواده‌ت در ایران بفرستی."
              : "Find your city and see exactly how to send gifts, treats, and money to your family in Iran."}
          </p>
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="container mx-auto max-w-5xl px-4">
          {(Object.keys(byRegion) as CityRegion[]).map((region) =>
            byRegion[region].length ? (
              <div key={region} className="mb-10">
                <h2 className="mb-4 text-lg font-bold text-gray-900">{REGION_LABEL[region][locale]}</h2>
                <div className="flex flex-wrap gap-3">
                  {byRegion[region].map((city) => (
                    <a
                      key={city.slug}
                      href={`/${locale}/send-gift-to-iran/${city.slug}`}
                      className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-900 ring-1 ring-blue-100 transition-colors hover:bg-blue-100"
                    >
                      {locale === "fa" ? city.nameFa : city.nameEn}
                    </a>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </section>
    </main>
  );
}