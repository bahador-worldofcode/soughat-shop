// مسیر فایل: lib/data/cities.ts
//
// این فایل فقط متادیتای مشترک و مستقل از زبانه (اسم، ارز، کشور).
// محتوای تبلیغاتی/سئوی هر شهر (که به فارسی و انگلیسی جدا نوشته می‌شه)
// در lib/data/citiesContent.ts هست، نه اینجا.
//
// الگو دقیقاً هم‌خانواده‌ی lib/data/regions.ts در پروژه‌ی موتوتعمیره.

export type CityRegion =
  | "north-america"
  | "europe"
  | "oceania"
  | "middle-east";

export type City = {
  slug: string; // در URL هر دو زبان استفاده می‌شه: /fa/send-gift-to-iran/{slug} و /en/send-gift-to-iran/{slug}
  nameFa: string;
  nameEn: string;
  countryFa: string;
  countryEn: string;
  currency: string; // کد ارز محلی (برای نمایش قیمت‌های تبدیل‌شده در محتوا)
  region: CityRegion;
};

export const targetCities: City[] = [
  // --- آمریکا (۱۱) ---
  { slug: "los-angeles", nameFa: "لس‌آنجلس", nameEn: "Los Angeles", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "irvine", nameFa: "ایروین", nameEn: "Irvine", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "san-jose", nameFa: "سن‌خوزه", nameEn: "San Jose", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "san-francisco", nameFa: "سانفرانسیسکو", nameEn: "San Francisco", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "san-diego", nameFa: "سن‌دیگو", nameEn: "San Diego", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "new-york", nameFa: "نیویورک", nameEn: "New York", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "washington-dc", nameFa: "واشنگتن دی‌سی", nameEn: "Washington D.C.", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "houston", nameFa: "هیوستون", nameEn: "Houston", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "dallas", nameFa: "دالاس", nameEn: "Dallas", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "seattle", nameFa: "سیاتل", nameEn: "Seattle", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "chicago", nameFa: "شیکاگو", nameEn: "Chicago", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },

  // --- کانادا (۴) ---
  { slug: "toronto", nameFa: "تورنتو", nameEn: "Toronto", countryFa: "کانادا", countryEn: "Canada", currency: "CAD", region: "north-america" },
  { slug: "vancouver", nameFa: "ونکوور", nameEn: "Vancouver", countryFa: "کانادا", countryEn: "Canada", currency: "CAD", region: "north-america" },
  { slug: "montreal", nameFa: "مونترال", nameEn: "Montreal", countryFa: "کانادا", countryEn: "Canada", currency: "CAD", region: "north-america" },
  { slug: "ottawa", nameFa: "اتاوا", nameEn: "Ottawa", countryFa: "کانادا", countryEn: "Canada", currency: "CAD", region: "north-america" },

  // --- بریتانیا (۳) ---
  { slug: "london", nameFa: "لندن", nameEn: "London", countryFa: "بریتانیا", countryEn: "United Kingdom", currency: "GBP", region: "europe" },
  { slug: "manchester", nameFa: "منچستر", nameEn: "Manchester", countryFa: "بریتانیا", countryEn: "United Kingdom", currency: "GBP", region: "europe" },
  { slug: "edinburgh", nameFa: "ادینبورگ", nameEn: "Edinburgh", countryFa: "بریتانیا", countryEn: "United Kingdom", currency: "GBP", region: "europe" },

  // --- آلمان (۴) ---
  { slug: "berlin", nameFa: "برلین", nameEn: "Berlin", countryFa: "آلمان", countryEn: "Germany", currency: "EUR", region: "europe" },
  { slug: "hamburg", nameFa: "هامبورگ", nameEn: "Hamburg", countryFa: "آلمان", countryEn: "Germany", currency: "EUR", region: "europe" },
  { slug: "frankfurt", nameFa: "فرانکفورت", nameEn: "Frankfurt", countryFa: "آلمان", countryEn: "Germany", currency: "EUR", region: "europe" },
  { slug: "cologne", nameFa: "کلن", nameEn: "Cologne", countryFa: "آلمان", countryEn: "Germany", currency: "EUR", region: "europe" },

  // --- سوئد (۲) ---
  { slug: "stockholm", nameFa: "استکهلم", nameEn: "Stockholm", countryFa: "سوئد", countryEn: "Sweden", currency: "SEK", region: "europe" },
  { slug: "gothenburg", nameFa: "گوتنبرگ", nameEn: "Gothenburg", countryFa: "سوئد", countryEn: "Sweden", currency: "SEK", region: "europe" },

  // --- هلند (۲) ---
  { slug: "amsterdam", nameFa: "آمستردام", nameEn: "Amsterdam", countryFa: "هلند", countryEn: "Netherlands", currency: "EUR", region: "europe" },
  { slug: "rotterdam", nameFa: "روتردام", nameEn: "Rotterdam", countryFa: "هلند", countryEn: "Netherlands", currency: "EUR", region: "europe" },

  // --- فرانسه (۲) ---
  { slug: "paris", nameFa: "پاریس", nameEn: "Paris", countryFa: "فرانسه", countryEn: "France", currency: "EUR", region: "europe" },
  { slug: "lyon", nameFa: "لیون", nameEn: "Lyon", countryFa: "فرانسه", countryEn: "France", currency: "EUR", region: "europe" },

  // --- اتریش، سوئیس، ایتالیا (۳) ---
  { slug: "vienna", nameFa: "وین", nameEn: "Vienna", countryFa: "اتریش", countryEn: "Austria", currency: "EUR", region: "europe" },
  { slug: "zurich", nameFa: "زوریخ", nameEn: "Zurich", countryFa: "سوئیس", countryEn: "Switzerland", currency: "CHF", region: "europe" },
  { slug: "rome", nameFa: "رم", nameEn: "Rome", countryFa: "ایتالیا", countryEn: "Italy", currency: "EUR", region: "europe" },

  // --- دانمارک، نروژ، بلژیک (۳) ---
  { slug: "copenhagen", nameFa: "کپنهاگ", nameEn: "Copenhagen", countryFa: "دانمارک", countryEn: "Denmark", currency: "DKK", region: "europe" },
  { slug: "oslo", nameFa: "اسلو", nameEn: "Oslo", countryFa: "نروژ", countryEn: "Norway", currency: "NOK", region: "europe" },
  { slug: "brussels", nameFa: "بروکسل", nameEn: "Brussels", countryFa: "بلژیک", countryEn: "Belgium", currency: "EUR", region: "europe" },

  // --- استرالیا (۳) ---
  { slug: "sydney", nameFa: "سیدنی", nameEn: "Sydney", countryFa: "استرالیا", countryEn: "Australia", currency: "AUD", region: "oceania" },
  { slug: "melbourne", nameFa: "ملبورن", nameEn: "Melbourne", countryFa: "استرالیا", countryEn: "Australia", currency: "AUD", region: "oceania" },
  { slug: "brisbane", nameFa: "بریزبن", nameEn: "Brisbane", countryFa: "استرالیا", countryEn: "Australia", currency: "AUD", region: "oceania" },

  // --- امارات و ترکیه (۳) ---
  { slug: "dubai", nameFa: "دبی", nameEn: "Dubai", countryFa: "امارات", countryEn: "United Arab Emirates", currency: "AED", region: "middle-east" },
  { slug: "abu-dhabi", nameFa: "ابوظبی", nameEn: "Abu Dhabi", countryFa: "امارات", countryEn: "United Arab Emirates", currency: "AED", region: "middle-east" },
  { slug: "istanbul", nameFa: "استانبول", nameEn: "Istanbul", countryFa: "ترکیه", countryEn: "Turkey", currency: "TRY", region: "middle-east" },
];

// یک تابع کمکی برای پیدا کردن اطلاعات یک شهر بر اساس نامک (slug)
export function getCityBySlug(slug: string): City | undefined {
  return targetCities.find((city) => city.slug === slug);
}