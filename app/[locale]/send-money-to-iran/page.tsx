import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { CheckCircle, ArrowLeft, Send, Zap } from 'lucide-react';

// لینک صفحه‌ی محصولات (ارسال پول / طلا) — همون مقصدی که دکمه‌های CTA به اون میرن
const CTA_LINK = '/products?category=gold-and-money';

// =========================================================================
// این فایل باید دقیقاً در مسیر زیر قرار بگیرد (پوشه‌ها را با همین اسم بساز):
// app/[locale]/send-money-to-iran/page.tsx
// =========================================================================

type FaqItem = { q: React.ReactNode; a: React.ReactNode };

const faqFa: FaqItem[] = [
  { q: 'آیا میتونم به ایران پول بفرستم با کریپتو؟', a: 'بله، سرویس سوغات شاپ این امکان رو به شما میده که به راحتی و با سرعت بالا خیلی سریع پول رو ارسال کنید.' },
  { q: 'آیا میتونم برای خانواده در ایران پول بزنم و با تتر پرداخت کنم؟', a: 'بله، soughat.shop به شما این قدرت رو میده که بتونید پرداخت رو با کریپتو یا تتر انجام بدید و در همون ساعت پول رو به دست خانواده می‌رسونه.' },
  {
    q: 'آیا پرداخت به کارت بانکی در ایران میسره از کانادا؟',
    a: (
      <>
        بله، سرویس سوغات شاپ به شما این امکان رو میده که خیلی راحت با خرید محصول{' '}
        <Link href="/products/send-money-cash-iran-remittance-card-to-card" className="text-blue-600 font-bold underline hover:text-blue-700">
          پول نقد ارسال به ایران
        </Link>{' '}
        سفارش خودتون رو ثبت کنید، با کریپتو یا رمز ارز سفارش رو پرداخت کنید و در همون ساعت پول به کارت بانکی گیرنده میرسه.
      </>
    ),
  },
  { q: 'مدت زمان طول می‌کشد تا پول به کارت بانکی در ایران واریز شود؟', a: 'پس از اینکه پرداخت تتر شما در شبکه بلاکچین تأیید شد (معمولاً بین ۵ تا ۱۰ دقیقه بسته به شبکه انتخابی مانند TRC20)، مبلغ ریالی بلافاصله و در کمتر از یک ساعت به کارت بانکی گیرنده در ایران واریز می‌شود.' },
  { q: 'آیا برای استفاده از این سرویس باید احراز هویت (KYC) انجام دهم؟', a: 'خیر. یکی از مزایای اصلی سوغات شاپ احترام به حریم خصوصی کاربران است. شما نیازی به آپلود مدارک هویتی ندارید. تنها چیزی که نیاز دارید یک کیف پول دیجیتال حاوی تتر و اطلاعات کارت بانکی گیرنده در ایران است.' },
  { q: 'کارمزد شبکه برای ارسال تتر به چه صورت است؟', a: 'کارمزد شبکه بسته به بلاکچینی که انتخاب می‌کنید متفاوت است. پیشنهاد ما استفاده از شبکه TRC20 (ترون) برای انتقال تتر است، زیرا کارمزد آن بسیار ناچیز (کمتر از ۱ دلار) و سرعت تراکنش آن بسیار بالا است.' },
  {
    q: 'آیا می‌توانم علاوه بر پول نقد، سکه طلا هم بفرستم؟',
    a: (
      <>
        بله، شما می‌توانید از طریق دسته بندی{' '}
        <Link href="/products?category=gold-and-money" className="text-blue-600 font-bold underline hover:text-blue-700">
          طلا و پول ارسال به ایران
        </Link>
        ، انواع سکه‌های طلا شامل یک گرمی، ربع، نیم و تمام را با پرداخت تتر خریداری کرده و برای خانواده خود در ایران ارسال کنید.
      </>
    ),
  },
  { q: 'نرخ تبدیل تتر به ریال در سوغات شاپ چگونه محاسبه می‌شود؟', a: 'ما نرخ تبدیل را بر اساس نرخ روز بازار آزاد ایران و با بیشترین ارزش ممکن برای مشتریانمان تنظیم می‌کنیم. نرخ نهایی پیش از پرداخت در صفحه محصول به شما نمایش داده می‌شود تا با اطمینان کامل خرید خود را نهایی کنید.' },
  { q: 'آیا سرویس شما از اروپا و انگلیس هم پشتیبانی می‌کند؟', a: 'بله، سوغات شاپ یک پلتفرم جهانی است. شما می‌توانید از هر کشوری در جهان (آمریکا، کانادا، اروپا، استرالیا، انگلیس و...) به راحتی با استفاده از رمز ارز تتر، پول یا هدیه خود را به ایران ارسال کنید.' },
  { q: 'اگر اشتباه در شماره کارت گیرنده وارد کنم چه می‌شود؟', a: 'ما پیش از واریز نهایی، اطلاعات را به دقت بررسی می‌کنیم. اما مسئولیت وارد کردن صحیح اطلاعات بر عهده خریدار است. لطفاً پیش از ثبت نهایی سفارش، شماره کارت و نام گیرنده را مجدداً چک کنید.' },
  { q: 'آیا برای ارسال سکه طلا، محصول فیزیکی برای گیرنده ارسال می‌شود؟', a: 'بله، در صورت خرید طلا، سکه‌های فیزیکی استاندارد و باکیفیت از طریق پست پیشتاز یا تیپاکس به آدرس گیرنده در سراسر ایران ارسال می‌شوند. کد رهگیری پستی نیز برای شما ارسال خواهد شد.' },
  { q: 'تفاوت ارسال پول با کریپتو و حواله بانکی چیست؟', a: 'حواله‌های بانکی معمولاً محدودیت‌های سخت‌گیرانه، کارمزدهای بالا و زمان انتقال چند روزه تا چند هفته‌ای دارند. اما ارسال با کریپتو در چند دقیقه انجام می‌شود، بدون محدودیت جغرافیایی است و کارمزد آن بسیار پایین‌تر است.' },
  { q: 'آیا می‌توانم بیت‌کوین یا اتریوم به جای تتر بفرستم؟', a: 'در حال حاضر تمرکز ما بر تتر (USDT) به دلیل ثبات قیمت آن است. اما در صورت تمایل به پرداخت با ارزهای دیگر مانند بیت‌کوین، می‌توانید با پشتیبانی سایت تماس بگیرید تا راهنمایی شما را ارائه دهند.' },
  { q: 'آیا اطلاعات تراکنش‌های من نزد شما محفوظ می‌ماند؟', a: 'بله، امنیت اطلاعات شما برای ما در بالاترین اولویت قرار دارد. ما هیچ‌گونه اطلاعات شخصی اضافی از شما درخواست نمی‌کنیم و تراکنش‌های کریپتویی به صورت غیرمتمرکز انجام می‌شوند.' },
  {
    q: (
      <>
        برای خرید{' '}
        <Link href="/products/quarter-gold-coin-send-iran" className="text-blue-600 font-bold underline hover:text-blue-700">
          سکه ربع ارسال به ایران
        </Link>{' '}
        چقدر تتر نیاز دارم؟
      </>
    ),
    a: 'قیمت سکه ربع به نرخ روز طلا در ایران بستگی دارد. هنگام انتخاب محصول در سایت، قیمت به دلار (تتر) به صورت خودکار محاسبه و به شما نمایش داده می‌شود.',
  },
  { q: 'آیا امکان کنسل کردن سفارش و بازگشت وجه وجود دارد؟', a: 'اگر تراکنش کریپتویی شما هنوز تأیید نشده و وجه ریالی به حساب گیرنده واریز نکرده ایم، امکان کنسلی وجود دارد. اما پس از واریز وجه به کارت بانکی ایرانی، تراکنش غیرقابل بازگشت است.' },
  { q: 'چگونه می‌توانم با پشتیبانی سوغات شاپ ارتباط برقرار کنم؟', a: 'شما می‌توانید از طریق بخش تماس با ما در وب‌سایت، تلگرام یا واتس‌اپ با تیم پشتیبانی سریع و پاسخگوی ما در ارتباط باشید.' },
  { q: 'آیا برای ارسال پول از انگلیس به ایران محدودیتی وجود دارد؟', a: 'خیر، با استفاده از ارزهای دیجیتال هیچ محدودیتی از سوی سوغات شاپ برای مقصد یا مبدأ وجود ندارد. شما می‌توانید از انگلیس، اسکاتلند یا هر نقطه دیگری سفارش خود را ثبت کنید.' },
  { q: 'آیا سکه‌های شما ضرب سال جاری و استاندارد هستند؟', a: 'بله، تمامی سکه‌های طلا (یک گرمی، ربع، نیم و تمام) از جنس طلای ۱۸ عیار و ضرب سال جاری مرکز مبادله هستند و دارای ارزش سرمایه‌گذاری و هدایایی بالا می‌باشند.' },
  { q: 'اگر شبکه بلاکچین شلوغ باشد چه اتفاقی می‌افتد؟', a: 'در صورت شلوغی شبکه، تأیید تراکنش ممکن است کمی طول بکشد. ما شبکه TRC20 را پیشنهاد می‌دهیم که معمولاً کمترین میزان شلوغی و بالاترین سرعت را دارد.' },
  { q: 'آیا برای نوروز یا اعیاد خاص تخفیفی روی کارمزدها وجود دارد؟', a: 'سوغات شاپ در مناسبت‌های مختلف، کمپین‌ها و تخفیفاتی را برای کاربران خود در نظر می‌گیرد. برای اطلاع از این پیشنهادها، خبرنامه ما را دنبال کنید.' },
  {
    q: (
      <>
        تفاوت خرید{' '}
        <Link href="/products/send-gold-coin-1g-iran-fast" className="text-blue-600 font-bold underline hover:text-blue-700">
          سکه یک گرمی ارسال به ایران
        </Link>{' '}
        با پول نقد چیست؟
      </>
    ),
    a: 'ارسال پول نقد به صورت ریالی به کارت بانکی واریز می‌شود، در حالی که در خرید سکه یک گرمی، یک محصول فیزیکی با ارزش (طلا) به آدرس پستی گیرنده ارسال می‌گردد.',
  },
  { q: 'آیا برای خریدهای بالای ۱۰۰۰۰ دلار محدودیتی هست؟', a: 'خیر، هیچ محدودیتی برای مبلغ حواله وجود ندارد. اما برای مبالغ بسیار بالا، پیشنهاد می‌شود ابتدا با پشتیبانی هماهنگ کنید تا بهترین نرخ و سریعترین پرداخت را تضمین کنیم.' },
  { q: 'آیا گیرنده در ایران باید بداند پول از طریق کریپتو ارسال شده است؟', a: 'خیر، گیرنده تنها متوجه واریز ریالی به حساب بانکی خود یا دریافت بسته پستی طلا خواهد شد. نیازی نیست گیرنده دانشی درباره ارزهای دیجیتال داشته باشد.' },
  { q: 'بهترین کیف پول برای ارسال تتر به سوغات شاپ چیست؟', a: 'شما می‌توانید از هر کیف پولی که از توکن‌های شبکه TRC20 پشتیبانی می‌کند استفاده کنید. تراست ولت (Trust Wallet)، متامسک (MetaMask)، بایننس (Binance) و کیف پول‌های صرافی‌های معتبر گزینه‌های مناسبی هستند.' },
  {
    q: (
      <>
        چرا برای{' '}
        <Link href="/products/half-gold-coin-gift-iran" className="text-blue-600 font-bold underline hover:text-blue-700">
          سکه نیم ارسال به ایران
        </Link>{' '}
        باید از سوغات شاپ استفاده کنم؟
      </>
    ),
    a: 'چون ما خرید را با کریپتو ممکن می‌کنیم، بهترین نرخ تبدیل را ارائه می‌دهیم و سکه را مستقیماً و با بسته‌بندی امن به دست خانواده شما در ایران می‌رسانیم.',
  },
  { q: 'آیا واریز در روزهای تعطیل هم انجام می‌شود؟', a: 'بله، بزرگترین مزیت استفاده از کریپتو این است که شبکه بلاکچین ۲۴ ساعته و ۷ روز هفته فعال است. واریز به کارت‌های بانکی ایرانی نیز در روزهای تعطیل از طریق اتوماسیون بانکی انجام می‌پذیرد (ممکن است کمی تاخیر در واریز شبانه وجود داشته باشد).' },
  { q: 'آیا می‌توانم برای چند نفر به طور همزمان پول ارسال کنم؟', a: 'بله، کافیست برای هر شخص یک سفارش جداگانه در سایت ثبت کنید تا اطلاعات و کارمزدها به درستی برای هر گیرنده پردازش شوند.' },
  { q: 'در صورت قطعی اینترنت بین‌المللی در ایران چه می‌شود؟', a: 'تراکنش‌های کریپتویی در سطح بلاکچین جهانی انجام می‌شوند و وابسته به اینترنت داخلی ایران نیستند. تیم ما خارج از محدودیت‌های داخلی عمل می‌کند و پرداخت‌ها به صورت ریالی به حساب گیرندگان واریز می‌گردد.' },
  { q: 'چگونه می‌توانم از صحت و اعتبار سایت سوغات شاپ مطمئن شوم؟', a: 'سوغات شاپ با شفافیت کامل عمل می‌کند. ما تاریخچه تراکنش‌های موفق، نظرات مشتریان و پشتیبانی ۲۴ ساعته را ارائه می‌دهیم. می‌توانید برای اطمینان ابتدا با مبالغ کمتر آزمایش کنید.' },
];

const faqEn: FaqItem[] = [
  { q: 'Can I send money to Iran using crypto?', a: 'Yes, the Soughat.shop service provides you with the ability to easily and very quickly send money at high speed.' },
  { q: 'Can I send money to my family in Iran and pay with Tether?', a: 'Yes, soughat.shop gives you the power to make payments with crypto or Tether and delivers the money to your family within the same hour.' },
  {
    q: 'Is it possible to pay to an Iranian bank card from Canada?',
    a: (
      <>
        Yes, the Soughat.shop service allows you to easily place your order by purchasing the{' '}
        <Link href="/products/send-money-cash-iran-remittance-card-to-card" className="text-blue-600 font-bold underline hover:text-blue-700">
          Cash Remittance Card to Card Send to Iran
        </Link>{' '}
        product, pay for the order with crypto or digital currency, and the money will reach the recipient's bank card within the same hour.
      </>
    ),
  },
  { q: 'How long does it take for the money to be deposited into an Iranian bank card?', a: 'Once your Tether payment is confirmed on the blockchain network (usually between 5 to 10 minutes depending on the chosen network like TRC20), the Rial amount is immediately deposited into the recipient\u2019s bank card in Iran in less than an hour.' },
  { q: 'Do I need to complete a KYC (Know Your Customer) verification to use this service?', a: 'No. One of the main advantages of Soughat.shop is respecting users\u2019 privacy. You do not need to upload identity documents. All you need is a digital wallet containing Tether and the recipient\u2019s bank card information in Iran.' },
  { q: 'How much is the network fee for sending Tether?', a: 'The network fee varies depending on the blockchain you choose. We highly recommend using the TRC20 (Tron) network for transferring Tether, as its fee is negligible (less than $1) and its transaction speed is extremely high.' },
  {
    q: 'Can I send gold coins in addition to cash?',
    a: (
      <>
        Yes, through the{' '}
        <Link href="/products?category=gold-and-money" className="text-blue-600 font-bold underline hover:text-blue-700">
          Gold and Money Send to Iran
        </Link>{' '}
        category, you can purchase various gold coins, including 1-gram, quarter, half, and full, by paying with Tether and send them to your family in Iran.
      </>
    ),
  },
  { q: 'How is the Tether to Rial exchange rate calculated at Soughat.shop?', a: 'We set the conversion rate based on the daily free market rate in Iran, offering the best possible value for our customers. The final rate is displayed on the product page before payment, so you can complete your purchase with full confidence.' },
  { q: 'Does your service support transfers from Europe and the UK?', a: 'Yes, Soughat.shop is a global platform. You can easily send your money or gifts to Iran using Tether cryptocurrency from anywhere in the world (USA, Canada, Europe, Australia, UK, etc.).' },
  { q: 'What happens if I enter the wrong recipient card number?', a: 'We carefully verify information before making the final deposit. However, the responsibility for entering correct information lies with the buyer. Please double-check the card number and recipient\u2019s name before finalizing the order.' },
  { q: 'For sending gold coins, is a physical product shipped to the recipient?', a: 'Yes, upon purchasing gold, standard and high-quality physical coins are shipped to the recipient\u2019s address anywhere in Iran via fast post or Tipax. The postal tracking code will also be provided to you.' },
  { q: 'What is the difference between sending money with crypto and a bank transfer?', a: 'Bank transfers usually have strict restrictions, high fees, and transfer times ranging from a few days to weeks. Crypto transfers are done in minutes, have no geographical restrictions, and incur much lower fees.' },
  { q: 'Can I send Bitcoin or Ethereum instead of Tether?', a: 'Currently, our focus is on Tether (USDT) due to its price stability. However, if you wish to pay with other cryptocurrencies like Bitcoin, please contact our support team for guidance.' },
  { q: 'Is my transaction information kept secure with you?', a: 'Yes, your information security is our top priority. We do not request any extra personal information from you, and crypto transactions are conducted in a decentralized manner.' },
  {
    q: (
      <>
        How much Tether do I need to buy the{' '}
        <Link href="/products/quarter-gold-coin-send-iran" className="text-blue-600 font-bold underline hover:text-blue-700">
          Quarter Gold Coin Send to Iran
        </Link>
        ?
      </>
    ),
    a: 'The price of a quarter coin depends on the daily gold rate in Iran. When selecting the product on the site, the price is automatically calculated and displayed in dollars (Tether) for you.',
  },
  { q: 'Is it possible to cancel an order and get a refund?', a: 'If your crypto transaction has not yet been confirmed and we have not deposited the Rial amount to the recipient, cancellation is possible. However, once the funds are deposited into an Iranian bank card, the transaction is irreversible.' },
  { q: 'How can I contact Soughat.shop support?', a: 'You can reach out to our responsive support team via the "Contact Us" section on the website, Telegram, or WhatsApp.' },
  { q: 'Are there any restrictions for sending money from the UK to Iran?', a: 'No, by using cryptocurrencies, Soughat.shop imposes no restrictions on destinations or origins. You can register your order from the UK, Scotland, or anywhere else.' },
  { q: 'Are your gold coins minted in the current year and standard?', a: 'Yes, all gold coins (1-gram, quarter, half, and full) are made of 18-karat gold and minted in the current year by the Iran Central Bank\u2019s exchange center, holding high investment and gifting value.' },
  { q: 'What happens if the blockchain network is congested?', a: 'In case of network congestion, transaction confirmation might take slightly longer. We recommend the TRC20 network, which typically experiences the least congestion and the highest speed.' },
  { q: 'Are there any discounts on fees for special occasions like Nowruz?', a: 'Soughat.shop offers various campaigns and discounts for its users on different occasions. Follow our newsletter to stay updated on these offers.' },
  {
    q: (
      <>
        What is the difference between buying the{' '}
        <Link href="/products/send-gold-coin-1g-iran-fast" className="text-blue-600 font-bold underline hover:text-blue-700">
          1g Gold Coin Send to Iran
        </Link>{' '}
        and sending cash?
      </>
    ),
    a: 'Sending cash involves depositing Rials into a bank card, whereas purchasing a 1-gram gold coin involves shipping a valuable physical product (gold) to the recipient\u2019s postal address.',
  },
  { q: 'Is there a limit for purchases over $10,000?', a: 'No, there is no limit to the remittance amount. However, for very large amounts, we recommend coordinating with support first to ensure the best rate and fastest processing.' },
  { q: 'Does the recipient in Iran need to know that the money was sent via crypto?', a: 'No, the recipient will only notice a Rial deposit to their bank account or receive a physical gold package. They do not need to have any knowledge about cryptocurrencies.' },
  { q: 'What is the best wallet for sending Tether to Soughat.shop?', a: 'You can use any wallet that supports TRC20 network tokens. Trust Wallet, MetaMask, Binance, and wallets from reputable exchanges are excellent choices.' },
  {
    q: (
      <>
        Why should I use Soughat.shop for the{' '}
        <Link href="/products/half-gold-coin-gift-iran" className="text-blue-600 font-bold underline hover:text-blue-700">
          Half Gold Coin Send to Iran
        </Link>
        ?
      </>
    ),
    a: 'Because we make purchasing possible with crypto, offer the best conversion rates, and deliver the coin directly and with secure packaging to your family in Iran.',
  },
  { q: 'Are deposits made on holidays as well?', a: 'Yes, the greatest advantage of using crypto is that the blockchain network is active 24/7. Deposits to Iranian bank cards are also processed on holidays via banking automation (though there might be a slight delay for overnight deposits).' },
  { q: 'Can I send money to multiple people simultaneously?', a: 'Yes, simply place a separate order for each person on the site so that the details and fees are processed correctly for each recipient.' },
  { q: 'What happens if the international internet is shut down in Iran?', a: 'Crypto transactions occur on a global blockchain level and are not dependent on Iran\u2019s domestic internet. Our team operates outside domestic restrictions, and payments are deposited as Rials into recipients\u2019 accounts.' },
  { q: 'How can I be sure of the authenticity and reliability of Soughat.shop?', a: 'Soughat.shop operates with full transparency. We provide a history of successful transactions, customer reviews, and 24/7 support. You can start by testing with smaller amounts for your peace of mind.' },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';
  const isEn = locale === 'en';

  const title = isEn
    ? 'Send Money & Gifts to Iran with Crypto/Tether (USDT) | Soughat.shop'
    : 'ارسال پول و هدیه به ایران با کریپتو و تتر | سوغات شاپ';

  const description = isEn
    ? 'Send money to Iran, send cash to Iran, and transfer funds instantly using Crypto and Tether (USDT) from USA, Canada, Europe, and Australia. Fast, secure remittance to Iranian bank cards.'
    : 'ارسال پول به ایران، ارسال پول نقد ایران و حواله پول به ایران با کریپتو و تتر از آمریکا، کانادا، اروپا و استرالیا. سریع، امن و در همان ساعت به کارت بانکی گیرنده واریز می‌شود.';

  const ogImage = isEn
    ? 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290601977-518.webp'
    : 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290565150-834.webp';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/send-money-to-iran`,
      languages: {
        fa: `${siteUrl}/fa/send-money-to-iran`,
        en: `${siteUrl}/en/send-money-to-iran`,
        'x-default': `${siteUrl}/fa/send-money-to-iran`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/send-money-to-iran`,
      locale: isEn ? 'en_US' : 'fa_IR',
      type: 'article',
      images: [{ url: ogImage }],
    },
  };
}

export default async function SendMoneyToIranPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const faqList = isEn ? faqEn : faqFa;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((item) => ({
      '@type': 'Question',
      name: typeof item.q === 'string' ? item.q : '',
      acceptedAnswer: {
        '@type': 'Answer',
        text: typeof item.a === 'string' ? item.a : '',
      },
    })).filter((item) => item.name),
  };

  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {isEn
              ? 'Send Money to Iran with Crypto & Tether: The Ultimate Remittance & Gift Solution'
              : 'ارسال پول به ایران با کریپتو و تتر: سریع‌ترین راه برای حواله وجه و هدایای نقدی'}
          </h1>
          <p className="text-blue-100 text-lg leading-8 max-w-3xl mx-auto text-justify">
            {isEn ? (
              <>
                Being far from your homeland and loved ones always presents unique challenges. One of the biggest
                concerns for Iranians living abroad (in the USA, Canada, Europe, Australia, and the UK) is how to
                send money quickly and securely to their families back in Iran. Traditional money transfer methods
                are often slow, expensive, and fraught with restrictions. However, with the advent of
                cryptocurrencies, the landscape has completely changed. The <strong>Soughat.shop</strong> service
                allows you to bypass banking hurdles and use crypto (like Tether or USDT) to deposit funds directly
                into your family&apos;s Iranian bank account in the shortest possible time.
              </>
            ) : (
              <>
                دور بودن از وطن و خانواده همیشه چالش‌های خاص خود را دارد. یکی از بزرگترین دغدغه‌های ایرانیان مقیم
                خارج (اعم از آمریکا، کانادا، اروپا، استرالیا و انگلیس)، نحوه ارسال سریع و امن پول به عزیزانشان در
                ایران است. روش‌های سنتی حواله پول معمولاً زمان‌بر، پرهزینه و پر از محدودیت هستند. اما با پیدایش
                ارزهای دیجیتال، مسیر کاملاً تغییر کرده است. سرویس <strong>سوغات شاپ</strong> به شما این امکان را
                می‌دهد که بدون دردسرهای بانکی و با استفاده از کریپتو (مانند تتر یا USDT)، در کمترین زمان ممکن وجه را
                به حساب بانکی خانواده‌تان در ایران واریز کنید.
              </>
            )}
          </p>

          {/* Hero CTA button — دکمه‌ی اصلی داخل بنر */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href={CTA_LINK}
              className="inline-flex items-center bg-white text-blue-800 font-bold text-lg py-4 px-10 rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
            >
              {isEn ? 'Send Money Now' : 'ارسال پول همین حالا'}
              <Send className={`h-5 w-5 ${isEn ? 'ml-2' : 'mr-2'}`} />
            </Link>
            <span className="text-blue-200 text-sm">
              {isEn ? 'Pay with Tether · Delivered in under 1 hour' : 'پرداخت با تتر · واریز در کمتر از ۱ ساعت'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating quick-access button — همیشه روی صفحه دیده میشه، هر جا اسکرول کنی */}
      <Link
        href={CTA_LINK}
        className={`inline-flex fixed bottom-5 ${isEn ? 'right-5' : 'left-5'} z-50 items-center gap-2 bg-blue-600 text-white font-bold py-3 px-5 md:py-4 md:px-6 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-105 transition-all`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
        </span>
        {isEn ? 'Send Money' : 'ارسال پول'}
      </Link>

      <div className="container mx-auto px-4 py-12 max-w-4xl">

        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290601977-518.webp'
              : 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290565150-834.webp'}
            alt={isEn ? 'Send money to Iran with crypto and Tether from abroad' : 'ارسال پول به ایران با کریپتو و تتر از خارج از کشور'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Instant and secure crypto remittance to Iran using USDT' : 'حواله پول به ایران با کریپتو و تتر به صورت آنی و امن'}
          </figcaption>
        </figure>

        {/* Why crypto */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'Why is Sending Money to Iran with Crypto the Best Choice?' : 'چرا ارسال پول به ایران با کریپتو بهترین انتخاب است؟'}
          </h2>
          {isEn ? (
            <>
              <p className="text-gray-700 leading-8 text-justify mb-4">
                In today&apos;s world, sending funds to Iran through international banking systems is highly
                problematic due to sanctions. Many global money transfer platforms have halted their services to
                Iran or charge exorbitant fees. Here, <strong>sending money to Iran with crypto</strong> emerges as
                a lifesaver. Tether (USDT), as a stablecoin pegged to the US Dollar, eliminates the volatility of
                the crypto market, meaning you know exactly how much you are sending, and the recipient receives
                the exact equivalent in Rials.
              </p>
              <p className="text-gray-700 leading-8 text-justify">
                Soughat.shop acts as a bridge between the decentralized finance (DeFi) world and Iran&apos;s
                domestic banking system. By paying with Tether, you not only experience seamless{' '}
                <strong>cash remittance to Iran</strong>, but you can also send valuable gifts like gold coins for
                various occasions. We facilitate the Tether-to-Rial conversion process in the simplest and fastest
                manner possible.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-700 leading-8 text-justify mb-4">
                در دنیای امروز، ارسال وجه به ایران از طریق سیستم‌های بانکی بین‌المللی به دلیل تحریم‌ها با مشکلات
                فراوانی روبرو است. بسیاری از پلتفرم‌های انتقال وجه، خدمات خود به ایران را متوقف کرده‌اند یا
                کارمزدهای بسیار بالایی دریافت می‌کنند. در اینجا، <strong>حواله پول به ایران با کریپتو</strong> به
                عنوان یک راهکار ناجی ظاهر می‌شود. تتر (USDT) به عنوان یک استیبل‌کوین وابسته به دلار، نوسانات بازار
                رمزارزها را ندارد و ارزش آن ثابت است. این یعنی شما دقیقاً می‌دانید چقدر ارسال می‌کنید و گیرنده
                دقیقاً معادل آن را به ریال دریافت می‌کند.
              </p>
              <p className="text-gray-700 leading-8 text-justify">
                سوغات شاپ پلی است میان دنیای دیفای (DeFi) و سیستم بانکی داخلی ایران. شما با پرداخت تتر، نه تنها{' '}
                <strong>ارسال پول نقد ایران</strong> را تجربه می‌کنید، بلکه می‌توانید هدایای ارزشمندی مانند سکه طلا
                را نیز برای مناسبت‌های مختلف ارسال کنید. ما فرآیند تبدیل تتر به ریال را به ساده‌ترین شکل ممکن و در
                سریع‌ترین زمان انجام می‌دهیم.
              </p>
            </>
          )}
        </section>

        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290597150-788.webp'
              : 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290568702-338.webp'}
            alt={isEn ? 'Convert Tether USDT to Iranian Rial at Soughat shop' : 'تبدیل تتر به ریال ایران در سوغات شاپ'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Instant conversion of Tether (USDT) to Rials and deposit to Iranian bank cards' : 'تبدیل آنی تتر (USDT) به ریال و واریز به کارت بانکی ایرانی'}
          </figcaption>
        </figure>

        {/* USA/Canada section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'Sending Money from the USA and Canada to Iran: Borderless and Limitless' : 'ارسال پول از آمریکا و کانادا به ایران: بدون مرز و محدودیت'}
          </h2>
          {isEn ? (
            <>
              <p className="text-gray-700 leading-8 text-justify mb-4">
                If you live in the United States or Canada, you are undoubtedly familiar with the strict banking
                limitations regarding <strong>sending money from the USA to Iran</strong> and{' '}
                <strong>sending money from Canada to Iran</strong>. Soughat.shop breaks these borders. You can
                easily send Tether from your digital wallet (Trust Wallet, MetaMask, Binance, etc.) to our wallet,
                and in return, the Rial equivalent will be deposited into your family&apos;s Shetab-network bank
                card within the same hour.
              </p>
              <p className="text-gray-700 leading-8 text-justify">
                To <strong>send funds to Iran</strong> via our service, simply select the cash remittance product.
                By purchasing the{' '}
                <Link href="/products/send-money-cash-iran-remittance-card-to-card" className="text-blue-600 font-bold underline hover:text-blue-700">
                  Cash Remittance Card to Card Send to Iran
                </Link>{' '}
                product, place your order, receive the destination USDT wallet address, and complete the crypto
                payment. Our system verifies the payment automatically and manually, depositing the amount in
                Rials directly to the recipient.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-700 leading-8 text-justify mb-4">
                اگر در ایالات متحده آمریکا یا کانادا زندگی می‌کنید، قطعاً با محدودیت‌های سخت‌گیرانه بانکی برای{' '}
                <strong>ارسال پول از آمریکا به ایران</strong> و <strong>ارسال پول از کانادا به ایران</strong> آشنا
                هستید. سوغات شاپ این مرزها را می‌شکند. شما به راحتی می‌توانید از طریق کیف پول دیجیتال خود (تراست
                ولت، متامسک، بایننس و غیره) تتر را به کیف پول ما ارسال کنید و در مقابل، معادل ریالی آن در همان
                ساعت به کارت بانکی عضو شتاب خانواده‌تان واریز شود.
              </p>
              <p className="text-gray-700 leading-8 text-justify">
                برای <strong>ارسال وجه به ایران</strong> از طریق سرویس ما، کافیست محصول مربوط به حواله نقدی را
                انتخاب کنید. با خرید محصول{' '}
                <Link href="/products/send-money-cash-iran-remittance-card-to-card" className="text-blue-600 font-bold underline hover:text-blue-700">
                  پول نقد ارسال به ایران
                </Link>
                ، سفارش خود را ثبت نموده، آدرس کیف پول مقصد را دریافت کنید و پرداخت کریپتویی را انجام دهید. سیستم
                ما به صورت خودکار و دستی پرداخت را تأیید کرده و مبلغ را به ریال واریز می‌کند.
              </p>
            </>
          )}
        </section>

        {/* Mid-page CTA banner #1 */}
        <div className="mb-12 bg-gradient-to-l from-indigo-700 to-blue-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5 text-white shadow-lg">
          <div className="flex items-center gap-3 text-center md:text-start">
            <Zap className="h-8 w-8 text-yellow-300 flex-shrink-0 hidden md:block" />
            <p className="font-bold text-lg leading-7">
              {isEn
                ? 'Ready to send money to your family in Iran? It only takes a few minutes.'
                : 'آماده‌اید پول خود را برای خانواده در ایران ارسال کنید؟ فقط چند دقیقه زمان می‌برد.'}
            </p>
          </div>
          <Link
            href={CTA_LINK}
            className="flex-shrink-0 inline-flex items-center bg-white text-blue-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
          >
            {isEn ? 'Start Your Transfer' : 'شروع ارسال پول'}
            <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180 ml-2' : 'mr-2'}`} />
          </Link>
        </div>

        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290587480-830.webp'
              : 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290576931-505.webp'}
            alt={isEn ? 'Global remittance from USA and Canada to Iran for family' : 'ارسال پول از آمریکا و کانادا به ایران برای خانواده'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Global remittance services to Iran from Canada, USA, and Europe' : 'خدمات حواله جهانی به ایران از کانادا، آمریکا و اروپا'}
          </figcaption>
        </figure>

        {/* Gold coins */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'Sending Gold and Coins as Gifts to Iran' : 'ارسال طلا و سکه به عنوان هدیه به ایران'}
          </h2>
          <p className="text-gray-700 leading-8 text-justify mb-6">
            {isEn ? (
              <>
                Sometimes sending cash isn&apos;t enough; perhaps you want to send a lasting gift for occasions
                like weddings, Nowruz (Persian New Year), birthdays, or anniversaries. In Iranian culture, gold
                coins have always been the ultimate gift. At Soughat.shop, we enable you to purchase and send
                physical gold coins directly using Tether. You can view and select gold and money options
                simultaneously through our{' '}
                <Link href="/products?category=gold-and-money" className="text-blue-600 font-bold underline hover:text-blue-700">
                  Gold and Money Send to Iran
                </Link>{' '}
                category.
              </>
            ) : (
              <>
                گاهی اوقات ارسال پول نقد کافی نیست؛ شاید بخواهید برای عزیزانتان در مناسبت‌هایی مانند عروسی، نوروز،
                ولادت یا سالگرد هدیه‌ای ماندگار بفرستید. در فرهنگ ایرانی، سکه طلا همیشه بهترین هدیه بوده است. ما در
                سوغات شاپ، امکان خرید و ارسال مستقیم سکه‌های طلا با پرداخت تتر را فراهم کرده‌ایم. شما می‌توانید طلا
                و پول را همزمان از طریق{' '}
                <Link href="/products?category=gold-and-money" className="text-blue-600 font-bold underline hover:text-blue-700">
                  طلا و پول ارسال به ایران
                </Link>{' '}
                مشاهده و انتخاب کنید.
              </>
            )}
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {isEn ? 'Types of Gold Coins Available for Sending to Iran' : 'انواع سکه و طلا برای ارسال به ایران'}
          </h3>
          <p className="text-gray-700 leading-8 text-justify mb-4">
            {isEn ? 'We offer various types of gold coins to suit any budget:' : 'ما انواع مختلفی از سکه‌های طلا را برای ارسال ارائه می‌دهیم تا با هر بودجه‌ای متناسب باشد:'}
          </p>
          <ul className="space-y-3 list-disc pr-6 leading-7 text-gray-700">
            {isEn ? (
              <>
                <li>
                  <strong>1 Gram Gold Coin:</strong> Ideal for small, memorable gifts. By purchasing the{' '}
                  <Link href="/products/send-gold-coin-1g-iran-fast" className="text-blue-600 font-bold underline hover:text-blue-700">
                    1g Gold Coin Send to Iran
                  </Link>{' '}
                  product, you can send a delicate and valuable present.
                </li>
                <li>
                  <strong>Quarter Gold Coin:</strong> A classic choice for medium-sized gifts. Choose the{' '}
                  <Link href="/products/quarter-gold-coin-send-iran" className="text-blue-600 font-bold underline hover:text-blue-700">
                    Quarter Gold Coin Send to Iran
                  </Link>{' '}
                  to express your love to your family.
                </li>
                <li>
                  <strong>Half Gold Coin:</strong> For special occasions and higher-value gifts. Buying the{' '}
                  <Link href="/products/half-gold-coin-gift-iran" className="text-blue-600 font-bold underline hover:text-blue-700">
                    Half Gold Coin Send to Iran
                  </Link>{' '}
                  is always a safe and appreciated choice.
                </li>
                <li>
                  <strong>Full Gold Coin:</strong> The best option for grand gifts like dowries. By purchasing the{' '}
                  <Link href="/products/full-gold-coin-8133g-standard" className="text-blue-600 font-bold underline hover:text-blue-700">
                    Full Gold Coin Send to Iran
                  </Link>
                  , you offer a flawless and standard gift to your loved ones.
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong>سکه یک گرمی:</strong> ایده‌آل برای هدایای کوچک و یادبودی. شما می‌توانید با خرید محصول{' '}
                  <Link href="/products/send-gold-coin-1g-iran-fast" className="text-blue-600 font-bold underline hover:text-blue-700">
                    سکه یک گرمی ارسال به ایران
                  </Link>{' '}
                  یک هدیه ظریف و ارزشمند ارسال کنید.
                </li>
                <li>
                  <strong>سکه ربع:</strong> یک انتخاب کلاسیک برای هدایای متوسط. با انتخاب{' '}
                  <Link href="/products/quarter-gold-coin-send-iran" className="text-blue-600 font-bold underline hover:text-blue-700">
                    سکه ربع ارسال به ایران
                  </Link>
                  ، عشق خود را به خانواده تقدیم کنید.
                </li>
                <li>
                  <strong>سکه نیم:</strong> برای مناسبت‌های خاص و هدایای باارزش‌تر. خرید{' '}
                  <Link href="/products/half-gold-coin-gift-iran" className="text-blue-600 font-bold underline hover:text-blue-700">
                    سکه نیم ارسال به ایران
                  </Link>{' '}
                  همیشه یک انتخاب مطمئن و پسندیده است.
                </li>
                <li>
                  <strong>سکه تمام:</strong> بهترین گزینه برای هدایای بزرگ مانند جهیزیه. با خرید{' '}
                  <Link href="/products/full-gold-coin-8133g-standard" className="text-blue-600 font-bold underline hover:text-blue-700">
                    سکه تمام ارسال به ایران
                  </Link>
                  ، هدیه‌ای بی‌نقص و استاندارد تقدیم عزیزانتان کنید.
                </li>
              </>
            )}
          </ul>
        </section>

        <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290593669-496.webp'
              : 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290572622-385.webp'}
            alt={isEn ? 'Send gold coin gift to Iran with Tether crypto' : 'ارسال سکه طلا به ایران با تتر'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Purchasing and sending all types of gold coins to Iran with crypto payments' : 'خرید و ارسال انواع سکه طلا به ایران با پرداخت کریپتو'}
          </figcaption>
        </figure>

        {/* Security & speed */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEn ? 'Security and Speed in Sending Funds to Iran with Soughat.shop' : 'امنیت و سرعت در ارسال وجه به ایران با سوغات شاپ'}
          </h2>
          <p className="text-gray-700 leading-8 text-justify mb-6">
            {isEn
              ? 'We understand how crucial trust is in financial matters. Our platform is designed to provide the highest level of security for your crypto transactions. Blockchain technology ensures your payments are transparent and irreversible, and our 24/7 support team strives to finalize your money transfer to Iran in the shortest time possible (usually less than an hour). Here is how it works:'
              : 'ما درک می‌کنیم که اعتماد در مسائل مالی چقدر مهم است. پلتفرم ما طوری طراحی شده است که بالاترین سطح امنیت را برای تراکنش‌های کریپتویی شما فراهم کند. فناوری بلاکچین اطمینان می‌دهد که پرداخت‌های شما شفاف و غیرقابل بازگشت هستند و تیم پشتیبانی ما ۲۴ ساعته در تلاش است تا ارسال پول به ایران را در کوتاه‌ترین زمان ممکن (معمولاً کمتر از یک ساعت) نهایی کند. فرآیند کار به این شکل است:'}
          </p>
          <ol className="space-y-2 list-decimal pr-6 leading-7 text-gray-700">
            {isEn ? (
              <>
                <li>Select a product (Cash or Gold Coin) on the website.</li>
                <li>Submit the recipient&apos;s details in Iran (Name, phone number, bank card number, or postal address).</li>
                <li>Receive the USDT wallet address (TRC20 or other networks) from Soughat.shop.</li>
                <li>Transfer Tether from your wallet to ours.</li>
                <li>Confirmation of the transaction on the blockchain network and instant deposit of the amount to the Iranian bank card or physical dispatch of gold.</li>
              </>
            ) : (
              <>
                <li>انتخاب محصول (پول نقد یا سکه طلا) در وب‌سایت.</li>
                <li>ثبت اطلاعات گیرنده در ایران (نام، شماره تماس، شماره کارت بانکی یا آدرس پستی).</li>
                <li>دریافت آدرس کیف پول USDT (TRC20 یا شبکه‌های دیگر) از طرف سوغات شاپ.</li>
                <li>انتقال تتر از کیف پول شما به کیف پول ما.</li>
                <li>تأیید تراکنش در شبکه بلاکچین و واریز فوری مبلغ به کارت بانکی ایرانی یا ارسال فیزیکی طلا.</li>
              </>
            )}
          </ol>
        </section>

        <figure className="mb-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={isEn
              ? 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290583933-610.webp'
              : 'https://hwzowjniahrqdzpnlpas.supabase.co/storage/v1/object/public/media/1783290580363-349.webp'}
            alt={isEn ? 'Secure and fast verified remittance to Iran' : 'پرداخت سریع با کریپتو به ایران'}
            className="w-full h-auto"
          />
          <figcaption className="text-center text-sm text-gray-500 py-3 bg-gray-50">
            {isEn ? 'Fast and highly secure crypto payment process for remittance to Iran' : 'فرآیند پرداخت سریع و امن با تتر برای واریز به ایران'}
          </figcaption>
        </figure>

        {/* Mid-page CTA banner #2 */}
        <div className="mb-16 border-2 border-blue-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3 text-center md:text-start">
            <CheckCircle className="h-8 w-8 text-blue-600 flex-shrink-0 hidden md:block" />
            <p className="font-bold text-lg text-gray-900 leading-7">
              {isEn
                ? 'Secure, blockchain-verified transfers — your family receives the money in under an hour.'
                : 'انتقال امن و تأییدشده روی بلاکچین — خانواده شما در کمتر از یک ساعت پول را دریافت می‌کند.'}
            </p>
          </div>
          <Link
            href={CTA_LINK}
            className="flex-shrink-0 inline-flex items-center bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
          >
            {isEn ? 'Send Money Securely' : 'ارسال امن پول'}
            <ArrowLeft className={`h-5 w-5 ${isEn ? 'rotate-180 ml-2' : 'mr-2'}`} />
          </Link>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center border-b pb-4">
            {isEn ? 'Frequently Asked Questions About Sending Money & Gifts to Iran with Crypto' : 'سوالات متداول درباره ارسال پول و هدیه به ایران با کریپتو'}
          </h2>
          <p className="text-gray-600 text-center mb-8 leading-7">
            {isEn
              ? 'In this section, we answer the most common questions from our users regarding how to send funds, use Tether, and send gold gifts to Iran.'
              : 'در این بخش، به پرتکرارترین سوالات کاربران درباره نحوه ارسال وجه، استفاده از تتر و ارسال هدایای طلا به ایران پاسخ داده‌ایم.'}
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

        {/* CTA */}
        <div className="mt-16 bg-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {isEn ? 'Send Your First Remittance Today' : 'همین حالا اولین حواله خود را ثبت کنید'}
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            {isEn
              ? 'Pay with Tether, Bitcoin, or Solana and get your money or gift to your family in Iran in less than an hour.'
              : 'با پرداخت تتر، بیت‌کوین یا سولانا، در کمتر از یک ساعت پول یا هدیه خود را به دست خانواده‌تان در ایران برسانید.'}
          </p>
          <Link
            href="/products?category=gold-and-money"
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