// lib/notifyTelegram.ts
// --------------------------------------------------------------
// تابع کمکیِ مشترک برای ارسال پیام به گروه تلگرام از سمت سرور.
// app/api/bug-reports/route.ts مستقیماً از همین تابع استفاده می‌کند
// (بدون نیاز به یک فراخوانی HTTP اضافه به app/api/bale).
//
// نکته: عمداً app/api/bale/route.ts دست‌نخورده باقی مانده تا فلوی
// فعلیِ فرم تیکت (TicketForm) که کاملاً کار می‌کند، تحت تأثیر قرار
// نگیرد. اگر بعداً خواستید آن روت را هم به همین تابع مهاجرت بدهید،
// کافیست importش کنید.
// --------------------------------------------------------------

export async function sendTelegramMessage(
  chatId: string | undefined,
  text: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || !chatId) {
    // عمداً throw نمی‌کنیم: نبودِ کانفیگِ تلگرام نباید باعث شکستِ کل
    // درخواستِ کاربر (که قبلش با موفقیت در دیتابیس ثبت شده) بشود.
    console.error('Telegram notify skipped: missing TELEGRAM_BOT_TOKEN or chatId');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!res.ok) {
      console.error('Telegram notify failed:', res.status, await res.text());
    }
  } catch (error) {
    console.error('Telegram notify error:', error);
  }
}
