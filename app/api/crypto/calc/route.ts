import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import BigNumber from 'bignumber.js';

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

    // 2. دریافت نرخ لحظه‌ای از بایننس
    let rate = 1;
    const cleanSymbol = symbol.toUpperCase().trim();

    if (cleanSymbol !== 'USDT') {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}USDT`, {
          next: { revalidate: 30 }
        });
        const data = await res.json();
        if (data.price) {
          rate = parseFloat(data.price);
        } else {
          throw new Error('Invalid rate data');
        }
      } catch (err) {
        console.error('Binance API Error:', err);
        return NextResponse.json({ error: 'خطا در دریافت نرخ ارز' }, { status: 503 });
      }
    }

    // 3. محاسبه دقیق ریاضی با BigNumber
    const totalPriceUSD = new BigNumber(order.total_price);
    const cryptoRate = new BigNumber(rate);
    
    // محاسبه: تقسیم قیمت بر نرخ ارز
    const rawAmount = totalPriceUSD.dividedBy(cryptoRate);

    // رند کردن به سمت بالا تا ۴ رقم اعشار (BigNumber باقی می‌ماند)
    const roundedAmount = rawAmount.decimalPlaces(4, BigNumber.ROUND_CEIL);

    // تبدیل به رشته (این تابع خودکار صفرهای اضافه آخر را حذف می‌کند)
    // مثلا 60.0000 میشود "60" و 0.4260 میشود "0.426"
    const payableAmount = roundedAmount.toString();

    return NextResponse.json({
      amount: payableAmount,
      rate: rate,
      symbol: cleanSymbol,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}