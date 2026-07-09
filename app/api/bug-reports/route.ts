import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendTelegramMessage } from '@/lib/notifyTelegram';

// --------------------------------------------------------------
// این روت، عمومی و بدون نیاز به لاگین است (هرکسی می‌تواند باگ گزارش
// بدهد) — دقیقاً به همین دلیل، امن‌ترین روت پروژه هم باید باشد. تمام
// نوشتن‌ها (هم رکورد دیتابیس، هم آپلود عکس) با Service Role Key
// (supabaseAdmin) انجام می‌شود، چون در supabase/bug_reports.sql عمداً
// هیچ Policy‌ای برای INSERT از سمت anon تعریف نکرده‌ایم.
//
// لایه‌های امنیتی این روت:
//   ۱) محدودیت حجم کل درخواست (قبل از پردازش)
//   ۲) هانی‌پات ضد اسپم (فیلد مخفی که فقط ربات‌ها پر می‌کنند)
//   ۳) اعتبارسنجی طول فیلدهای متنی
//   ۴) Rate Limiting بر اساس هشِ IP (نه IP خام) از روی خودِ جدول
//   ۵) whitelist فرمت عکس + بررسی بایت‌های واقعیِ فایل (Magic Number)
//      — نه فقط اعتماد به Content-Type ارسالی از کلاینت
//   ۶) نام‌گذاریِ تصادفیِ فایل روی سرور (نه نامی که کلاینت می‌فرستد)
// --------------------------------------------------------------

const MAX_REQUEST_BYTES = 6 * 1024 * 1024; // 6MB سقفِ کل درخواست (عکس ۲MB + حاشیه امن)
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB — باید با supabase/bug_reports.sql و lib/imageCompress.ts یکی بماند
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_SHORT_FIELD_LENGTH = 200;
const MAX_META_FIELD_LENGTH = 500;

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_REQUESTS = 5;

// بررسی بایت‌های ابتداییِ فایل برای تطبیق واقعی با فرمت اعلام‌شده
const ALLOWED_TYPES: Record<string, { ext: string; magic: (buf: Buffer) => boolean }> = {
  'image/jpeg': {
    ext: 'jpg',
    magic: (buf) => buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  'image/png': {
    ext: 'png',
    magic: (buf) =>
      buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47,
  },
  'image/webp': {
    ext: 'webp',
    magic: (buf) =>
      buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP',
  },
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

// IP خام هیچ‌وقت ذخیره نمی‌شود؛ فقط هشِ آن (به‌همراه یک salt) برای
// Rate Limiting نگه داشته می‌شود — یعنی از روی دیتابیس نمی‌شود IP واقعیِ
// کسی را بازسازی کرد.
function hashIp(ip: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY || 'soughat-bug-report-fallback-salt';
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    // ۱) رد سریع درخواست‌های حجیم، قبل از هرگونه پردازش
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: 'حجم درخواست بیش از حد مجاز است.' }, { status: 413 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'فرمت درخواست نامعتبر است.' }, { status: 400 });
    }

    const formData = await request.formData();

    // ۲) هانی‌پات ضد اسپم: این فیلد در فرم واقعی همیشه مخفی و خالی است؛
    // فقط ربات‌هایی که فرم را خودکار پر می‌کنند آن را پر می‌کنند.
    const honeypot = ((formData.get('website') as string) || '').trim();
    if (honeypot !== '') {
      // عمداً به ربات نمی‌گوییم رد شده — یک پاسخِ موفقِ ساختگی برمی‌گردانیم
      return NextResponse.json({ success: true });
    }

    const name = ((formData.get('name') as string) || '').trim().slice(0, MAX_SHORT_FIELD_LENGTH);
    const contact = ((formData.get('contact') as string) || '').trim().slice(0, MAX_SHORT_FIELD_LENGTH);
    const description = ((formData.get('description') as string) || '').trim();
    const pageUrl = ((formData.get('page_url') as string) || '').trim().slice(0, MAX_META_FIELD_LENGTH);
    const userAgent = ((formData.get('user_agent') as string) || '').trim().slice(0, MAX_META_FIELD_LENGTH);
    const imageFile = formData.get('image') as File | null;

    if (!description) {
      return NextResponse.json({ error: 'لطفاً توضیح مشکل را بنویسید.' }, { status: 400 });
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json({ error: 'توضیحات خیلی طولانی است.' }, { status: 400 });
    }

    // ۳) Rate Limiting: حداکثر ۵ گزارش در هر ۱۵ دقیقه به‌ازای هر IP
    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();

    const { count: recentCount } = await supabaseAdmin
      .from('bug_reports')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', windowStart);

    if ((recentCount ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌های شما در بازه‌ی زمانی اخیر زیاد بوده. لطفاً کمی بعد دوباره امتحان کنید.' },
        { status: 429 }
      );
    }

    // ۴) پردازش عکس (اختیاری — حداکثر یک عکس)
    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: 'حجم عکس بیشتر از حد مجاز (۲ مگابایت) است.' }, { status: 400 });
      }

      const typeInfo = ALLOWED_TYPES[imageFile.type];
      if (!typeInfo) {
        return NextResponse.json({ error: 'فرمت عکس مجاز نیست. فقط JPG، PNG یا WebP.' }, { status: 400 });
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // بررسی بایت‌های واقعیِ فایل، نه فقط عنوان MIME که کلاینت فرستاده —
      // جلوگیری از آپلود فایل مخرب با پسوند/عنوان جعلی (مثل .jpg که واقعاً script است)
      if (!typeInfo.magic(buffer)) {
        return NextResponse.json({ error: 'محتوای فایل با فرمت اعلام‌شده مطابقت ندارد.' }, { status: 400 });
      }

      // نام فایل کاملاً توسط سرور و تصادفی ساخته می‌شود — نامی که کلاینت
      // می‌فرستد هرگز مستقیم روی دیسک/Storage استفاده نمی‌شود
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${typeInfo.ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('bug-reports')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Bug report image upload error:', uploadError);
        return NextResponse.json({ error: 'خطا در آپلود عکس. لطفاً دوباره تلاش کنید.' }, { status: 500 });
      }

      const { data: publicUrlData } = supabaseAdmin.storage.from('bug-reports').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    // ۵) ثبت در دیتابیس
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('bug_reports')
      .insert([
        {
          name: name || null,
          contact: contact || null,
          description,
          image_url: imageUrl,
          page_url: pageUrl || null,
          user_agent: userAgent || null,
          ip_hash: ipHash,
          status: 'new',
        },
      ])
      .select('id')
      .single();

    if (insertError) throw insertError;

    // ۶) اطلاع‌رسانی به گروه تلگرام — اگر این مرحله خطا بدهد، روند اصلی
    // (که رکورد را با موفقیت ثبت کرده) نباید شکست بخورد
    const chatId = process.env.TELEGRAM_BUG_REPORTS_CHAT_ID || process.env.TELEGRAM_TICKETS_CHAT_ID;
    const nameLine = name ? `👤 *نام:* ${name}\n` : '';
    const contactLine = contact ? `📞 *تماس:* ${contact}\n` : '';
    const pageLine = pageUrl ? `🔗 *صفحه:* ${pageUrl}\n` : '';
    const imageLine = imageUrl ? `🖼 *عکس:* ${imageUrl}\n` : '';
    const messageText = `
🐞 *گزارش باگ جدید*
➖➖➖➖➖➖➖➖
${nameLine}${contactLine}${pageLine}${imageLine}📝 *توضیحات:*
${description}
➖➖➖➖➖➖➖➖
`.trim();

    await sendTelegramMessage(chatId, messageText);

    return NextResponse.json({ success: true, id: inserted?.id });
  } catch (error: any) {
    console.error('Bug report submit error:', error);
    return NextResponse.json({ error: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.' }, { status: 500 });
  }
}
