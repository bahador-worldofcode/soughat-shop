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

    // 2. دریافت نرخ لحظه‌ای (تغییر منبع به CoinCap برای سازگاری با Vercel)
    let rate = 1;
    const cleanSymbol = symbol.toUpperCase().trim();

    if (cleanSymbol !== 'USDT') {
      try {
        // استفاده از API کوین‌کپ (پایدارتر روی سرورهای ابری)
        // برای سولانا id میشه solana
        const cryptoId = cleanSymbol === 'SOL' ? 'solana' : 'bitcoin'; 
        
        const res = await fetch(`https://api.coincap.io/v2/assets/${cryptoId}`, {
          next: { revalidate: 30 }
        });
        
        const data = await res.json();
        
        if (data.data && data.data.priceUsd) {
          rate = parseFloat(data.data.priceUsd);
        } else {
          // فال‌بک (Fallback) اگر اولی کار نکرد، از کوین‌گکو بگیر
           const backupRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`);
           const backupData = await backupRes.json();
           if(backupData[cryptoId] && backupData[cryptoId].usd) {
               rate = backupData[cryptoId].usd;
           } else {
               throw new Error('Price fetch failed');
           }
        }
      } catch (err) {
        console.error('Crypto API Error:', err);
        return NextResponse.json({ error: 'خطا در دریافت نرخ ارز' }, { status: 503 });
      }
    }

    // 3. محاسبه دقیق ریاضی با BigNumber
    const totalPriceUSD = new BigNumber(order.total_price);
    const cryptoRate = new BigNumber(rate);
    
    // محاسبه: تقسیم قیمت بر نرخ ارز
    const rawAmount = totalPriceUSD.dividedBy(cryptoRate);
    
    // رند کردن به سمت بالا تا ۴ رقم اعشار (برای جلوگیری از خطای کسری)
    const roundedAmount = rawAmount.decimalPlaces(4, BigNumber.ROUND_CEIL);

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