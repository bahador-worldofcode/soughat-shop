import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import BigNumber from 'bignumber.js';

// جلوگیری از کش شدن نتیجه (برای اینکه قیمت همیشه تازه باشه)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, symbol } = body;

    if (!orderId || !symbol) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    // 1. دریافت مبلغ سفارش از دیتابیس
    const { data: order, error: dbError } = await supabaseAdmin
      .from('orders')
      .select('total_price, status')
      .eq('id', orderId)
      .single();

    if (dbError || !order) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    // 🆕 محافظِ منطقی: اگه سفارش دیگه در وضعیتِ «در انتظار پرداخت» نباشه
    // (قبلاً پرداخت شده یا لغو شده)، دیگه معنا نداره یک مبلغِ قابل‌پرداخت
    // براش محاسبه و نمایش بدیم — مستقل از اینکه سمتِ کلاینت چه چک‌هایی
    // شده، همین‌جا هم جلوش گرفته می‌شه.
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'این سفارش دیگر در وضعیتِ در انتظار پرداخت نیست.' }, { status: 409 });
    }

    // 2. دریافت نرخ لحظه‌ای
    let rate = 1;
    const cleanSymbol = symbol.toUpperCase().trim();

    // اگر تتر بود که نرخ 1 هست، اگر نه استعلام بگیر
    if (cleanSymbol !== 'USDT') {
      try {
        const pair = `${cleanSymbol}-USD`;
        const res = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, {
          cache: 'no-store'
        });
        const data = await res.json();
        
        if (data.data && data.data.amount) {
          rate = parseFloat(data.data.amount);
        } else {
          throw new Error('Invalid price data');
        }
      } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'خطا در دریافت نرخ ارز.' }, { status: 503 });
      }
    }

    // 3. محاسبه دقیق ریاضی (بخش اصلاح شده)
    const totalPriceUSD = new BigNumber(order.total_price);
    const cryptoRate = new BigNumber(rate);
    
    // تقسیم قیمت کل بر نرخ ارز
    const rawAmount = totalPriceUSD.dividedBy(cryptoRate);

    // ✨ هوشمندسازی اعشار: تتر ۲ رقم، بقیه ۵ رقم
    const decimalPlaces = cleanSymbol === 'USDT' ? 2 : 5;
    
    // رند کردن رو به بالا (CEIL) تا حتی ۱ سنت هم کم نیاد
    const roundedAmount = rawAmount.decimalPlaces(decimalPlaces, BigNumber.ROUND_CEIL);
    
    // تبدیل به رشته استاندارد (بدون صفرهای اضافه تهش)
    const payableAmount = roundedAmount.toFixed(decimalPlaces);

    return NextResponse.json({
      amount: payableAmount,
      rate: rate,
      symbol: cleanSymbol,
      // مبلغِ پایه‌ی واقعیِ همین سفارش (از دیتابیس، نه سبدِ خریدِ کلاینت) —
      // تا فرانت‌اند بتونه «ارزش سفارش» رو مستقل از وضعیتِ فعلیِ سبدِ خرید
      // درست نمایش بده (مهم برای وقتی کاربر داره یک سفارشِ قدیمی رو ادامه
      // می‌ده و سبدش خالی/متفاوته).
      totalPriceUSD: order.total_price,
    });

  } catch (error: any) {
    console.error('Server Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}