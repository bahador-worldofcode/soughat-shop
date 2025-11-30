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
      .select('total_price')
      .eq('id', orderId)
      .single();

    if (dbError || !order) {
      return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
    }

    // 2. دریافت نرخ لحظه‌ای از Coinbase (پایدارترین گزینه برای Vercel)
    let rate = 1;
    const cleanSymbol = symbol.toUpperCase().trim();

    // اگر تتر بود که نرخ 1 هست، اگر نه استعلام بگیر
    if (cleanSymbol !== 'USDT') {
      try {
        // پترن کوین‌بیس: SOL-USD
        const pair = `${cleanSymbol}-USD`;
        const res = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, {
          cache: 'no-store' // مهم: اصلاً کش نکن
        });
        
        const data = await res.json();
        
        // ساختار کوین‌بیس: { data: { amount: "20.55", base: "SOL", currency: "USD" } }
        if (data.data && data.data.amount) {
          rate = parseFloat(data.data.amount);
        } else {
          console.error('Coinbase Response Error:', data);
          throw new Error('Invalid price data from Coinbase');
        }
      } catch (err) {
        console.error('API Error:', err);
        // اگر کوین‌بیس هم جواب نداد (که بعیده)، یه ارور تمیز برگردون
        return NextResponse.json({ error: 'خطا در دریافت نرخ ارز. لطفا لحظاتی دیگر تلاش کنید.' }, { status: 503 });
      }
    }

    // 3. محاسبه دقیق ریاضی
    const totalPriceUSD = new BigNumber(order.total_price);
    const cryptoRate = new BigNumber(rate);
    
    // محاسبه: قیمت کل تقسیم بر نرخ ارز
    const rawAmount = totalPriceUSD.dividedBy(cryptoRate);
    
    // رند کردن: تا 5 رقم اعشار برای دقت بالاتر در سولانا
    const roundedAmount = rawAmount.decimalPlaces(5, BigNumber.ROUND_CEIL);
    const payableAmount = roundedAmount.toString();

    return NextResponse.json({
      amount: payableAmount,
      rate: rate,
      symbol: cleanSymbol,
    });

  } catch (error: any) {
    console.error('Server Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}