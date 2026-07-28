// =============================================================================
// موتور قیمت‌گذاری «هدایای سفارشی» (Custom Order Pricing Engine)
// =============================================================================
// ⚠️ این فایل کاملاً جدید و مستقل است و هیچ ارتباطی به موتور قیمت‌گذاریِ
// محصولات فروشگاه (app/admin/pricing/page.tsx و ستون profit_margin در
// site_settings) ندارد. آن سیستم دست‌نخورده باقی می‌ماند؛ این یکی فقط
// برای محاسبه‌ی قیمت پیشنهادیِ «درخواست محصول سفارشی» استفاده می‌شود.
//
// چرا یک درصد سود ثابت (مثلاً همیشه ۲۵٪) برای این بخش مناسب نیست؟
// در این‌جا برخلاف محصولات فروشگاه، بازه‌ی قیمتی محصولات درخواستی توسط
// مشتری می‌تواند از یک جاکلیدی ۲۰۰ هزار تومانی تا یک ساعت یا جواهر چند
// هزار دلاری باشد. سود ۲۵٪ روی یک محصول ارزان معمولاً حتی هزینه‌ی زمان و
// پیگیریِ سفارش را هم پوشش نمی‌دهد، در حالی که همان ۲۵٪ روی یک محصول
// گران، رقمی غیرمنطقی و غیررقابتی می‌شود.
//
// راه‌حل: یک سیستم «پلکانی/مرحله‌ای» دقیقاً مثل مالیات بر درآمد پلکانی —
// هر بخش از قیمت محصول، فقط با نرخ همان پلکان خودش محاسبه می‌شود (نه این‌که
// کل قیمت با یک نرخ واحد ضرب شود). این روش تضمین می‌کند:
//   ۱. با افزایش قیمت محصول، سود نهایی هیچ‌وقت جهش ناگهانی یا کاهش نمی‌کند
//      (بر خلاف یک جدول پلکانیِ ساده که در مرز پلکان‌ها دچار «پرش» می‌شود).
//   ۲. درصد مؤثر سود به‌طور طبیعی و نرم، با گران‌تر شدن محصول کاهش می‌یابد.
//   ۳. یک کف سود مطلق (Minimum Profit Floor) هم داریم تا سفارش‌های خیلی
//      ارزان، حداقل هزینه‌ی پیگیری و پشتیبانی را جبران کنند.
//
// 🔧 برای تغییر نرخ‌ها در آینده، فقط کافیست دو ثابتِ زیر
// (CUSTOM_ORDER_MARGIN_BRACKETS و MIN_PROFIT_FLOOR_USD) را ویرایش کنید؛
// بقیه‌ی فایل نیازی به تغییر ندارد.
// =============================================================================

/** یک پلکان از سیستم سود مرحله‌ای. */
interface MarginBracket {
  /** سقف این پلکان بر حسب دلار (base cost، یعنی قبل از افزودن سود). null یعنی «تا بی‌نهایت». */
  upTo: number | null;
  /** نرخ سود روی همان بخش از قیمت که داخل این پلکان قرار می‌گیرد. */
  rate: number;
}

// جدول پلکانی سود — نرخ‌ها بر اساس «هزینه پایه» (قیمت محصول + ارسال، به دلار) اعمال می‌شوند.
// نکته: پلکان دوم (۵۰ تا ۲۰۰ دلار) عمداً روی همان ۲۵٪ نرخ استاندارد سایت
// تنظیم شده تا برای رایج‌ترین بازه‌ی سفارش‌ها، هیچ حس ناآشنایی با بقیه‌ی
// سایت ایجاد نشود؛ فقط در دو سر طیف (خیلی ارزان / خیلی گران) نرخ تغییر می‌کند.
export const CUSTOM_ORDER_MARGIN_BRACKETS: MarginBracket[] = [
  { upTo: 50, rate: 0.32 },
  { upTo: 200, rate: 0.25 },
  { upTo: 600, rate: 0.19 },
  { upTo: 1500, rate: 0.14 },
  { upTo: null, rate: 0.10 },
];

// حداقل سود مطلق (به دلار) برای هر سفارش، صرف‌نظر از قیمت محصول — تضمین
// می‌کند سفارش‌های خیلی کوچک هم حداقل هزینه‌ی پیگیری/پشتیبانی را جبران کنند.
export const MIN_PROFIT_FLOOR_USD = 7;

// اگر یک روز ردیف‌های site_settings زیر در دیتابیس موجود نبودند، این
// مقادیر پیش‌فرض جایگزین می‌شوند تا ماشین‌حساب همچنان کار کند.
export const FALLBACK_DOLLAR_RATE_TOMAN = 170_700;
export const FALLBACK_SHIPPING_TOMAN = 750_000;

export interface CustomOrderPricingInput {
  /** قیمتی که مشتری در فروشگاه دیگر دیده و به تومان وارد کرده. */
  customerPriceToman: number;
  /** نرخ روز دلار به تومان (از site_settings.dollar_rate خوانده می‌شود). */
  dollarRateToman: number;
  /** هزینه ثابت ارسال بین‌المللی به تومان (از site_settings.custom_order_shipping_toman). */
  shippingToman: number;
}

export interface MarginBracketBreakdown {
  from: number;
  to: number | null;
  rate: number;
  amountInBracket: number;
  profitFromBracket: number;
}

export interface CustomOrderPricingResult {
  /** قیمت محصول به دلار (بدون ارسال و بدون سود). */
  productCostUsd: number;
  /** هزینه ارسال به دلار. */
  shippingCostUsd: number;
  /** جمع قیمت محصول + ارسال، قبل از افزودن سود. */
  baseCostUsd: number;
  /** سود محاسبه‌شده از جدول پلکانی، قبل از اعمال کف حداقلی. */
  marginalProfitUsd: number;
  /** آیا کف حداقل سود (MIN_PROFIT_FLOOR_USD) اعمال شده است؟ */
  flooredApplied: boolean;
  /** سود نهایی (بعد از اعمال کف حداقلی در صورت نیاز). */
  profitUsd: number;
  /** قیمت نهایی قابل پرداخت به دلار. */
  finalPriceUsd: number;
  /** درصد مؤثر سود نسبت به هزینه پایه، صرفاً برای نمایش شفاف به مشتری. */
  effectiveMarginPercent: number;
  /** ریز محاسبه‌ی هر پلکان، برای نمایش در بخش «این قیمت چطور محاسبه شد؟». */
  brackets: MarginBracketBreakdown[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * محاسبه‌ی سود پلکانی روی یک «هزینه پایه» به دلار (مثل مالیات پلکانی).
 */
function calculateTieredMargin(baseCostUsd: number): {
  marginalProfitUsd: number;
  brackets: MarginBracketBreakdown[];
} {
  let remaining = baseCostUsd;
  let lowerBound = 0;
  let totalProfit = 0;
  const brackets: MarginBracketBreakdown[] = [];

  for (const bracket of CUSTOM_ORDER_MARGIN_BRACKETS) {
    if (remaining <= 0) break;

    const bracketSize = bracket.upTo === null ? remaining : bracket.upTo - lowerBound;
    const amountInBracket = Math.min(remaining, bracketSize);

    if (amountInBracket > 0) {
      const profitFromBracket = amountInBracket * bracket.rate;
      totalProfit += profitFromBracket;
      brackets.push({
        from: lowerBound,
        to: bracket.upTo,
        rate: bracket.rate,
        amountInBracket: round2(amountInBracket),
        profitFromBracket: round2(profitFromBracket),
      });
    }

    remaining -= amountInBracket;
    lowerBound = bracket.upTo === null ? lowerBound : bracket.upTo;
  }

  return { marginalProfitUsd: totalProfit, brackets };
}

/**
 * تابع اصلی: قیمت تومانیِ وارد‌شده توسط مشتری را می‌گیرد و قیمت نهاییِ
 * قابل‌پرداخت (به دلار/تتر) را به همراه ریز محاسبات شفاف برمی‌گرداند.
 */
export function calculateCustomOrderPrice({
  customerPriceToman,
  dollarRateToman,
  shippingToman,
}: CustomOrderPricingInput): CustomOrderPricingResult {
  const safeDollarRate = dollarRateToman > 0 ? dollarRateToman : FALLBACK_DOLLAR_RATE_TOMAN;
  const safePrice = Math.max(0, customerPriceToman || 0);
  const safeShipping = Math.max(0, shippingToman ?? FALLBACK_SHIPPING_TOMAN);

  const productCostUsd = safePrice / safeDollarRate;
  const shippingCostUsd = safeShipping / safeDollarRate;
  const baseCostUsd = productCostUsd + shippingCostUsd;

  const { marginalProfitUsd, brackets } = calculateTieredMargin(baseCostUsd);

  const flooredApplied = safePrice > 0 && marginalProfitUsd < MIN_PROFIT_FLOOR_USD;
  const profitUsd = safePrice > 0 ? Math.max(marginalProfitUsd, MIN_PROFIT_FLOOR_USD) : 0;

  const finalPriceUsd = baseCostUsd + profitUsd;
  const effectiveMarginPercent = baseCostUsd > 0 ? (profitUsd / baseCostUsd) * 100 : 0;

  return {
    productCostUsd: round2(productCostUsd),
    shippingCostUsd: round2(shippingCostUsd),
    baseCostUsd: round2(baseCostUsd),
    marginalProfitUsd: round2(marginalProfitUsd),
    flooredApplied,
    profitUsd: round2(profitUsd),
    finalPriceUsd: round2(finalPriceUsd),
    effectiveMarginPercent: round2(effectiveMarginPercent),
    brackets,
  };
}