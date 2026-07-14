import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod } = body;

    // 1. دریافت اطلاعات کامل سفارش از دیتابیس
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) throw new Error('Order not found');

    // فقط وقتی این بخش به پیام اضافه می‌شود که:
    // ۱) سفارش شامل محصولِ «ارسال حواله نقدی» باشد
    // ۲) و مشتری واقعاً حداقل یکی از سه فیلد کارت/شبا/حساب را پر کرده باشد
    const REMITTANCE_PRODUCT_SLUG = 'send-money-cash-iran-remittance-card-to-card';
    const hasRemittanceItem = Array.isArray(order.items) &&
      order.items.some((item: any) => item?.slug === REMITTANCE_PRODUCT_SLUG);
    const hasBankInfo = hasRemittanceItem && (
      order.recipient_card_number || order.recipient_iban || order.recipient_account_number
    );

    // 2. ارسال به تلگرام (فقط الان که پرداخت تایید شده)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ORDERS_CHAT_ID;

    if (token && chatId) {
        const itemsList = order.items.map((item: any) => 
            `▫️ ${item.title} (x${item.quantity})`
        ).join('\n');

        const messageText = `
🛍 *سفارش جدید (پرداخت شده)*
🔖 کد: ${order.id}
💎 *روش پرداخت: ${paymentMethod}*
➖➖➖➖➖➖➖➖
🌍 *اطلاعات فرستنده (خارج):*
👤 نام: ${order.sender_name}
📱 تلفن: ${order.sender_phone}
🏳️ کشور: ${order.sender_country}

📍 *اطلاعات گیرنده (ایران):*
👤 نام: ${order.customer_name}
📱 تلفن: ${order.customer_phone}
🏙 شهر: ${order.city}
🏠 آدرس: ${order.address}
${hasBankInfo ? `➖➖➖➖➖➖➖➖
💳 *اطلاعات واریز حواله:*
${order.recipient_card_number ? `💳 شماره کارت: ${order.recipient_card_number}\n` : ''}${order.recipient_iban ? `🏦 شماره شبا: ${order.recipient_iban}\n` : ''}${order.recipient_account_number ? `🔢 شماره حساب: ${order.recipient_account_number}\n` : ''}` : ''}➖➖➖➖➖➖➖➖
🛒 *اقلام:*
${itemsList}

📝 *یادداشت:*
${order.order_notes || 'ندارد'}
➖➖➖➖➖➖➖➖
💰 *مالی:*
💵 پایه: ${order.total_price} دلار
💱 پرداختی مشتری: ${order.display_currency} ${order.display_fiat_amount}
✅ وضعیت: مشتری اعلام پرداخت کرده
➖➖➖➖➖➖➖➖
`.trim();

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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