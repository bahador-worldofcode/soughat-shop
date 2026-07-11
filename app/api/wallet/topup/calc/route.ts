import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import BigNumber from 'bignumber.js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topupId, symbol } = body;

    if (!topupId || !symbol) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    const { data: topup, error: dbError } = await supabaseAdmin
      .from('wallet_topups')
      .select('amount_usd, status')
      .eq('id', topupId)
      .single();

    if (dbError || !topup) {
      return NextResponse.json({ error: 'درخواست شارژ یافت نشد' }, { status: 404 });
    }
    if (topup.status !== 'pending') {
      return NextResponse.json({ error: 'این درخواست دیگر در انتظار پرداخت نیست' }, { status: 409 });
    }

    let rate = 1;
    const cleanSymbol = symbol.toUpperCase().trim();

    if (cleanSymbol !== 'USDT') {
      try {
        const pair = `${cleanSymbol}-USD`;
        const res = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, { cache: 'no-store' });
        const data = await res.json();
        if (data.data?.amount) {
          rate = parseFloat(data.data.amount);
        } else {
          throw new Error('Invalid price data');
        }
      } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'خطا در دریافت نرخ ارز.' }, { status: 503 });
      }
    }

    const amountUSD = new BigNumber(topup.amount_usd);
    const cryptoRate = new BigNumber(rate);
    const rawAmount = amountUSD.dividedBy(cryptoRate);
    const decimalPlaces = cleanSymbol === 'USDT' ? 2 : 5;
    const roundedAmount = rawAmount.decimalPlaces(decimalPlaces, BigNumber.ROUND_CEIL);
    const payableAmount = roundedAmount.toFixed(decimalPlaces);

    return NextResponse.json({ amount: payableAmount, rate, symbol: cleanSymbol });
  } catch (error: any) {
    console.error('Server Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}