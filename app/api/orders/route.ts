import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// حداقل مبلغ خرید (دلار) - قانون بیزینسی
const MIN_ORDER_AMOUNT = 25;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. اعتبارسنجی: چک کردن خالی نبودن سبد خرید
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'سبد خرید خالی است' }, { status: 400 });
    }

    // 2. اعتبارسنجی: چک کردن حداقل مبلغ سفارش (امنیت مالی) - جدید
    if (body.totalPrice < MIN_ORDER_AMOUNT) {
      return NextResponse.json(
        { error: `مبلغ سفارش کمتر از حد مجاز است. حداقل خرید ${MIN_ORDER_AMOUNT} دلار می‌باشد.` },
        { status: 400 }
      );
    }

    // 3. اعتبارسنجی: چک کردن فیلدهای ضروری
    if (
      !body.senderName ||
      !body.senderPhone ||
      !body.senderCountry ||
      !body.receiverName ||
      !body.receiverPhone ||
      !body.address ||
      !body.city
    ) {
      return NextResponse.json(
        { error: 'اطلاعات سفارش ناقص است. لطفا تمام فیلدهای ستاره‌دار را پر کنید.' }, 
        { status: 400 }
      );
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
          total_price: body.totalPrice, // قیمت محاسبه شده دلاری
          display_fiat_amount: body.displayFiatAmount, // قیمتی که مشتری دیده
          display_currency: body.displayCurrency, // واحد پولی
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