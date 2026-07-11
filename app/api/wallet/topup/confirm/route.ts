import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendTelegramMessage } from '@/lib/notifyTelegram';

export async function POST(request: Request) {
  try {
    const { topupId, paymentMethod } = await request.json();

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'ورود الزامی است' }, { status: 401 });

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'ورود الزامی است' }, { status: 401 });
    }

    const { data: topup, error } = await supabaseAdmin
      .from('wallet_topups')
      .select('*, profiles(full_name, email, phone)')
      .eq('id', topupId)
      .eq('user_id', userData.user.id)
      .single();

    if (error || !topup) throw new Error('درخواست شارژ یافت نشد');

    const messageText = `
💳 *درخواست شارژ کیف‌پول (پرداخت‌شده توسط مشتری)*
🔖 کد: ${topup.id}
💎 روش پرداخت: ${paymentMethod}
👤 مشتری: ${topup.profiles?.full_name || '-'} (${topup.profiles?.email || '-'})
📱 تلفن: ${topup.profiles?.phone || '-'}
💱 مبلغ درخواستی: ${topup.requested_currency} ${topup.requested_amount}
💵 معادل دلاری: $${topup.amount_usd}
✅ وضعیت: مشتری اعلام پرداخت کرده — منتظر تایید دستی ادمین
➖➖➖➖➖➖➖➖
برای شارژ کیف‌پول، پنل ادمین → «کیف‌پول مشتریان» → تایید کن.
`.trim();

    await sendTelegramMessage(process.env.TELEGRAM_ORDERS_CHAT_ID, messageText);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}