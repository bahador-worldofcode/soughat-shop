import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    const token = process.env.TELEGRAM_BOT_TOKEN;

    // فقط برای تیکت‌ها از این مسیر استفاده می‌کنیم
    // (سفارشات رو بردیم توی یک API اختصاصی که بعد از پرداخت صدا زده بشه)
    if (type === 'TICKET') {
      const chatId = process.env.TELEGRAM_TICKETS_CHAT_ID;
      if (!token || !chatId) return NextResponse.json({ error: 'Config Error' }, { status: 500 });

      // ✅ فرم تیکت حالا از صفحه‌ی «تماس با ما» ارسال می‌شود و همیشه هم
      // شماره تماس و هم ایمیل را همراه دارد (هر دو ضروری‌اند)، به‌علاوه‌ی
      // نام (اختیاری). پیام ارسالی به گروه تلگرام هم بر همین اساس کامل‌تر شده.
      const nameLine = data.name ? `👤 *نام:* ${data.name}\n` : '';
      const messageText = `
📩 *تیکت جدید از مشتری*
➖➖➖➖➖➖➖➖
${nameLine}📱 *شماره تماس:* ${data.phone}
📧 *ایمیل:* ${data.email}
📝 *متن پیام:*
${data.content}
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