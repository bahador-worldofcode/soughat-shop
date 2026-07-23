// مسیر فایل در پروژه: app/api/profile/orders/[id]/route.ts
// این یک فایل و یک مسیر جدید است. باید در پروژه، داخلِ پوشه‌ی
// app/api/profile/orders/ یک زیرپوشه‌ی جدید با نامِ دقیق [id]
// (همراه با علامت‌های [ ]) بسازید و این فایل را با نامِ route.ts
// داخلِ همان پوشه قرار دهید. مسیرِ نهایی باید دقیقاً این باشد:
//   app/api/profile/orders/[id]/route.ts
//
// --------------------------------------------------------------
// این روت، «جزئیات کامل یک سفارشِ خاص» را برمی‌گرداند — فقط و فقط اگر
// همان سفارش واقعاً متعلق به کاربرِ لاگین‌کرده باشد.
//
// چرا یک فایل جدا از app/api/profile/orders/route.ts؟
// آن روت فقط یک لیستِ خلاصه (برای کارت‌های تبِ «سفارش‌های من») برمی‌گرداند
// و ستون‌های حساس/کامل (آدرس، تلفن، اطلاعاتِ واریز حواله، یادداشت و ...)
// را عمداً نمی‌خواند تا لیست سبک و سریع بماند. این روتِ جدید فقط زمانی
// صدا زده می‌شود که مشتری روی «مشاهده جزئیات» یک سفارشِ خاص کلیک کند.
//
// نکته‌ی امنیتی مهم: چون جدولِ orders کاملاً قفل است (RLS بدون هیچ
// policyِ عمومی)، از کلید سرویس (service role) در سمت سرور استفاده
// می‌کنیم و خودمان دستی توکنِ کاربر را چک می‌کنیم — دقیقاً هم‌سبک با
// app/api/profile/orders/route.ts. علاوه بر تاییدِ توکن، شرطِ
// eq('user_id', ...) هم اضافه شده تا حتی اگر کسی شناسه‌ی UUID یک
// سفارشِ متعلق به مشتریِ دیگر را حدس بزند یا از کنسولِ مرورگر امتحان
// کند، چیزی برنگردد (۴۰۴، نه ۴۰۳ — تا حتی وجودِ سفارش هم لو نرود).
// --------------------------------------------------------------

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'شناسه سفارش الزامی است.' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return NextResponse.json({ error: 'وارد نشده‌اید.' }, { status: 401 });
    }

    // توکن را با کلید سرویس تایید می‌کنیم تا مطمئن شویم واقعاً معتبر است
    // و مالِ همین کاربر است (کاربر نمی‌تواند user_id دلخواه بفرستد).
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'نشست شما منقضی شده، دوباره وارد شوید.' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(
        `id, status, created_at,
         customer_name, customer_phone, city, address,
         recipient_card_number, recipient_iban, recipient_account_number,
         sender_name, sender_phone, sender_country,
         display_currency, display_fiat_amount,
         order_notes, total_price, items`
      )
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (error) throw error;

    // یا سفارش اصلاً وجود ندارد، یا مالِ کاربرِ دیگری است — هر دو حالت را
    // عمداً با همان پیامِ «پیدا نشد» برمی‌گردانیم (نه یک پیامِ جدا برای
    // «دسترسی نداری») تا اطلاعاتِ اضافه‌ای درباره‌ی سفارش‌های دیگران لو نرود.
    if (!data) {
      return NextResponse.json({ error: 'سفارشی با این مشخصات پیدا نشد.' }, { status: 404 });
    }

    return NextResponse.json({ order: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 });
  }
}