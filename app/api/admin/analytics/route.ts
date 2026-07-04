import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// بررسی احراز هویت (دقیقاً همان الگویی که بقیه API روت‌های ادمین پروژه استفاده می‌کنند)
// ---------------------------------------------------------------------------
async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return false;
  return true;
}

// ---------------------------------------------------------------------------
// تمیزکاری Private Key
// این تابع چند حالت رایج خرابی کلید را که باعث خطای
// "DECODER routines::unsupported" می‌شوند اصلاح می‌کند:
//  ۱) گیومه‌ی دوبل اضافه در ابتدا/انتهای مقدار (رایج‌ترین دلیل در Vercel)
//  ۲) کاراکترهای \n نوشتاری که باید به خط جدید واقعی تبدیل شوند
//  ۳) کاراکترهای \r اضافه (رایج در فایل‌های کپی‌شده از ویندوز)
//  ۴) فاصله‌ی خالی اضافه در ابتدا/انتهای مقدار
// ---------------------------------------------------------------------------
function sanitizePrivateKey(rawKey: string): string {
  let key = rawKey.trim();

  // اگر کل مقدار داخل یک جفت گیومه‌ی دوبل ذخیره شده باشد، آن‌ها را حذف کن
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }

  // تبدیل \n نوشتاری (بک‌اسلش + حرف n) به خط جدید واقعی
  key = key.replace(/\\n/g, '\n');

  // حذف کاراکترهای \r (Windows line endings)
  key = key.replace(/\r/g, '');

  return key.trim();
}

// ---------------------------------------------------------------------------
// ساخت کلاینت گوگل آنالیتیکس با استفاده از Service Account
// ---------------------------------------------------------------------------
function getAnalyticsClient() {
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const rawPrivateKey = process.env.GA4_PRIVATE_KEY;

  if (!clientEmail || !rawPrivateKey) {
    throw new Error(
      'متغیرهای GA4_CLIENT_EMAIL یا GA4_PRIVATE_KEY تنظیم نشده‌اند.'
    );
  }

  const privateKey = sanitizePrivateKey(rawPrivateKey);

  // بررسی سریع اینکه فرمت کلید درست است (کمک به عیب‌یابی سریع‌تر در آینده)
  if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
    throw new Error(
      'فرمت GA4_PRIVATE_KEY نامعتبر است. مقدار باید دقیقاً با -----BEGIN PRIVATE KEY----- شروع شود (بدون گیومه‌ی اضافه).'
    );
  }

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

// ---------------------------------------------------------------------------
// GET /api/admin/analytics
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json(
        { error: 'عدم دسترسی! لطفاً وارد پنل شوید.' },
        { status: 401 }
      );
    }

    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!propertyId) {
      return NextResponse.json(
        { error: 'GA4_PROPERTY_ID تنظیم نشده است.' },
        { status: 500 }
      );
    }

    const analyticsDataClient = getAnalyticsClient();
    const property = `properties/${propertyId}`;

    // بازه‌ی زمانی گزارش عادی: ۲۸ روز اخیر (همان بازه‌ی پیش‌فرض خود گوگل آنالیتیکس)
    const dateRanges = [{ startDate: '28daysAgo', endDate: 'today' }];

    // هر سه درخواست را همزمان به گوگل می‌فرستیم تا سریع‌تر جواب بیاید
    const [summaryResult, deviceResult, realtimeResult] = await Promise.all([
      // ۱) آمار کلی: تعداد کل کاربران + تعداد بازدید صفحات (۲۸ روز اخیر)
      analyticsDataClient.runReport({
        property,
        dateRanges,
        metrics: [{ name: 'totalUsers' }, { name: 'screenPageViews' }],
      }),

      // ۲) تفکیک کاربران بر اساس نوع دستگاه (موبایل / دسکتاپ / تبلت)
      analyticsDataClient.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      }),

      // ۳) کاربران آنلاین همین الان (۳۰ دقیقه‌ی اخیر) - گزارش Realtime
      analyticsDataClient.runRealtimeReport({
        property,
        metrics: [{ name: 'activeUsers' }],
      }),
    ]);

    const summaryResponse = summaryResult[0];
    const deviceResponse = deviceResult[0];
    const realtimeResponse = realtimeResult[0];

    const summaryRow = summaryResponse.rows?.[0];
    const totalUsers = Number(summaryRow?.metricValues?.[0]?.value ?? 0);
    const pageViews = Number(summaryRow?.metricValues?.[1]?.value ?? 0);

    const devices = (deviceResponse.rows ?? []).map((row) => ({
      device: row.dimensionValues?.[0]?.value ?? 'unknown',
      users: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    const activeUsersNow = Number(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    return NextResponse.json({
      totalUsers,
      pageViews,
      devices,
      activeUsersNow,
      period: 'آخرین ۲۸ روز',
    });
  } catch (error: any) {
    console.error('GA4 API Error:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در دریافت اطلاعات گوگل آنالیتیکس' },
      { status: 500 }
    );
  }
}