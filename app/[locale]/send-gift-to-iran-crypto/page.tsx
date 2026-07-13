import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { CheckCircle, ArrowLeft, Send, Zap, Wallet, ShieldCheck, Coins } from 'lucide-react';

// =========================================================================
// این فایل باید دقیقاً در مسیر زیر قرار بگیرد (پوشه‌ها را با همین اسم بساز):
// app/[locale]/send-gift-to-iran-crypto/page.tsx
//
// تصاویر باید در همین مسیرها آپلود/قرار داده شوند (یا لینک نهایی‌شان جای‌گزین شود):
// public/images/send-gift-iran-crypto/fa/01-hero-crypto-to-gift.webp ... 05-secure-delivery-trust.webp
// public/images/send-gift-iran-crypto/en/01-hero-crypto-to-gift.webp ... 05-secure-delivery-trust.webp
// =========================================================================

// دکمه‌ی اصلی CTA — چون این صفحه چند دسته‌بندی مختلف (هدیه، طلا، پول، زعفران و ...) را پوشش می‌دهد،
// به‌جای یک محصول خاص، به لیست کامل محصولات لینک می‌دهیم.
const CTA_LINK = '/products';

type FaqItem = { q: string; a: string };

// دسته‌بندی‌های محبوب برای بخش «چه چیزی می‌توانید هدیه بفرستید» — از دیتابیس واقعی پروژه گرفته شده
type CategoryCard = { slug: string; nameFa: string; nameEn: string; icon: string };

const categories: CategoryCard[] = [
  { slug: 'gold-and-money', nameFa: 'طلا و پول', nameEn: 'Gold & Money', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/gold-and-money.png' },
  { slug: 'gift-packs', nameFa: 'پک‌های هدیه', nameEn: 'Gift Packs', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/gift-packs.png' },
  { slug: 'saffron', nameFa: 'زعفران اعلاء', nameEn: 'Premium Saffron', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/saffron.png' },
  { slug: 'nuts', nameFa: 'آجیل و خشکبار', nameEn: 'Nuts & Dried Fruits', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/nuts.png' },
  { slug: 'sweets', nameFa: 'شیرینی و تنقلات', nameEn: 'Sweets & Snacks', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/sweets.png' },
  { slug: 'chocolates', nameFa: 'شکلات و تافی', nameEn: 'Chocolates & Toffee', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/chocolates.png' },
  { slug: 'herbal-tea', nameFa: 'دمنوش و گیاهی', nameEn: 'Herbal Teas', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/herbal-tea.png' },
  { slug: 'flowers', nameFa: 'گل و گیاه', nameEn: 'Flowers & Plants', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/flowers.png' },
  { slug: 'handicrafts', nameFa: 'صنایع دستی', nameEn: 'Handicrafts', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/handicrafts.png' },
  { slug: 'digital-goods', nameFa: 'کالای دیجیتال', nameEn: 'Digital Goods', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/digital-goods-icon.png' },
  { slug: 'home-appliances', nameFa: 'لوازم خانگی و برقی', nameEn: 'Home Appliances', icon: 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/icons/3d/home-appliances.png' },
];

// ---------------------------------------------------------------------------
// سوالات متداول — متن دقیقاً همان متنی است که قبلاً تایید و ارسال شده (کلمه به کلمه)
// ---------------------------------------------------------------------------

const faqFa: FaqItem[] = [
  { q: 'چطور با رمز ارز به ایران هدیه بفرستم؟', a: 'کافی‌ست یک کیف پول رمزارزی داشته باشید، تتر یا بیت‌کوین بخرید، محصول مدنظرتان را در سوغات شاپ انتخاب کنید و هزینه را به آدرس کیف پولی که در اختیارتان قرار می‌گیرد ارسال کنید. هدیه ظرف کمتر از یک ساعت به دست گیرنده در ایران می‌رسد.' },
  { q: 'چطور سفارش خودم رو با رمز ارز پرداخت کنم؟', a: 'پس از ثبت سفارش، آدرس کیف پول مقصد نمایش داده می‌شود. از حساب صرافی یا کیف پول شخصی خود، مبلغ را با شبکه‌ی درست (مثلاً TRC20 برای تتر) به همان آدرس ارسال کنید.' },
  { q: 'آیا می‌توانم برای پدر و مادرم در ایران سفارش هدیه بدهم و با کریپتو پرداخت کنم؟', a: 'بله، دقیقاً برای همین طراحی شده‌ایم. کافی‌ست اطلاعات گیرنده (پدر یا مادر شما) را در فرم سفارش وارد کنید و پرداخت را با تتر، بیت‌کوین یا سولانا انجام دهید.' },
  { q: 'آیا می‌توانم برای دوستم در ایران هدیه بفرستم و با تتر پرداخت کنم؟', a: 'بله، سفارش برای دوستان دقیقاً مثل سفارش برای خانواده انجام می‌شود؛ فقط اطلاعات گیرنده را با دقت وارد کنید.' },
  { q: 'من بلد نیستم با رمز ارز کار کنم، چطور باید شروع کنم؟', a: 'از بخش «راهنمای کامل قدم‌به‌قدم برای تازه‌واردها» در همین صفحه شروع کنید. شش قدم ساده شما را از ساخت حساب صرافی تا تحویل هدیه در ایران همراهی می‌کند.' },
  { q: 'چطور یک کیف پول رمز ارزی بسازم؟', a: 'با ثبت‌نام در یک صرافی معتبر (مثل Binance یا Coinbase) یک کیف پول به‌صورت خودکار برایتان ساخته می‌شود. برای کیف پول شخصی‌تر، اپلیکیشن‌هایی مثل Trust Wallet یا MetaMask را نصب کنید.' },
  { q: 'از کدوم رمز ارز برای ارسال هدیه به ایران استفاده کنم؟', a: 'پیشنهاد ما تتر (USDT) روی شبکه TRC20 است؛ چون ارزش ثابتی دارد و کارمزد شبکه آن بسیار پایین است.' },
  { q: 'کدوم رمز ارز بهتره: تتر، بیت‌کوین یا سولانا؟', a: 'هر سه قابل قبول‌اند. تتر برای ثبات قیمت، سولانا برای سرعت و کارمزد پایین، و بیت‌کوین برای کسانی که از قبل آن را دارند مناسب است.' },
  { q: 'کدوم صرافی‌ها معتبرن که رمز ارز بخرم؟', a: 'صرافی‌های جهانی مثل Binance، Coinbase، Kraken، Bybit و KuCoin از شناخته‌شده‌ترین و معتبرترین گزینه‌ها هستند و در اکثر کشورها فعال‌اند.' },
  { q: 'کدوم وبسایت می‌تواند پرداخت رمز ارزی را بگیرد و هدیه را در ایران تحویل بدهد؟', a: 'سوغات شاپ (Soughat.shop) دقیقاً همین خدمت را ارائه می‌دهد: پرداخت کریپتویی از هر کجای دنیا و تحویل هدیه یا پول نقد در سراسر ایران.' },
  { q: 'چطور خیلی سریع با کریپتو به ایران هدیه بفرستم؟', a: 'سریع‌ترین مسیر، پرداخت با تتر روی شبکه TRC20 است؛ تراکنش در چند دقیقه تایید و هدیه ظرف کمتر از یک ساعت تحویل داده می‌شود.' },
  { q: 'کیف پول رمز ارزی ندارم، چطور بسازم و شارژش کنم؟', a: 'در یک صرافی معتبر ثبت‌نام کنید، کیف پول به‌صورت خودکار ساخته می‌شود، سپس با کارت بانکی یا حواله بانکی محلی، رمزارز خریداری (شارژ) کنید.' },
  { q: 'کارمزد ارسال هدیه به ایران با رمز ارز چقدر است؟', a: 'معمولاً کمتر از یک دلار برای کارمزد شبکه (روی TRC20)؛ سوغات شاپ کارمزد پنهان اضافه‌ای دریافت نمی‌کند.' },
  { q: 'چطور مطمئن بشم رمز ارزم به حساب گیرنده می‌رسد؟', a: 'تراکنش‌های بلاک‌چین شفاف و قابل رهگیری هستند. پس از تایید تراکنش، سوغات شاپ بلافاصله سفارش را پردازش می‌کند و عکس یا رسید تحویل را برایتان ارسال می‌کند.' },
  { q: 'وقتی سفارش هدیه با رمز ارز ثبت می‌کنم، به دست گیرنده در ایران می‌رسد؟', a: 'بله، پس از تایید پرداخت روی بلاک‌چین، سفارش در کمتر از یک ساعت پردازش و به آدرس یا کارت بانکی گیرنده در ایران تحویل داده می‌شود.' },
  { q: 'آیا رمز ارز و تتر برای ارسال هدیه به ایران امن است؟', a: 'بله. تراکنش‌های بلاک‌چین رمزنگاری‌شده و غیرقابل دستکاری هستند. علاوه بر این، سوغات شاپ ضمانت بازگشت ۱۰۰٪ وجه در صورت بروز مشکل را ارائه می‌دهد.' },
  { q: 'آیا از آمریکا می‌توانم هدیه با ارز دیجیتال به ایران بفرستم؟', a: 'بله، از هر ایالتی در آمریکا می‌توانید رمزارز بخرید و سفارش خود را در سوغات شاپ ثبت کنید.' },
  { q: 'آیا از اروپا می‌شود با کریپتو هدیه به ایران فرستاد؟', a: 'بله، از تمام کشورهای اروپایی، با خرید تتر یا بیت‌کوین با یورو، امکان ارسال هدیه به ایران وجود دارد.' },
  { q: 'آیا از کانادا امکان ارسال هدیه و پول با رمز ارز هست؟', a: 'بله، ایرانیان مقیم کانادا نیز می‌توانند از صرافی‌های کانادایی رمزارز خریداری و سفارش خود را ثبت کنند.' },
  { q: 'آیا از استرالیا می‌شود سفارش هدیه داد و با کریپتو پرداخت کرد؟', a: 'بله، از سراسر استرالیا این امکان برای شما فراهم است.' },
  { q: 'آیا از انگلیس امکان ارسال سوغاتی به ایران با ارز دیجیتال هست؟', a: 'بله، ایرانیان مقیم انگلیس نیز می‌توانند با پوند رمزارز خریداری کرده و سفارش خود را ثبت کنند.' },
  { q: 'آیا نیاز به احراز هویت (KYC) در سوغات شاپ دارم؟', a: 'خیر. تنها چیزی که نیاز دارید یک کیف پول رمزارزی و اطلاعات گیرنده در ایران است.' },
  { q: 'اگر آدرس کیف پول را اشتباه وارد کنم چه می‌شود؟', a: 'تراکنش‌های بلاک‌چین برگشت‌ناپذیرند، پس همیشه پیش از ارسال، آدرس را با دقت با آنچه سایت نمایش می‌دهد مطابقت دهید.' },
  { q: 'چند دقیقه طول می‌کشد تا هدیه یا پول به ایران برسد؟', a: 'پس از تایید تراکنش روی بلاک‌چین (معمولاً ۵ تا ۱۰ دقیقه)، تحویل در کمتر از یک ساعت انجام می‌شود.' },
  { q: 'آیا امکان ارسال هم‌زمان برای چند نفر در ایران هست؟', a: 'بله، برای هر گیرنده باید یک سفارش جداگانه ثبت شود تا اطلاعات و کارمزدها درست پردازش شوند.' },
  { q: 'چه شبکه‌ای (نتورک) را برای ارسال تتر انتخاب کنم؟', a: 'شبکه TRC20 (ترون) به دلیل کارمزد ناچیز و سرعت بالا بهترین گزینه است.' },
  { q: 'آیا گیرنده در ایران باید چیزی درباره رمز ارز بداند؟', a: 'خیر، گیرنده فقط هدیه یا واریز ریالی را دریافت می‌کند و نیازی به دانستن چیزی درباره کریپتو ندارد.' },
  { q: 'آیا سوغات شاپ اولین پلتفرم پرداخت کریپتویی برای ارسال هدیه به ایران است؟', a: 'سوغات شاپ یکی از اولین و پیشروترین پلتفرم‌هایی است که پرداخت کامل با رمزارز را برای ارسال هدیه و پول به ایران فراهم کرده است.' },
];

const faqEn: FaqItem[] = [
  { q: 'How do I send a gift to Iran with crypto?', a: 'Simply have a crypto wallet, buy Tether or Bitcoin, choose your product on Soughat.shop, and send the payment to the wallet address you are given. The gift reaches the recipient in Iran in under an hour.' },
  { q: 'How do I pay for my order with crypto?', a: 'After placing your order, a destination wallet address is shown to you. From your exchange or personal wallet, send the amount using the correct network (e.g., TRC20 for Tether) to that address.' },
  { q: 'Can I place a gift order for my parents in Iran and pay with crypto?', a: 'Yes, that is exactly what we are built for. Just enter your parents\u2019 details as the recipient on the order form and pay with Tether, Bitcoin, or Solana.' },
  { q: 'Can I send a gift to my friend in Iran and pay with Tether?', a: 'Yes, ordering for a friend works exactly the same way as ordering for family — just make sure the recipient\u2019s details are entered correctly.' },
  { q: 'I do not know how to use crypto — how do I get started?', a: 'Start with the "Complete Step-by-Step Guide for Beginners" section on this page. Six simple steps walk you from creating an exchange account to your gift being delivered in Iran.' },
  { q: 'How do I create a crypto wallet?', a: 'Signing up with a trusted exchange (like Binance or Coinbase) automatically creates a wallet for you. For a more personal wallet, install an app like Trust Wallet or MetaMask.' },
  { q: 'Which cryptocurrency should I use to send a gift to Iran?', a: 'We recommend Tether (USDT) on the TRC20 network, since its value stays stable and network fees are very low.' },
  { q: 'Which is better: Tether, Bitcoin, or Solana?', a: 'All three work well. Tether is best for price stability, Solana for speed and low fees, and Bitcoin is convenient if you already hold it.' },
  { q: 'Which exchanges are reputable for buying crypto?', a: 'Global exchanges like Binance, Coinbase, Kraken, Bybit, and KuCoin are among the most well-known and trusted, and are available in most countries.' },
  { q: 'Which website accepts crypto payment and delivers a gift in Iran?', a: 'Soughat.shop offers exactly this service: crypto payment from anywhere in the world, with gift or cash delivery anywhere in Iran.' },
  { q: 'How can I send a gift to Iran with crypto very quickly?', a: 'The fastest route is paying with Tether on the TRC20 network; the transaction confirms within minutes and the gift is delivered in under an hour.' },
  { q: 'I do not have a crypto wallet — how do I create and fund one?', a: 'Sign up with a trusted exchange, a wallet is created automatically, then buy (fund) crypto using your bank card or local bank transfer.' },
  { q: 'How much does it cost to send a gift to Iran with crypto?', a: 'Usually under one dollar for the network fee (on TRC20); Soughat.shop does not charge any additional hidden fee.' },
  { q: 'How can I be sure my crypto reaches the recipient\u2019s account?', a: 'Blockchain transactions are transparent and traceable. Once your transaction is confirmed, Soughat.shop processes the order immediately and sends you a delivery photo or receipt.' },
  { q: 'When I place a gift order with crypto, does it actually reach the recipient in Iran?', a: 'Yes — once your payment is confirmed on the blockchain, the order is processed and delivered to the recipient\u2019s address or bank card in Iran in under an hour.' },
  { q: 'Is crypto and Tether safe for sending a gift to Iran?', a: 'Yes. Blockchain transactions are encrypted and tamper-proof. On top of that, Soughat.shop offers a 100% refund guarantee if anything goes wrong.' },
  { q: 'Can I send a gift with cryptocurrency to Iran from the USA?', a: 'Yes, you can buy crypto from any US state and place your order on Soughat.shop.' },
  { q: 'Can I send a gift to Iran from Europe with crypto?', a: 'Yes, from any European country, you can buy Tether or Bitcoin with euros and send a gift to Iran.' },
  { q: 'Can I send a gift and money from Canada to Iran with crypto?', a: 'Yes, Iranians living in Canada can buy crypto from Canadian exchanges and place their order.' },
  { q: 'Can I place a gift order from Australia and pay with crypto?', a: 'Yes, this is available to you from anywhere in Australia.' },
  { q: 'Can I send a souvenir from the UK to Iran with cryptocurrency?', a: 'Yes, Iranians living in the UK can buy crypto with pounds and place their order.' },
  { q: 'Do I need to complete identity verification (KYC) on Soughat.shop?', a: 'No. All you need is a crypto wallet and the recipient\u2019s details in Iran.' },
  { q: 'What happens if I enter the wallet address incorrectly?', a: 'Blockchain transactions are irreversible, so always carefully double-check the address against what is shown on the site before sending.' },
  { q: 'How many minutes does it take for a gift or money to reach Iran?', a: 'Once the transaction is confirmed on the blockchain (usually 5 to 10 minutes), delivery happens in under an hour.' },
  { q: 'Can I send gifts to multiple people in Iran at the same time?', a: 'Yes, place a separate order for each recipient so that details and fees are processed correctly.' },
  { q: 'Which network should I choose for sending Tether?', a: 'The TRC20 (Tron) network is the best choice due to its negligible fee and high speed.' },
  { q: 'Does the recipient in Iran need to know anything about crypto?', a: 'No, the recipient only receives the gift or a deposit — they do not need any knowledge of crypto.' },
  { q: 'Is Soughat.shop one of the first platforms for crypto-paid gift delivery to Iran?', a: 'Soughat.shop is one of the earliest and most established platforms offering full crypto payment for sending gifts and money to Iran.' },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';
  const isEn = locale === 'en';

  const title = isEn
    ? 'Send Gifts to Iran with Crypto, Tether & Bitcoin | Soughat.shop'
    : 'ارسال هدیه به ایران با رمزارز، تتر و بیت‌کوین | سوغات شاپ';

  const description = isEn
    ? 'Send gifts, souvenirs, and money to Iran from the USA, Europe, Canada, Australia, and the UK, paying with crypto (USDT, Bitcoin, Solana). A step-by-step guide for total beginners.'
    : 'ارسال هدیه، سوغات و پول از آمریکا، اروپا، کانادا، استرالیا و انگلیس به ایران با پرداخت رمزارزی (تتر، بیت‌کوین، سولانا). آموزش قدم‌به‌قدم برای افرادی که تازه با کریپتو آشنا می‌شوند.';

  const ogImage = isEn
    ? `${siteUrl}/images/send-gift-iran-crypto/en/01-hero-crypto-to-gift.webp`
    : `${siteUrl}/images/send-gift-iran-crypto/fa/01-hero-crypto-to-gift.webp`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/send-gift-to-iran-crypto`,
      languages: {
        fa: `${siteUrl}/fa/send-gift-to-iran-crypto`,
        en: `${siteUrl}/en/send-gift-to-iran-crypto`,
        'x-default': `${siteUrl}/en/send-gift-to-iran-crypto`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/send-gift-to-iran-crypto`,
      locale: isEn ? 'en_US' : 'fa_IR',
      type: 'article',
      images: [{ url: ogImage }],
    },
  };
}

export default async function SendGiftToIranCryptoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const faqList = isEn ? faqEn : faqFa;
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  // FAQPage schema — چون همه‌ی q/a رشته‌ی ساده هستند (نه JSX)، همیشه متن کامل
  // به گوگل داده می‌شود و هیچ سوالی خالی نمی‌ماند.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isEn ? 'Home' : 'خانه',
        item: `${siteUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isEn ? 'Send Gifts to Iran with Crypto' : 'ارسال هدیه به ایران با رمزارز',
        item: `${siteUrl}/${locale}/send-gift-to-iran-crypto`,
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {isEn
              ? 'Send Gifts and Souvenirs to Iran with Crypto, Tether & Bitcoin'
              : 'ارسال هدیه و سوغات به ایران با رمزارز، تتر و بیت‌کوین'}
          </h1>
          <p className="text-blue-100 text-lg leading-8 max-w-3xl mx-auto text-justify">
            {isEn ? (
              <>
                Missing family and friends back home is something every Iranian abroad understands — whether you
                live in the USA, Europe, Canada, Australia, or the UK. Until recently, sending a gift or money to
                Iran meant dealing with traditional exchange offices, high fees, and days of waiting. Today, with
                cryptocurrencies like <strong>Tether (USDT)</strong>, <strong>Bitcoin (BTC)</strong>, and{' '}
                <strong>Solana (SOL)</strong>, the process has completely changed. At <strong>Soughat.shop</strong>,
                you can order a gift, souvenir, gold, or cash for your loved ones in Iran and pay with crypto — in
                minutes, without any banking hassle. On this page, we walk you through the entire process step by
                step, and if this is your first time working with crypto, we will take you from zero to your first
                successful gift order.
              </>
            ) : (
              <>
                دلتنگی برای خانواده و دوستان در ایران، حسی مشترک بین همه‌ی ایرانیان مقیم خارج از کشور است؛ چه در
                آمریکا زندگی کنید، چه در اروپا، کانادا، استرالیا یا انگلیس. تا همین چند سال پیش، ارسال هدیه یا پول
                به ایران یعنی درگیر شدن با صرافی‌های سنتی، کارمزدهای بالا، و روزها انتظار. امروز با ورود ارزهای
                دیجیتال مثل <strong>تتر (USDT)</strong>، <strong>بیت‌کوین (BTC)</strong> و{' '}
                <strong>سولانا (SOL)</strong>، این مسیر کاملاً ساده شده. در <strong>سوغات شاپ</strong>، شما می‌توانید
                هدیه، سوغات، طلا یا پول نقد سفارش دهید و پرداخت را با رمزارز، در چند دقیقه و بدون دردسرهای بانکی،
                انجام دهید. در این صفحه، هم روش کار را قدم‌به‌قدم توضیح می‌دهیم و هم اگر برای اولین‌بار است با
                رمزارز آشنا می‌شوید، از صفر تا صد یاد می‌گیرید.
              </>
            )}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href={CTA_LINK}
              className="inline-flex items-center bg-white text-blue-800 font-bold text-lg py-4 px-10 rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
            >
              {isEn ? 'Send a Gift Now' : 'ارسال هدیه همین حالا'}
              <Send className={`h-5 w-5 ${isEn ? 'ml-2' : 'mr-2'}`} />
            </Link>
            <span className="text-blue-200 text-sm">
              {isEn ? 'Pay with Tether, Bitcoin, Solana & more · Delivered in under 1 hour' : 'پرداخت با تتر، بیت‌کوین، سولانا و سایر ارزهای دیجیتال · تحویل در کمتر از ۱ ساعت'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating quick-access button */}
      <Link
        href={CTA_LINK}
        className={`inline-flex fixed bottom-5 ${isEn ? 'right-5' : 'left-5'} z-50 items-center gap-2 bg-blue-600 text-white font-bold py-3 px-5 md:py-4 md:px-6 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-105 transition-all`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
        </span>
        {isEn ? 'Send a Gift' : 'ارسال هدیه'}
      </Link>

      <div className="container mx-auto px-4 py-12 max-w-4xl">

        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? '/images/send-gift-iran-crypto/en/01-hero-crypto-to-gift.webp'
              : '/images/send-gift-iran-crypto/fa/01-hero-crypto-to-gift.webp'}
            alt={isEn ? 'Send a gift to Iran with cryptocurrency and Tether' : 'ارسال هدیه به ایران با رمزارز و تتر'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Pay with crypto and send a gift to your loved ones in Iran' : 'با رمزارز پرداخت کنید و برای عزیزانتان در ایران هدیه بفرستید'}
          </figcaption>
        </figure>

        {/* Why crypto */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'Why Crypto Is the Best Way to Send a Gift to Iran' : 'چرا رمزارز بهترین روش ارسال هدیه به ایران است؟'}
          </h2>
          <p className="text-gray-700 leading-8 text-justify">
            {isEn
              ? 'Traditional remittance methods usually come with heavy fees, strict limits, and multi-day waiting times. Blockchain is the opposite: network fees (for example, on the TRC20 network for Tether) are usually under one dollar, transactions confirm within minutes, and there is no geographic restriction or complicated identity verification. All you need is a crypto wallet — and we explain the rest of the process in full detail below.'
              : 'روش‌های سنتی حواله معمولاً کارمزد سنگین، محدودیت مبلغ و زمان انتظار چند روزه دارند. شبکه بلاک‌چین برعکس این است: کارمزد شبکه (مثلاً روی شبکه TRC20 برای تتر) معمولاً کمتر از یک دلار است، تراکنش‌ها در عرض چند دقیقه تایید می‌شوند و هیچ محدودیت جغرافیایی یا نیاز به احراز هویت پیچیده وجود ندارد. کافی‌ست یک کیف پول رمزارزی داشته باشید؛ باقی مسیر را در ادامه‌ی همین صفحه، دقیق و ساده توضیح داده‌ایم.'}
          </p>
        </section>

        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? '/images/send-gift-iran-crypto/en/02-global-delivery-map.webp'
              : '/images/send-gift-iran-crypto/fa/02-global-delivery-map.webp'}
            alt={isEn ? 'Send gifts to Iran from the USA, Europe, Canada, Australia, and the UK' : 'ارسال هدیه به ایران از آمریکا، اروپا، کانادا، استرالیا و انگلیس'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Wherever you live, sending a crypto-paid gift to Iran takes just minutes' : 'هر کجای دنیا باشید، ارسال هدیه با رمزارز به ایران فقط چند دقیقه طول می‌کشد'}
          </figcaption>
        </figure>

        {/* Country sections */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEn ? 'Send a Gift to Iran From Your Country' : 'ارسال هدیه به ایران از کشور شما'}
          </h2>

          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {isEn ? 'Buy and Send a Gift From the USA to Iran With Cryptocurrency' : 'خرید و ارسال هدیه از آمریکا به ایران با ارز دیجیتال'}
          </h3>
          <p className="text-gray-700 leading-8 text-justify mb-8">
            {isEn
              ? 'Iranians living anywhere in the United States can place an order for a gift or cash for their family in Iran and pay with Tether, Bitcoin, or Solana. Simply set up a crypto wallet (such as Coinbase Wallet, Trust Wallet, or any US-based exchange), place your order on Soughat.shop, and send the crypto to the wallet address provided to you. The gift or cash reaches the recipient in Iran in under an hour.'
              : 'ایرانیان مقیم آمریکا می‌توانند از هر ایالتی، سفارش هدیه یا پول نقد برای خانواده در ایران ثبت کنند و هزینه را با تتر، بیت‌کوین یا سولانا پرداخت کنند. کافی‌ست کیف پول رمزارزی خود (مثل Coinbase Wallet، Trust Wallet یا هر صرافی آمریکایی) را آماده کنید، سفارش خود را در سوغات شاپ ثبت کنید و رمزارز را به آدرس کیف پولی که در اختیارتان قرار می‌گیرد ارسال کنید. هدیه یا پول نقد در کمتر از یک ساعت به دست گیرنده در ایران می‌رسد.'}
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {isEn ? 'Buy and Send a Gift From Europe to Iran With Cryptocurrency' : 'خرید و ارسال هدیه از اروپا به ایران با ارز دیجیتال'}
          </h3>
          <p className="text-gray-700 leading-8 text-justify mb-8">
            {isEn
              ? 'From Germany, France, the Netherlands, Sweden, or anywhere else in Europe, sending a gift to Iran with crypto is just as simple. Trusted European exchanges like Binance, Kraken, or Bitvavo let you buy Tether and Bitcoin with euros. Then, with that same crypto, you place an order for a gift, souvenir, or gold coin for your family in Iran — no international bank wire and no heavy traditional exchange fees involved.'
              : 'از آلمان، فرانسه، هلند، سوئد یا هر کشور دیگر اروپا، ارسال هدیه به ایران با کریپتو دقیقاً به همین سادگی است. صرافی‌های اروپایی معتبر مثل Binance، Kraken یا Bitvavo امکان خرید تتر و بیت‌کوین با یورو را فراهم می‌کنند. سپس با همان رمزارز، سفارش هدیه، سوغات یا سکه طلا برای خانواده‌تان در ایران ثبت می‌کنید؛ بدون نیاز به حواله بانکی بین‌المللی و بدون کارمزدهای سنگین صرافی‌های سنتی.'}
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {isEn ? 'Send a Gift From Australia to Iran With Cryptocurrency' : 'ارسال هدیه از استرالیا به ایران با ارز دیجیتال'}
          </h3>
          <p className="text-gray-700 leading-8 text-justify mb-8">
            {isEn
              ? 'Iranians living in Sydney, Melbourne, Brisbane, and other Australian cities can also buy crypto with confidence (from exchanges such as CoinSpot or Binance Australia) and immediately place a gift or cash order for their loved ones in Iran. Geographic distance has zero impact on blockchain transaction speed — whether you order from Sydney or Tehran, confirmation happens just as fast.'
              : 'ایرانیان مقیم سیدنی، ملبورن، بریزبن و دیگر شهرهای استرالیا هم می‌توانند با خیال راحت رمزارز بخرند (از صرافی‌هایی مثل CoinSpot یا Binance Australia) و همان لحظه سفارش هدیه یا پول نقد برای عزیزان خود در ایران ثبت کنند. فاصله‌ی جغرافیایی روی سرعت تراکنش‌های بلاک‌چین هیچ تاثیری ندارد؛ چه از سیدنی سفارش دهید چه از تهران، تایید تراکنش به همان سرعت انجام می‌شود.'}
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {isEn ? 'Send a Gift and Money From Canada to Iran With Cryptocurrency' : 'ارسال هدیه و پول از کانادا به ایران با ارز دیجیتال'}
          </h3>
          <p className="text-gray-700 leading-8 text-justify mb-8">
            {isEn
              ? 'Canada, from Toronto and Vancouver to Montreal, is home to a large Iranian community that looks for a fast way to send a gift or cash to Iran every year for holidays and special occasions. By buying Tether or Bitcoin from Canadian exchanges and paying with it on Soughat.shop, your order is processed and delivered within minutes.'
              : 'در کانادا، از تورنتو و ونکوور گرفته تا مونترال، جامعه بزرگی از ایرانیان زندگی می‌کنند که هر ساله برای اعیاد و مناسبت‌های مختلف به دنبال راهی سریع برای ارسال هدیه یا پول نقد به ایران هستند. با خرید تتر یا بیت‌کوین از صرافی‌های کانادایی و پرداخت آن در سوغات شاپ، سفارش شما ظرف چند دقیقه پردازش شده و تحویل داده می‌شود.'}
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {isEn ? 'Send a Gift and Souvenir From the UK to Iran and Pay With Cryptocurrency' : 'ارسال هدیه و سوغاتی از انگلیس به ایران و پرداخت با ارز دیجیتال'}
          </h3>
          <p className="text-gray-700 leading-8 text-justify">
            {isEn
              ? 'From London to Manchester, Iranians living in the UK can send a gift or souvenir to their family in Iran without needing an Iranian bank card or a complicated wire transfer. Buy Tether or Bitcoin with pounds from exchanges like Binance UK or Coinbase, then use it to pay for your order on Soughat.shop.'
              : 'از لندن تا منچستر، ایرانیان مقیم انگلیس نیز می‌توانند بدون نیاز به کارت بانکی ایرانی یا حواله‌ی پیچیده، هدیه و سوغاتی برای خانواده‌شان در ایران بفرستند. با پوند خریداری‌شده از صرافی‌هایی مثل Binance UK یا Coinbase، تتر یا بیت‌کوین تهیه کرده و آن را برای پرداخت سفارش خود در سوغات شاپ استفاده کنید.'}
          </p>
        </section>

        {/* Mid-page CTA banner #1 */}
        <div className="mb-12 bg-gradient-to-l from-indigo-700 to-blue-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5 text-white shadow-lg">
          <div className="flex items-center gap-3 text-center md:text-start">
            <Zap className="h-8 w-8 text-yellow-300 flex-shrink-0 hidden md:block" />
            <p className="font-bold text-lg leading-7">
              {isEn
                ? 'Ready to send a gift to your family in Iran? It only takes a few minutes.'
                : 'آماده‌اید هدیه‌ای برای خانواده در ایران ارسال کنید؟ فقط چند دقیقه زمان می‌برد.'}
            </p>
          </div>
          <Link
            href={CTA_LINK}
            className="flex-shrink-0 inline-flex items-center bg-white text-blue-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
          >
            {isEn ? 'Browse Gifts' : 'مشاهده هدیه‌ها'}
            <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180 ml-2' : 'mr-2'}`} />
          </Link>
        </div>

        {/* Which crypto */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'Which Cryptocurrency Is Best for Sending a Gift to Iran?' : 'کدام رمزارز برای ارسال هدیه به ایران بهتر است؟'}
          </h2>
          <p className="text-gray-700 leading-8 text-justify mb-6">
            {isEn
              ? 'If you are new to crypto and not sure what to buy, this guide will help:'
              : 'اگر تازه‌کار هستید و نمی‌دانید کدام رمزارز را بخرید، این راهنما کمکتان می‌کند:'}
          </p>
          <div className="space-y-4">
            <p className="text-gray-700 leading-8 text-justify">
              {isEn ? (
                <>
                  <strong>Tether (USDT) — our main recommendation.</strong> Tether is a stablecoin, meaning its
                  value is always pegged to one US dollar and does not fluctuate. This means the amount you buy
                  today keeps the same value tomorrow. For sending a gift or money to Iran, Tether on the{' '}
                  <strong>TRC20 (Tron)</strong> network is the best choice, since its network fee is usually under
                  one dollar and transactions confirm within minutes.
                </>
              ) : (
                <>
                  <strong>تتر (USDT) — پیشنهاد اصلی ما.</strong> تتر یک استیبل‌کوین است، یعنی ارزش آن همیشه معادل یک
                  دلار آمریکاست و نوسان قیمتی ندارد. این یعنی مبلغی که امروز خرید می‌کنید، فردا هم همان ارزش را
                  دارد. برای ارسال هدیه یا پول به ایران، تتر روی شبکه‌ی <strong>TRC20 (ترون)</strong> بهترین انتخاب
                  است؛ چون کارمزد شبکه آن معمولاً زیر یک دلار است و تراکنش در چند دقیقه تایید می‌شود.
                </>
              )}
            </p>
            <p className="text-gray-700 leading-8 text-justify">
              {isEn ? (
                <>
                  <strong>Bitcoin (BTC).</strong> If you already hold Bitcoin, there is no need to convert it —
                  Soughat.shop accepts direct Bitcoin payments too. Just keep in mind that Bitcoin&apos;s value
                  fluctuates, so the final amount is calculated based on the exchange rate at the moment your
                  transaction confirms.
                </>
              ) : (
                <>
                  <strong>بیت‌کوین (BTC).</strong> اگر از قبل بیت‌کوین دارید، نیازی به تبدیل آن نیست؛ سوغات شاپ
                  پرداخت مستقیم با بیت‌کوین را هم می‌پذیرد. فقط توجه کنید که ارزش بیت‌کوین نوسان دارد، پس مبلغ
                  نهایی بر اساس نرخ لحظه‌ی تایید تراکنش محاسبه می‌شود.
                </>
              )}
            </p>
            <p className="text-gray-700 leading-8 text-justify">
              {isEn ? (
                <>
                  <strong>Solana (SOL).</strong> For those looking for speed and very low fees, Solana is an
                  excellent option; its transactions typically confirm within seconds.
                </>
              ) : (
                <>
                  <strong>سولانا (SOL).</strong> برای کسانی که به دنبال سرعت و کارمزد بسیار پایین هستند، سولانا
                  گزینه‌ی خوبی است؛ تراکنش‌های آن معمولاً در چند ثانیه تایید می‌شوند.
                </>
              )}
            </p>
            <p className="text-gray-700 leading-8 text-justify">
              {isEn ? (
                <>
                  <strong>Bottom line:</strong> if you are unsure where to start, Tether on the TRC20 network is
                  the safest and simplest path.
                </>
              ) : (
                <>
                  <strong>جمع‌بندی:</strong> اگر مطمئن نیستید از کجا شروع کنید، تتر روی شبکه TRC20 امن‌ترین و
                  ساده‌ترین مسیر برای شروع است.
                </>
              )}
            </p>
          </div>
        </section>

        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? '/images/send-gift-iran-crypto/en/03-crypto-wallet-setup.webp'
              : '/images/send-gift-iran-crypto/fa/03-crypto-wallet-setup.webp'}
            alt={isEn ? 'Create a crypto wallet to send a gift to Iran' : 'ساخت کیف پول رمزارزی برای ارسال هدیه به ایران'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Setting up a crypto wallet takes only a few minutes' : 'ساخت کیف پول رمزارزی فقط چند دقیقه طول می‌کشد'}
          </figcaption>
        </figure>

        {/* Step by step guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn
              ? 'A Complete Step-by-Step Guide for Beginners: From Zero to Sending Your First Gift to Iran'
              : 'راهنمای کامل قدم‌به‌قدم برای تازه‌واردها: از صفر تا ارسال هدیه به ایران'}
          </h2>
          <p className="text-gray-700 leading-8 text-justify mb-8">
            {isEn
              ? 'If you have never worked with crypto before, do not worry. We will walk you through this process slowly and precisely, one step at a time.'
              : 'اگر تا امروز هیچ‌وقت با رمزارز کار نکرده‌اید، نگران نباشید. این مسیر را دقیق، آهسته و قدم‌به‌قدم برایتان توضیح می‌دهیم.'}
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
                {isEn ? 'Choose a Reputable Exchange' : 'انتخاب یک صرافی معتبر'}
              </h3>
              <p className="text-gray-700 leading-8 text-justify mb-4">
                {isEn
                  ? 'The first thing you need is an account with a trusted crypto exchange. This is where you buy crypto using your local currency (USD, EUR, GBP, CAD, or AUD). Some of the most well-known global exchanges operating in the USA, Europe, Canada, Australia, and the UK include:'
                  : 'اولین کار این است که یک حساب در یک صرافی رمزارز معتبر بسازید. صرافی همان جایی است که با پول رایج کشورتان (دلار، یورو، پوند، دلار کانادا یا استرالیا) رمزارز می‌خرید. برخی از شناخته‌شده‌ترین صرافی‌های جهانی که در کشورهای آمریکا، اروپا، کانادا، استرالیا و انگلیس فعالیت می‌کنند عبارت‌اند از:'}
              </p>
              <ul className="space-y-2 list-disc pr-6 leading-7 text-gray-700 mb-4">
                {isEn ? (
                  <>
                    <li><strong>Binance</strong> — the world&apos;s largest exchange, with broad country support</li>
                    <li><strong>Coinbase</strong> — simple and beginner-friendly, popular in the US and Europe</li>
                    <li><strong>Kraken</strong> — one of the oldest and most trusted exchanges</li>
                    <li><strong>Bybit / KuCoin</strong> — popular options with competitive fees</li>
                  </>
                ) : (
                  <>
                    <li><strong>Binance</strong> — بزرگ‌ترین صرافی جهان، پشتیبانی گسترده از کشورهای مختلف</li>
                    <li><strong>Coinbase</strong> — ساده و مناسب کاربران تازه‌کار، محبوب در آمریکا و اروپا</li>
                    <li><strong>Kraken</strong> — یکی از قدیمی‌ترین و معتبرترین صرافی‌ها</li>
                    <li><strong>Bybit / KuCoin</strong> — گزینه‌های محبوب با کارمزد رقابتی</li>
                  </>
                )}
              </ul>
              <p className="text-gray-700 leading-8 text-justify">
                {isEn ? 'Signing up usually only requires an email address and phone number.' : 'ثبت‌نام معمولاً فقط با ایمیل و شماره موبایل انجام می‌شود.'}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
                {isEn ? 'Create or Activate Your Crypto Wallet' : 'ساخت یا فعال‌سازی کیف پول رمزارزی'}
              </h3>
              <p className="text-gray-700 leading-8 text-justify">
                {isEn ? (
                  <>
                    After signing up with an exchange, a &quot;wallet&quot; is automatically created for you — this
                    is where your crypto is held. If you would prefer a separate, more personal wallet, you can
                    install an app like <strong>Trust Wallet</strong> or <strong>MetaMask</strong> on your phone;
                    setup is free and takes just a few minutes. Important note: write down your wallet&apos;s
                    recovery phrase (seed phrase) somewhere safe and offline, and never share it with anyone.
                  </>
                ) : (
                  <>
                    بعد از ثبت‌نام در صرافی، یک «کیف پول» به‌صورت خودکار برایتان ساخته می‌شود؛ همان‌جایی که
                    رمزارزهایتان نگهداری می‌شود. اگر ترجیح می‌دهید کیف پول جداگانه و شخصی‌تر داشته باشید، می‌توانید
                    اپلیکیشن‌هایی مثل <strong>Trust Wallet</strong> یا <strong>MetaMask</strong> را روی گوشی خود
                    نصب کنید؛ نصب و ساخت آن‌ها رایگان است و فقط چند دقیقه طول می‌کشد. نکته‌ی مهم: عبارت بازیابی
                    (Recovery Phrase یا Seed Phrase) کیف پول خود را در جایی امن و آفلاین یادداشت کنید و هرگز آن را
                    با کسی به اشتراک نگذارید.
                  </>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">3</span>
                {isEn ? 'Buy Crypto' : 'خرید رمزارز'}
              </h3>
              <p className="text-gray-700 leading-8 text-justify">
                {isEn
                  ? 'Inside your exchange account, tap "Buy Crypto," select Tether (USDT), and purchase the amount you need using a bank card, bank transfer, or your country\u2019s local payment method. Buy the exact amount you need for your order on Soughat.shop, plus a small extra amount to cover the network fee.'
                  : 'داخل حساب صرافی خود، گزینه «خرید» یا «Buy Crypto» را بزنید، تتر (USDT) را انتخاب کنید و با کارت بانکی، حواله بانکی یا روش‌های پرداخت محلی کشورتان، مبلغ مدنظر را خریداری کنید. همان مبلغی که برای هدیه یا سفارش خود در ایران نیاز دارید بخرید (به‌علاوه‌ی مقدار کمی برای کارمزد شبکه).'}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">4</span>
                {isEn ? 'Place Your Order on Soughat.shop' : 'ثبت سفارش در سوغات شاپ'}
              </h3>
              <p className="text-gray-700 leading-8 text-justify">
                {isEn ? (
                  <>
                    Now visit Soughat.shop and choose the product you want — a{' '}
                    <Link href="/products?category=gift-packs" className="text-blue-600 font-bold underline hover:text-blue-700">gift</Link>,{' '}
                    a souvenir, a{' '}
                    <Link href="/products?category=gold-and-money" className="text-blue-600 font-bold underline hover:text-blue-700">gold coin</Link>,{' '}
                    or{' '}
                    <Link href="/products/send-money-cash-iran-remittance-card-to-card" className="text-blue-600 font-bold underline hover:text-blue-700">cash</Link>.
                    Enter the recipient&apos;s details in Iran (name, phone number, address, or bank card number)
                    and submit your order.
                  </>
                ) : (
                  <>
                    حالا وارد سایت سوغات شاپ شوید و محصول مدنظرتان (
                    <Link href="/products?category=gift-packs" className="text-blue-600 font-bold underline hover:text-blue-700">هدیه</Link>،
                    سوغات،{' '}
                    <Link href="/products?category=gold-and-money" className="text-blue-600 font-bold underline hover:text-blue-700">سکه طلا</Link>{' '}
                    یا{' '}
                    <Link href="/products/send-money-cash-iran-remittance-card-to-card" className="text-blue-600 font-bold underline hover:text-blue-700">پول نقد</Link>
                    ) را انتخاب کنید. اطلاعات گیرنده در ایران (نام، شماره تماس، آدرس یا شماره کارت بانکی) را وارد
                    کرده و سفارش را ثبت کنید.
                  </>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">5</span>
                {isEn ? 'Get the Wallet Address and Send Your Crypto' : 'دریافت آدرس کیف پول و ارسال رمزارز'}
              </h3>
              <p className="text-gray-700 leading-8 text-justify mb-4">
                {isEn ? (
                  <>
                    Once your order is placed, you will receive a destination wallet address. Go back to your
                    exchange or wallet app, select &quot;Send&quot; or &quot;Withdraw,&quot; carefully copy and
                    paste the address provided (never type it manually), and choose the correct network (for
                    Tether, that is the <strong>TRC20</strong> network). Enter the amount and confirm the
                    transaction.
                  </>
                ) : (
                  <>
                    بعد از ثبت سفارش، یک آدرس کیف پول (Wallet Address) در اختیار شما قرار می‌گیرد. به حساب صرافی یا
                    کیف پول خودتان برگردید، گزینه «ارسال» یا «Send/Withdraw» را انتخاب کنید، آدرس داده‌شده را با
                    دقت کپی و پیست کنید (هرگز آن را دستی تایپ نکنید) و شبکه‌ی درست (برای تتر، شبکه‌ی{' '}
                    <strong>TRC20</strong>) را انتخاب کنید. مبلغ را وارد کرده و تراکنش را تایید کنید.
                  </>
                )}
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 leading-7">
                {isEn
                  ? '⚠️ Critical tip: before confirming, always double-check the first and last few characters of the wallet address against what is shown on the site, and make sure you have selected the correct network.'
                  : '⚠️ نکته‌ی حیاتی: پیش از تایید نهایی، همیشه چند رقم اول و آخر آدرس کیف پول را با آنچه در سایت به شما نمایش داده شده مقایسه کنید و مطمئن شوید شبکه (Network) انتخابی درست است.'}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">6</span>
                {isEn ? 'Transaction Confirmation and Gift Delivery' : 'تایید تراکنش و تحویل هدیه'}
              </h3>
              <p className="text-gray-700 leading-8 text-justify">
                {isEn
                  ? 'Your transaction is recorded on the blockchain and confirmed within minutes. As soon as it is confirmed, the Soughat.shop team processes your order, and the gift, souvenir, or cash reaches the recipient in Iran in under an hour. A delivery photo or receipt is also sent to you via WhatsApp or Telegram.'
                  : 'تراکنش شما روی شبکه بلاک‌چین ثبت و طی چند دقیقه تایید می‌شود. به محض تایید، تیم سوغات شاپ سفارش را پردازش کرده و هدیه، سوغات یا پول نقد ظرف کمتر از یک ساعت به دست گیرنده در ایران می‌رسد. عکس یا رسید تحویل نیز برای شما در واتس‌اپ یا تلگرام ارسال می‌شود.'}
              </p>
            </div>
          </div>
        </section>

        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? '/images/send-gift-iran-crypto/en/04-buy-cryptocurrency.webp'
              : '/images/send-gift-iran-crypto/fa/04-buy-cryptocurrency.webp'}
            alt={isEn ? 'Buy Tether, Bitcoin, or Solana to send a gift to Iran' : 'خرید تتر، بیت‌کوین یا سولانا برای ارسال هدیه به ایران'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Buying crypto takes only a few minutes with a bank card' : 'خرید رمزارز با کارت بانکی فقط چند دقیقه طول می‌کشد'}
          </figcaption>
        </figure>

        {/* Fees */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'How Much Does It Cost to Send a Gift to Iran With Crypto?' : 'کارمزد ارسال هدیه به ایران با رمزارز چقدر است؟'}
          </h2>
          <p className="text-gray-700 leading-8 text-justify">
            {isEn
              ? 'Unlike traditional bank transfers with hidden and high fees, sending crypto only involves a "blockchain network fee," which for Tether on the TRC20 network is usually under one dollar. Soughat.shop does not charge any additional hidden fee for accepting your crypto payment.'
              : 'بر خلاف حواله‌های بانکی سنتی که کارمزدهای پنهان و بالا دارند، کارمزد ارسال با رمزارز تنها شامل «کارمزد شبکه بلاک‌چین» می‌شود که برای تتر روی شبکه TRC20 معمولاً زیر یک دلار است. سوغات شاپ هیچ کارمزد پنهان اضافه‌ای برای دریافت پرداخت کریپتویی از شما دریافت نمی‌کند.'}
          </p>
        </section>

        {/* Security */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'Security and Peace of Mind' : 'امنیت و اطمینان خاطر'}
          </h2>
          <p className="text-gray-700 leading-8 text-justify mb-4">
            {isEn
              ? 'We know the world of crypto still feels new and a little intimidating to many people. That is why:'
              : 'می‌دانیم دنیای رمزارز برای خیلی‌ها هنوز جدید و کمی نگران‌کننده است. به همین دلیل:'}
          </p>
          <ul className="space-y-3 list-disc pr-6 leading-7 text-gray-700">
            {isEn ? (
              <>
                <li>You do not need to complete any identity verification (KYC) or upload documents to place an order on Soughat.shop.</li>
                <li>For every order, you receive a delivery photo or receipt straight to your door.</li>
                <li>If anything goes wrong or delivery fails, you get a 100% refund in crypto, guaranteed.</li>
                <li>24/7 support is available, covering every time zone in the world.</li>
                <li>Blockchain transactions are transparent, tamper-proof, and always traceable.</li>
              </>
            ) : (
              <>
                <li>نیازی به احراز هویت (KYC) یا آپلود مدارک شناسایی برای ثبت سفارش در سوغات شاپ ندارید.</li>
                <li>برای هر سفارش، عکس یا رسید تحویل درب منزل برای شما ارسال می‌شود.</li>
                <li>در صورت هرگونه مشکل یا عدم تحویل، بازگشت ۱۰۰٪ وجه به‌صورت کریپتویی تضمین شده است.</li>
                <li>پشتیبانی ۲۴ ساعته و هماهنگ با تمام تایم‌زون‌های جهان در دسترس شماست.</li>
                <li>تراکنش‌های بلاک‌چین شفاف، غیرقابل دستکاری و همیشه قابل رهگیری هستند.</li>
              </>
            )}
          </ul>
        </section>

        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? '/images/send-gift-iran-crypto/en/05-secure-delivery-trust.webp'
              : '/images/send-gift-iran-crypto/fa/05-secure-delivery-trust.webp'}
            alt={isEn ? 'Secure crypto payment and guaranteed gift delivery in Iran' : 'پرداخت امن با رمزارز و تحویل تضمینی هدیه در ایران'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Every order comes with a delivery photo and a 100% refund guarantee' : 'هر سفارش با عکس تحویل و ضمانت بازگشت ۱۰۰٪ وجه همراه است'}
          </figcaption>
        </figure>

        {/* Popular gift categories — internal linking hub */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'What Can You Send as a Gift to Iran?' : 'چه چیزی می‌توانید به عنوان هدیه به ایران بفرستید؟'}
          </h2>
          <p className="text-gray-700 leading-8 text-justify mb-6">
            {isEn ? (
              <>
                Besides cash and gold, Soughat.shop offers a wide range of ready-to-send gift categories — from a{' '}
                <Link href="/products/girls-teddy-bear-gift-box" className="text-blue-600 font-bold underline hover:text-blue-700">teddy bear gift box</Link>{' '}
                and a{' '}
                <Link href="/products/leather-bag-saffron-gift-10g" className="text-blue-600 font-bold underline hover:text-blue-700">premium saffron gift set</Link>{' '}
                to a{' '}
                <Link href="/products/amazing-chocolate-gift-collection-30pcs" className="text-blue-600 font-bold underline hover:text-blue-700">luxury chocolate collection</Link>. Every product below can be paid for with Tether,
                Bitcoin, or Solana, exactly like the gold and cash products described on this page.
              </>
            ) : (
              <>
                علاوه بر پول نقد و طلا، سوغات شاپ طیف وسیعی از دسته‌بندی‌های هدیه آماده را ارائه می‌دهد؛ از{' '}
                <Link href="/products/girls-teddy-bear-gift-box" className="text-blue-600 font-bold underline hover:text-blue-700">باکس هدیه تدی</Link>{' '}
                و{' '}
                <Link href="/products/leather-bag-saffron-gift-10g" className="text-blue-600 font-bold underline hover:text-blue-700">پک هدیه زعفران سرگل</Link>{' '}
                گرفته تا{' '}
                <Link href="/products/amazing-chocolate-gift-collection-30pcs" className="text-blue-600 font-bold underline hover:text-blue-700">کلکسیون لوکس شکلات</Link>. تمام محصولات زیر، دقیقاً مثل محصولات طلا و پول نقد این صفحه، با تتر، بیت‌کوین یا
                سولانا قابل پرداخت هستند.
              </>
            )}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center text-center gap-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-2xl p-4 transition-colors"
              >
                <img src={cat.icon} alt={isEn ? cat.nameEn : cat.nameFa} className="h-14 w-14 object-contain" />
                <span className="text-sm font-bold text-gray-800">{isEn ? cat.nameEn : cat.nameFa}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Related pages */}
        <section className="mb-12">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              {isEn ? 'Related Guides' : 'صفحات مرتبط'}
            </h2>
            <ul className="space-y-2 leading-7">
              <li>
                <Link href="/send-money-to-iran" className="text-blue-600 font-bold underline hover:text-blue-700">
                  {isEn ? 'Send Money to Iran with Crypto & Tether' : 'ارسال پول به ایران با کریپتو و تتر'}
                </Link>
              </li>
              <li>
                <Link href="/crypto-guide" className="text-blue-600 font-bold underline hover:text-blue-700">
                  {isEn ? 'Crypto Payment Guide' : 'راهنمای پرداخت با رمزارز'}
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* Mid-page CTA banner #2 */}
        <div className="mb-16 border-2 border-blue-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3 text-center md:text-start">
            <ShieldCheck className="h-8 w-8 text-blue-600 flex-shrink-0 hidden md:block" />
            <p className="font-bold text-lg text-gray-900 leading-7">
              {isEn
                ? 'Secure, blockchain-verified payments — your gift is delivered in under an hour.'
                : 'پرداخت امن و تأییدشده روی بلاک‌چین — هدیه‌ی شما در کمتر از یک ساعت تحویل داده می‌شود.'}
            </p>
          </div>
          <Link
            href={CTA_LINK}
            className="flex-shrink-0 inline-flex items-center bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
          >
            {isEn ? 'Send a Gift Securely' : 'ارسال امن هدیه'}
            <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180 ml-2' : 'mr-2'}`} />
          </Link>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center border-b pb-4">
            {isEn ? 'Frequently Asked Questions About Sending a Gift to Iran With Crypto' : 'سوالات متداول درباره ارسال هدیه به ایران با رمزارز'}
          </h2>
          <p className="text-gray-600 text-center mb-8 leading-7">
            {isEn
              ? 'In this section, we answer the most common questions from our users about buying crypto, creating a wallet, and sending a gift to Iran.'
              : 'در این بخش، به پرتکرارترین سوالات کاربران درباره خرید رمزارز، ساخت کیف پول و ارسال هدیه به ایران پاسخ داده‌ایم.'}
          </p>
          <div className="space-y-3">
            {faqList.map((item, idx) => (
              <details key={idx} className="group bg-gray-50 hover:bg-white rounded-xl p-5 border border-gray-100 transition-colors open:bg-white open:shadow-sm">
                <summary className="cursor-pointer font-bold text-gray-800 flex items-start gap-2 list-none">
                  <span className="text-blue-600 flex-shrink-0">{idx + 1}.</span>
                  <span>{item.q}</span>
                </summary>
                <p className="text-gray-600 mt-3 leading-7 text-justify">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div className="mt-16 bg-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
          <Coins className="h-12 w-12 mx-auto mb-4 text-green-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {isEn ? 'Send Your First Crypto-Paid Gift Today' : 'همین حالا اولین هدیه خود را با رمزارز ارسال کنید'}
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            {isEn
              ? 'Pay with Tether, Bitcoin, or Solana and get your gift or money to your loved ones in Iran in under an hour.'
              : 'با تتر، بیت‌کوین یا سولانا پرداخت کنید و هدیه یا پول خود را در کمتر از یک ساعت به دست عزیزانتان در ایران برسانید.'}
          </p>
          <Link
            href={CTA_LINK}
            className="inline-flex items-center bg-white text-blue-700 font-bold py-4 px-10 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            {isEn ? 'View Products' : 'مشاهده محصولات'}
            <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180 ml-2' : 'mr-2'}`} />
          </Link>
        </div>

      </div>
    </div>
  );
}