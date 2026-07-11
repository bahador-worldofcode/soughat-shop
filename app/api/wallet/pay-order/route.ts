import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendTelegramMessage } from '@/lib/notifyTelegram';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'شناسه سفارش الزامی است' }, { status: 400 });

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'برای پرداخت با کیف‌پول باید وارد حساب شوید.' }, { status: 401 });

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'نشست شما منقضی شده، دوباره وارد شوید.' }, { status: 401 });
    }

    const { error } = await supabaseAdmin.rpc('pay_order_with_wallet', {
      p_order_id: orderId,
      p_user_id: userData.user.id,
    });

    if (error) {
      if (error.message?.includes('INSUFFICIENT_BALANCE')) {
        return NextResponse.json({ error: 'موجودی کیف‌پول شما کافی نیست.' }, { status: 402 });
      }
      if (error.message?.includes('ORDER_NOT_PAYABLE')) {
        return NextResponse.json({ error: 'این سفارش دیگر قابل پرداخت با کیف‌پول نیست.' }, { status: 409 });
      }
      throw error;
    }

    // اعلانِ تلگرام فقط جهتِ اطلاع است؛ چون پرداخت همین الان و به‌صورت اتمیک از
    // کیف‌پول کسر شده، ادمین دیگر نیازی به تاییدِ دستیِ پرداخت ندارد — فقط باید
    // سفارش را آماده و ارسال کند.
    const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
    if (order) {
      const itemsList = (order.items || []).map((item: any) => `▫️ ${item.title} (x${item.quantity})`).join('\n');
      const messageText = `
🛍 *سفارش جدید (پرداخت‌شده با کیف‌پول)*
🔖 کد: ${order.id}
💎 روش پرداخت: Wallet
➖➖➖➖➖➖➖➖
📍 گیرنده: ${order.customer_name} — ${order.city}
🛒 اقلام:
${itemsList}
➖➖➖➖➖➖➖➖
✅ وضعیت: پرداخت‌شده و تاییدشده (نیاز به بررسیِ دستیِ پرداخت نیست، فقط آماده‌سازی و ارسال)
➖➖➖➖➖➖➖➖
`.trim();
      await sendTelegramMessage(process.env.TELEGRAM_ORDERS_CHAT_ID, messageText);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطا در پرداخت' }, { status: 500 });
  }
}