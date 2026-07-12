import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendTelegramMessage } from '@/lib/notifyTelegram';

export async function POST(request: Request) {
  try {
    // «payableAmount» مبلغِ دقیقِ کریپتویی‌ایه (مثلاً «51.81» برای USDT یا
    // «0.29» برای SOL) که همون لحظه روی صفحه به مشتری نشون داده شد —
    // دقیقاً همون چیزی که WalletTopupPayment.tsx از /api/wallet/topup/calc
    // گرفته و روی صفحه رندر کرده. تا امروز این عدد فقط توی مرورگرِ مشتری
    // می‌موند و هیچ‌جا ذخیره نمی‌شد؛ برای همین پنلِ ادمین «روش پرداخت» رو
    // همیشه «---» نشون می‌داد و ادمین مجبور بود حدس بزنه مشتری با کدوم
    // ارز و چه مبلغی می‌خواد پرداخت کنه.
    const { topupId, paymentMethod, payableAmount } = await request.json();

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
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

    // ذخیره‌ی روش پرداخت + مبلغِ دقیقِ کریپتویی روی خودِ فاکتور، تا هم
    // پنلِ ادمین «کیف‌پول مشتریان» بتونه نشونش بده، هم اگه بعداً کسی
    // خواست بررسی کنه، این اطلاعات برای همیشه کنارِ فاکتور بمونه — نه
    // فقط یک پیامِ تلگرامیِ گذرا. این فقط یک بروزرسانیِ اطلاعاتیه، به
    // هیچ ستونِ مالی (amount_usd، status، credited) دست نمی‌زنه.
    await supabaseAdmin
      .from('wallet_topups')
      .update({
        payment_method: paymentMethod || null,
        payable_crypto_amount: payableAmount || null,
      })
      .eq('id', topupId);

    const messageText = `
💳 *درخواست شارژ کیف‌پول (پرداخت‌شده توسط مشتری)*
🔖 کد: ${topup.id}
💎 روش پرداخت: ${paymentMethod}
💰 مبلغِ دقیقِ قابلِ‌پرداخت: ${payableAmount || '-'} ${paymentMethod}
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