import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // 1. خواندن تنظیمات از گاوصندوق
    const token = process.env.BALE_BOT_TOKEN;
    const ticketGroupId = process.env.BALE_TICKET_GROUP_ID;
    const orderGroupId = process.env.BALE_ORDER_GROUP_ID;

    if (!token) {
      return NextResponse.json({ error: 'Token Missing' }, { status: 500 });
    }

    let chatId = '';
    let messageText = '';

    // 2. سناریوی اول: پیام تیکت (تماس با ما)
    if (type === 'TICKET') {
      chatId = ticketGroupId!;
      messageText = `
📩 *پیام جدید از مشتری*
➖➖➖➖➖➖➖➖
👤 *فرستنده:* ${data.contact}
📝 *متن پیام:*
${data.content}
➖➖➖➖➖➖➖➖
⏰ ${new Date().toLocaleTimeString('fa-IR')}
      `.trim();
    } 
    
    // 3. سناریوی دوم: سفارش جدید (با جزئیات کامل)
    else if (type === 'ORDER') {
      chatId = orderGroupId!;
      
      // لیست کردن اقلام سفارش
      const itemsList = data.items.map((item: any) => 
        `▫️ ${item.title} (x${item.quantity})`
      ).join('\n');

      messageText = `
🛍 *سفارش جدید ثبت شد!*
🔖 کد سفارش: ${data.orderId}
➖➖➖➖➖➖➖➖
🌍 *اطلاعات فرستنده (خارج):*
👤 نام: ${data.senderName}
📱 تلفن: ${data.senderPhone}
🏳️ کشور: ${data.senderCountry}

📍 *اطلاعات گیرنده (ایران):*
👤 نام: ${data.receiverName}
📱 تلفن: ${data.receiverPhone}
🏙 شهر: ${data.city}
🏠 آدرس: ${data.address}
➖➖➖➖➖➖➖➖
🛒 *اقلام سفارش:*
${itemsList}

📝 *یادداشت مشتری:*
${data.notes || 'ندارد'}
➖➖➖➖➖➖➖➖
💰 *اطلاعات مالی:*
💵 مبلغ ارزی: ${data.totalPrice} دلار
💱 مبلغ پرداختی مشتری: ${data.displayCurrency} ${data.displayFiatAmount}
✅ وضعیت: در انتظار بررسی
➖➖➖➖➖➖➖➖
⏰ ${new Date().toLocaleTimeString('fa-IR')}
      `.trim();
    }

    // 4. ارسال به بله
    if (chatId && messageText) {
      const response = await fetch(`https://tapi.bale.ai/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
        }),
      });
      
      const resData = await response.json();
      if (!resData.ok) console.error('Bale Error:', resData);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}