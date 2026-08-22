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
  | "middle-east"
  | "asia";

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

  // ============================================================
  // زیر این خط: ۳۲ شهر جدید (اضافه شده در فاز دوم گسترش سئو)
  // هیچ‌کدام از ۴۰ شهر بالا دست‌نخورده باقی موندن.
  // ============================================================

  // --- آمریکا، دور دوم (۸) ---
  { slug: "miami", nameFa: "میامی", nameEn: "Miami", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "atlanta", nameFa: "آتلانتا", nameEn: "Atlanta", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "boston", nameFa: "بوستون", nameEn: "Boston", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "denver", nameFa: "دنور", nameEn: "Denver", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "austin", nameFa: "آستین", nameEn: "Austin", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "phoenix", nameFa: "فینیکس", nameEn: "Phoenix", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "sacramento", nameFa: "ساکرامنتو", nameEn: "Sacramento", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },
  { slug: "orlando", nameFa: "اورلاندو", nameEn: "Orlando", countryFa: "آمریکا", countryEn: "United States", currency: "USD", region: "north-america" },

  // --- کانادا، دور دوم (۲) ---
  { slug: "calgary", nameFa: "کلگری", nameEn: "Calgary", countryFa: "کانادا", countryEn: "Canada", currency: "CAD", region: "north-america" },
  { slug: "edmonton", nameFa: "ادمونتون", nameEn: "Edmonton", countryFa: "کانادا", countryEn: "Canada", currency: "CAD", region: "north-america" },

  // --- آلمان، دور دوم (۳) ---
  { slug: "munich", nameFa: "مونیخ", nameEn: "Munich", countryFa: "آلمان", countryEn: "Germany", currency: "EUR", region: "europe" },
  { slug: "dusseldorf", nameFa: "دوسلدورف", nameEn: "Düsseldorf", countryFa: "آلمان", countryEn: "Germany", currency: "EUR", region: "europe" },
  { slug: "stuttgart", nameFa: "اشتوتگارت", nameEn: "Stuttgart", countryFa: "آلمان", countryEn: "Germany", currency: "EUR", region: "europe" },

  // --- اسپانیا (۲) ---
  { slug: "madrid", nameFa: "مادرید", nameEn: "Madrid", countryFa: "اسپانیا", countryEn: "Spain", currency: "EUR", region: "europe" },
  { slug: "barcelona", nameFa: "بارسلونا", nameEn: "Barcelona", countryFa: "اسپانیا", countryEn: "Spain", currency: "EUR", region: "europe" },

  // --- ایتالیا، دور دوم (۱) ---
  { slug: "milan", nameFa: "میلان", nameEn: "Milan", countryFa: "ایتالیا", countryEn: "Italy", currency: "EUR", region: "europe" },

  // --- فرانسه، دور دوم (۱) ---
  { slug: "marseille", nameFa: "مارسی", nameEn: "Marseille", countryFa: "فرانسه", countryEn: "France", currency: "EUR", region: "europe" },

  // --- هلند، دور دوم (۱) ---
  { slug: "the-hague", nameFa: "لاهه", nameEn: "The Hague", countryFa: "هلند", countryEn: "Netherlands", currency: "EUR", region: "europe" },

  // --- سوئیس، دور دوم (۱) ---
  { slug: "geneva", nameFa: "ژنو", nameEn: "Geneva", countryFa: "سوئیس", countryEn: "Switzerland", currency: "CHF", region: "europe" },

  // --- بریتانیا، دور دوم (۱) ---
  { slug: "birmingham", nameFa: "بیرمنگام", nameEn: "Birmingham", countryFa: "بریتانیا", countryEn: "United Kingdom", currency: "GBP", region: "europe" },

  // --- ایرلند (۱) ---
  { slug: "dublin", nameFa: "دوبلین", nameEn: "Dublin", countryFa: "ایرلند", countryEn: "Ireland", currency: "EUR", region: "europe" },

  // --- فنلاند (۱) ---
  { slug: "helsinki", nameFa: "هلسینکی", nameEn: "Helsinki", countryFa: "فنلاند", countryEn: "Finland", currency: "EUR", region: "europe" },

  // --- سوئد، دور دوم (۱) ---
  { slug: "malmo", nameFa: "مالمو", nameEn: "Malmö", countryFa: "سوئد", countryEn: "Sweden", currency: "SEK", region: "europe" },

  // --- استرالیا، دور دوم (۲) ---
  { slug: "perth", nameFa: "پرت", nameEn: "Perth", countryFa: "استرالیا", countryEn: "Australia", currency: "AUD", region: "oceania" },
  { slug: "adelaide", nameFa: "آدلاید", nameEn: "Adelaide", countryFa: "استرالیا", countryEn: "Australia", currency: "AUD", region: "oceania" },

  // --- نیوزیلند (۱) ---
  { slug: "auckland", nameFa: "آکلند", nameEn: "Auckland", countryFa: "نیوزیلند", countryEn: "New Zealand", currency: "NZD", region: "oceania" },

  // --- آسیا: ژاپن، کره جنوبی، مالزی، تایلند، سنگاپور (۶) ---
  { slug: "tokyo", nameFa: "توکیو", nameEn: "Tokyo", countryFa: "ژاپن", countryEn: "Japan", currency: "JPY", region: "asia" },
  { slug: "osaka", nameFa: "اوزاکا", nameEn: "Osaka", countryFa: "ژاپن", countryEn: "Japan", currency: "JPY", region: "asia" },
  { slug: "seoul", nameFa: "سئول", nameEn: "Seoul", countryFa: "کره جنوبی", countryEn: "South Korea", currency: "KRW", region: "asia" },
  { slug: "kuala-lumpur", nameFa: "کوالالامپور", nameEn: "Kuala Lumpur", countryFa: "مالزی", countryEn: "Malaysia", currency: "MYR", region: "asia" },
  { slug: "bangkok", nameFa: "بانکوک", nameEn: "Bangkok", countryFa: "تایلند", countryEn: "Thailand", currency: "THB", region: "asia" },
  { slug: "singapore", nameFa: "سنگاپور", nameEn: "Singapore", countryFa: "سنگاپور", countryEn: "Singapore", currency: "SGD", region: "asia" },
];

// یک تابع کمکی برای پیدا کردن اطلاعات یک شهر بر اساس نامک (slug)
export function getCityBySlug(slug: string): City | undefined {
  return targetCities.find((city) => city.slug === slug);
}