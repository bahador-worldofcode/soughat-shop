import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod } = body; // مثلا paymentMethod = "USDT"

    // 1. دریافت اطلاعات کامل سفارش از دیتابیس
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) throw new Error('Order not found');

    // 2. ارسال به بله (فقط الان که پرداخت تایید شده)
    const token = process.env.BALE_BOT_TOKEN;
    const chatId = process.env.BALE_ORDER_GROUP_ID;

    if (token && chatId) {
        const itemsList = order.items.map((item: any) => 
            `▫️ ${item.title} (x${item.quantity})`
        ).join('\n');

        const messageText = `
🛍 *سفارش جدید (پرداخت شده)*
🔖 کد: ${order.id}
💎 *روش پرداخت: ${paymentMethod}*
➖➖➖➖➖➖➖➖
🌍 *فرستنده:*
👤 ${order.sender_name} | 📱 ${order.sender_phone}
🏳️ ${order.sender_country}

📍 *گیرنده:*
👤 ${order.customer_name} | 📱 ${order.customer_phone}
🏙 ${order.city}
🏠 ${order.address}
➖➖➖➖➖➖➖➖
🛒 *اقلام:*
${itemsList}

📝 *یادداشت:* ${order.order_notes || '-'}
➖➖➖➖➖➖➖➖
💰 *مالی:*
💵 پایه: ${order.total_price} دلار
💱 پرداختی مشتری: ${order.display_currency} ${order.display_fiat_amount}
✅ وضعیت: مشتری اعلام پرداخت کرده
➖➖➖➖➖➖➖➖
`.trim();

      await fetch(`https://tapi.bale.ai/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: messageText }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}