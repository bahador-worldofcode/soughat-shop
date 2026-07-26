import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// =============================================================
// مسیر عمومیِ نرخ‌ها — برای مصرفِ هاب ابزارها (tools.soughat.shop)
// =============================================================
// این مسیر عمداً از کلاینتِ عمومیِ Supabase (همان `supabase` که
// کامپوننتِ MarketRates هم در صفحه‌ی اصلی ازش استفاده می‌کند)
// می‌خواند، هرگز از `supabaseAdmin`. یعنی هیچ کلید مخفی/سرویسی
// اینجا درگیر نیست — دقیقاً همان سطح دسترسیِ یک بازدیدکننده‌ی
// عادیِ سایت.

// در Next.js 15 (برخلاف نسخه‌ی ۱۴)، مسیرهای GET به‌صورت پیش‌فرض
// کش نمی‌شوند — حتی اگر revalidate را ست کرده باشید. باید صریحاً
// با force-static اعلام کنیم که این مسیر باید کش شود، و بعد
// revalidate تعیین می‌کند هر چند وقت یک‌بار دوباره ساخته شود.
export const dynamic = 'force-static';

// کش می‌شود (نه رندرِ همیشه‌-تازه)، چون نرخ‌ها هر چند دقیقه یک‌بار
// توسط کرون‌جاب (app/api/cron/update-rates) آپدیت می‌شوند، نه
// لحظه‌به‌لحظه. Vercel/Next.js به‌خاطرِ همین export، خودکار هدرِ
// Cache-Control مناسب را روی پاسخ می‌گذارد.
export const revalidate = 300; // ثانیه = ۵ دقیقه

// این کلیدها همیشه در پاسخ برمی‌گردند، حتی اگر مقداری در دیتابیس
// برایشان پیدا نشود (در آن صورت مقدارشان null است، نه اینکه کلید
// از پاسخ غایب باشد) — این‌طور مصرف‌کننده (هاب) همیشه می‌تواند به
// همه‌ی کلیدها ارجاع بدهد بدون نیاز به چک کردنِ وجودشان.
const EXPOSED_KEYS = [
  'usd',
  'gold_18k',
  'silver',
  'coin_full',
  'coin_half',
  'coin_quarter',
  'coin_grami',
] as const;

// تنها دامنه‌ای که این API برایش در نظر گرفته شده (هاب ابزارها).
// چون یک GET عمومی و بدون احراز هویت است، فنیاً هرجایی می‌تواند
// این آدرس را صدا بزند؛ این هدر فقط یک لایه‌ی دفاعیِ اضافه برای
// فراخوانی‌های سمتِ مرورگر است، نه یک قفلِ امنیتیِ واقعی.
const ALLOWED_ORIGIN = 'https://tools.soughat.shop';

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  return response;
}

export async function GET() {
  const { data, error } = await supabase.from('market_rates').select('key, rate');

  if (error) {
    console.error('[api/public/rates] Supabase error:', error.message);
    return withCors(
      NextResponse.json(
        { error: 'نرخ‌ها در حال حاضر در دسترس نیستند.' },
        { status: 500 }
      )
    );
  }

  const ratesMap: Record<string, number> = {};
  data?.forEach((row: { key: string; rate: number }) => {
    ratesMap[row.key] = row.rate;
  });

  const result: Record<string, number | null> = {};
  for (const key of EXPOSED_KEYS) {
    result[key] = ratesMap[key] ?? null;
  }

  // usdt همیشه برابر usd است (طبق سند برنامه: «usdt (=usd)»)
  result.usdt = result.usd;

  return withCors(
    NextResponse.json({
      rates: result,
      updated_at: new Date().toISOString(),
    })
  );
}

// درخواست‌های preflight مرورگر (CORS) را هم جواب می‌دهیم
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}