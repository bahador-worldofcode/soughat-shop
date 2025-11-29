import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // اعتبارسنجی اولیه (که دیتای خالی نیاد)
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'سبد خرید خالی است' }, { status: 400 });
    }

    // ثبت سفارش با قدرت ادمین (Bypass RLS)
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
          total_price: body.totalPrice, // قیمت محاسبه شده
          display_fiat_amount: body.displayFiatAmount,
          display_currency: body.displayCurrency,
          status: 'pending' // وضعیت اولیه
        }
      ])
      .select('id') // فقط آیدی رو برگردون
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    console.error('Order creation failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}