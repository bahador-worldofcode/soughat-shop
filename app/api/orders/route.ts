import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const MIN_ORDER_AMOUNT = 25;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'سبد خرید خالی است' }, { status: 400 });
    }
    if (body.totalPrice < MIN_ORDER_AMOUNT) {
      return NextResponse.json(
        { error: `مبلغ سفارش کمتر از حد مجاز است.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          sender_name: body.senderName,
          sender_phone: body.senderPhone,
          sender_country: body.senderCountry,
          order_notes: body.notes,
          customer_name: body.receiverName,
          customer_phone: body.receiverPhone,
          city: body.city,
          address: body.address,
          items: body.items,
          total_price: body.totalPrice,
          display_fiat_amount: body.displayFiatAmount,
          display_currency: body.displayCurrency,
          status: 'pending'
        }
      ])
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}