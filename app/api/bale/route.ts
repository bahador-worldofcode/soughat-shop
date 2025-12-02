import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    const token = process.env.BALE_BOT_TOKEN;
    
    // فقط برای تیکت‌ها از این مسیر استفاده می‌کنیم
    // (سفارشات رو بردیم توی یک API اختصاصی که بعد از پرداخت صدا زده بشه)
    if (type === 'TICKET') {
      const chatId = process.env.BALE_TICKET_GROUP_ID;
      if (!token || !chatId) return NextResponse.json({ error: 'Config Error' }, { status: 500 });

      const messageText = `
📩 *پیام جدید از مشتری*
➖➖➖➖➖➖➖➖
👤 *فرستنده:* ${data.contact}
📝 *متن پیام:*
${data.content}
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