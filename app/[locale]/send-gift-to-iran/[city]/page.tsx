// مسیر واقعی در پروژه: app/[locale]/send-gift-to-iran/[city]/page.tsx
// این نسخه، جایگزین کامل فایل قبلیه — فقط ظاهر (JSX/className) عوض شده،
// هیچ‌کدوم از منطق سئو (generateStaticParams، generateMetadata، JSON-LD،
// alt متن‌ها، لینک‌های داخلی) دست نخورده.
//
// چرا هنوز 'use client' نداره: آکاردئون FAQ با ترفند CSS-only
// (group + group-open:) پیاده شده، نه useState — یعنی HTML سوال‌وجواب‌ها
// از همون اول توی صفحه هست (خوب برای سئو) و نیازی به جاوااسکریپت کلاینت
// هم نداره.

import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { HelpCircle, Plus, Minus, MapPin, ArrowLeft, ExternalLink } from "lucide-react";
import { getCityBySlug, targetCities } from "@/lib/data/cities";
import { citiesContent } from "@/lib/data/citiesContent";

const CITY_IMAGES = [
  { file: "hero-family-delivery.webp", altKey: "delivery" as const },
  { file: "ordering-from-abroad.webp", altKey: "ordering" as const },
  { file: "persian-gift-box.webp", altKey: "giftbox" as const },
];

type Locale = "fa" | "en";

type PageProps = {
  params: Promise<{ locale: string; city: string }>;
};

const SITE_URL = "https://soughat.shop";

function isLocale(value: string): value is Locale {
  return value === "fa" || value === "en";
}

export function generateStaticParams() {
  return Object.keys(citiesContent.fa).map((slug) => ({ city: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const city = getCityBySlug(citySlug);
  const content = citiesContent[locale]?.[citySlug];
  if (!city || !content) return {};

  const cityName = locale === "fa" ? city.nameFa : city.nameEn;

  const title =
    locale === "fa"
      ? `ارسال هدیه و پول از ${cityName} به ایران`
      : `Send Gifts & Money to Iran from ${cityName}`;

  const description =
    locale === "fa"
      ? `ارسال هدیه، سوغات و پول نقد از ${cityName} به هر شهر ایران، با پرداخت کریپتو و تحویل درب منزل. بدون نیاز به کارت بانکی ایرانی.`
      : `Send gifts, treats, and cash to anywhere in Iran from ${cityName}. Pay with crypto, doorstep delivery with proof of delivery, no Iranian bank card needed.`;

  const path = `/send-gift-to-iran/${citySlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}${path}`,
      languages: {
        fa: `${SITE_URL}/fa${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}/${locale}${path}` },
  };
}

export default async function CityLandingPage({ params }: PageProps) {
  const { locale: rawLocale, city: citySlug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const city = getCityBySlug(citySlug);
  const content = citiesContent[locale]?.[citySlug];
  if (!city || !content) notFound();

  const cityName = locale === "fa" ? city.nameFa : city.nameEn;
  const isRtl = locale === "fa";

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main dir={isRtl ? "rtl" : "ltr"} className="font-[family-name:var(--font-vazir)]">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* هیرو — پس‌زمینه‌ی آبی ملایم، هم‌خانواده با برند سایت */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
            <MapPin className="h-3.5 w-3.5" />
            {cityName}
          </div>

          <h1 className="text-2xl font-black leading-snug text-gray-900 md:text-3xl">
            {locale === "fa"
              ? `ارسال هدیه و پول از ${cityName} به ایران`
              : `Send Gifts & Money to Iran from ${cityName}`}
          </h1>

          <p className="mt-4 text-lg leading-8 text-gray-600">{content.heroIntro}</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CITY_IMAGES.map((img) => {
              const altText = {
                delivery:
                  locale === "fa"
                    ? `تحویل هدیه درب منزل در ایران، برای مشتری از ${cityName}`
                    : `Gift delivered to a family's door in Iran, ordered from ${cityName}`,
                ordering:
                  locale === "fa"
                    ? `سفارش آنلاین هدیه به ایران از ${cityName} با پرداخت کریپتو`
                    : `Ordering a gift to Iran online from ${cityName} with crypto payment`,
                giftbox:
                  locale === "fa"
                    ? `باکس هدیه لوکس ایرانی قابل ارسال از ${cityName} به ایران`
                    : `Luxury Persian gift box shippable from ${cityName} to Iran`,
              }[img.altKey];

              return (
                <div
                  key={img.file}
                  className="relative aspect-square overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5"
                >
                  <Image
                    src={`/images/send-gift-to-iran/${img.file}`}
                    alt={altText}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* بخش‌های محتوا — کارت‌های سفید با سایه‌ی ملایم */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-3xl space-y-5 px-4">
          {content.sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-gray-900 md:text-xl">{section.title}</h2>
              <p className="mt-2 leading-7 text-gray-600">{section.paragraph}</p>
            </div>
          ))}
        </div>
      </section>

      {/* سوالات پرتکرار — دقیقاً هم‌سبک با FAQ.tsx خودِ سایت */}
      <section className="border-t border-gray-100 bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-50 p-3">
              <HelpCircle className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === "fa" ? "سوالات پرتکرار" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="space-y-3">
            {content.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-gray-200 transition-colors open:border-blue-200 open:bg-blue-50/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-start">
                  <span className="text-sm font-bold text-gray-700 group-open:text-blue-800 md:text-base">
                    {faq.question}
                  </span>
                  <Plus className="h-5 w-5 shrink-0 text-gray-400 group-open:hidden" />
                  <Minus className="hidden h-5 w-5 shrink-0 text-blue-600 group-open:block" />
                </summary>
                <div className="border-t border-blue-100 px-5 pb-5 pt-3">
                  <p className="text-sm leading-7 text-gray-600 md:text-base">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* لینک‌های داخلی مرتبط + CTA به صفحه‌ی هاب */}
      <section className="border-t border-gray-100 bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-sm font-bold text-gray-500">
            {locale === "fa" ? "پیشنهاد می‌کنیم ببینید" : "You might also like"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {content.relatedProducts.map((product) => (
              <a
                key={product.slug}
                href={`/${locale}/products/${product.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {product.title}
              </a>
            ))}
            <a
              href={`/${locale}/blog/${content.relatedPost.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {content.relatedPost.title}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <a
            href={`/${locale}/send-gift-to-iran`}
            className="mt-8 flex items-center justify-between rounded-2xl border-2 border-dashed border-blue-200 bg-white p-5 transition-colors hover:bg-blue-50/50"
          >
            <span className="text-sm font-bold text-gray-800">
              {locale === "fa" ? "شهر خودت رو نمی‌بینی؟ همه‌ی ۴۰ شهر رو ببین" : "Don't see your city? Browse all 40 cities"}
            </span>
            <ArrowLeft className={`h-5 w-5 text-blue-500 ${!isRtl ? "rotate-180" : ""}`} />
          </a>
        </div>
      </section>
    </main>
  );
}