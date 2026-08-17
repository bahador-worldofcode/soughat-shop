// مسیر واقعی در پروژه: app/[locale]/send-gift-to-iran/[city]/page.tsx
// (اینجا فقط برای خوانایی توی این پوشه‌ی موقت، پوشه‌ها ساده‌سازی شدن)
//
// ⚠️ نکته‌ی مهم قبل از پیست‌کردن: طبق AGENTS.md خودِ پروژه، این نسخه از Next.js
// (16.3.0) ممکنه در generateStaticParams/params-as-Promise رفتار متفاوتی نسبت به
// چیزی داشته باشه که من می‌شناسم. قبل از commit، یه نگاه به
// node_modules/next/dist/docs/ بنداز (دقیقاً همون چیزی که AGENTS.md می‌گه) تا
// مطمئن بشی امضای generateStaticParams/generateMetadata هنوز همینه.

import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getCityBySlug, targetCities } from "@/lib/data/cities";
import { citiesContent } from "@/lib/data/citiesContent";

// همین ۳ عکس، عیناً برای هر ۴۰ شهر استفاده می‌شه — فقط altِ هرکدوم per-city عوض می‌شه.
// این آرایه رو با CITY_IMAGE_PROMPTS.md هماهنگ نگه دار (همون فایلی که پرامپت‌های
// ساخت عکس توشه).
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
  // این فقط پارامترِ همین سگمنت ([city]) رو برمی‌گردونه؛ سگمنتِ [locale]
  // معمولاً از قبل توی app/[locale]/layout.tsx خودِ پروژه جنریت می‌شه.
  // فقط شهرهایی که واقعاً محتوا دارن (در citiesContent) رو استاتیک بساز؛
  // بقیه تا وقتی محتوا اضافه نشده 404 می‌گیرن، نه صفحه‌ی نصفه‌کاره.
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

  // FAQPage structured data — کمک به rich results و اینکه ایجنت‌های AI هم
  // ساختار سوال/جواب رو تمیز بخونن.
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
    <main dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h1 className="text-3xl font-bold leading-snug">
        {locale === "fa" ? `ارسال هدیه و پول از ${cityName} به ایران` : `Send Gifts & Money to Iran from ${cityName}`}
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-neutral-700">{content.heroIntro}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CITY_IMAGES.map((img) => {
          const altText = {
            delivery:
              locale === "fa"
                ? `تحویل هدیه درب منزل در ${cityName === city.nameFa ? "" : ""}ایران، برای مشتری از ${cityName}`
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
            <div key={img.file} className="relative aspect-square overflow-hidden rounded-xl">
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

      <div className="mt-10 space-y-8">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-neutral-700">{section.paragraph}</p>
          </section>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold">
          {locale === "fa" ? "سوالات پرتکرار" : "Frequently Asked Questions"}
        </h2>
        <div className="mt-4 space-y-3">
          {content.faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-neutral-200 p-4">
              <summary className="cursor-pointer font-medium">{faq.question}</summary>
              <p className="mt-2 leading-relaxed text-neutral-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {content.relatedProducts.map((product) => (
          <a
            key={product.slug}
            href={`/${locale}/products/${product.slug}`}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            {product.title}
          </a>
        ))}
        <a
          href={`/${locale}/blog/${content.relatedPost.slug}`}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
        >
          {content.relatedPost.title}
        </a>
      </div>
    </main>
  );
}