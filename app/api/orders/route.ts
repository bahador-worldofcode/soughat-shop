import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// حداقل مبلغ خرید (دلار)
const MIN_ORDER_AMOUNT = 25;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. اعتبارسنجی‌های امنیتی
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'سبد خرید خالی است' }, { status: 400 });
    }
    if (body.totalPrice < MIN_ORDER_AMOUNT) {
      return NextResponse.json(
        { error: `مبلغ سفارش کمتر از حد مجاز است. حداقل خرید ${MIN_ORDER_AMOUNT} دلار می‌باشد.` },
        { status: 400 }
      );
    }
    if (
      !body.senderName || !body.senderPhone || !body.senderCountry ||
      !body.receiverName || !body.receiverPhone || !body.address || !body.city
    ) {
      return NextResponse.json(
        { error: 'اطلاعات سفارش ناقص است.' }, 
        { status: 400 }
      );
    }

    // 2. ثبت در دیتابیس (Supabase)
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
    
    // 3. ارسال اعلان فوری به گروه سفارشات بله
    // (این بخش باعث میشه گوشیت زنگ بخوره!)
    try {
        const baleToken = process.env.BALE_BOT_TOKEN;
        const baleGroupId = process.env.BALE_ORDER_GROUP_ID;

        if (baleToken && baleGroupId) {
            // ساخت لیست اقلام سفارش برای نمایش تمیز
            const itemsList = body.items.map((item: any) => 
                `▫️ ${item.title} (x${item.quantity})`
            ).join('\n');

            // متن پیام با تمام جزئیات خواسته شده
            const messageText = `
🛍 *سفارش جدید ثبت شد!*
🔖 کد سفارش: ${data.id}
➖➖➖➖➖➖➖➖
🌍 *اطلاعات فرستنده (خارج):*
👤 نام: ${body.senderName}
📱 تلفن: ${body.senderPhone}
🏳️ کشور: ${body.senderCountry}

📍 *اطلاعات گیرنده (ایران):*
👤 نام: ${body.receiverName}
📱 تلفن: ${body.receiverPhone}
🏙 شهر: ${body.city}
🏠 آدرس: ${body.address}
➖➖➖➖➖➖➖➖
🛒 *اقلام سفارش:*
${itemsList}

📝 *یادداشت مشتری:*
${body.notes || 'ندارد'}
➖➖➖➖➖➖➖➖
💰 *اطلاعات مالی:*
💵 ارزش دلاری: ${body.totalPrice} دلار
💱 مبلغ دیده‌شده توسط مشتری: ${body.displayCurrency} ${body.displayFiatAmount}
✅ وضعیت: در انتظار پرداخت
➖➖➖➖➖➖➖➖
⏰ ${new Date().toLocaleTimeString('fa-IR')}
`.trim();

            // شلیک پیام به سرور بله
            await fetch(`https://tapi.bale.ai/bot${baleToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: baleGroupId,
                    text: messageText,
                }),
            });
        }
    } catch (baleError) {
        // اگر بله قطع بود، سفارش نباید کنسل شه، فقط لاگ میندازیم
        console.error('Bale Notification Failed:', baleError);
    }

    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    console.error('Order creation failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}