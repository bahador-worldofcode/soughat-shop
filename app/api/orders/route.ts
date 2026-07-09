import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const dynamic = 'force-dynamic';

// ─── ثبت سفارش جدید (صفحه‌ی چک‌اوت سمت مشتری این را صدا می‌زند) ──────
// این تابع POST قبلاً این‌جا وجود داشت ولی در یکی از ویرایش‌های اخیر این
// فایل (هم‌زمان با اضافه‌شدنِ verifyAdmin به GET/PATCH/DELETE) به‌اشتباه
// از فایل حذف شده بود. چون این route هیچ export ای برای POST نداشت،
// Next.js خودکار یک پاسخ ۴۰۵ با بدنه‌ی کاملاً خالی برمی‌گرداند؛ و چون
// بدنه خالی بود، خطِ `await response.json()` توی چک‌اوت با پیامِ
// "Unexpected end of JSON input" کرش می‌کرد. این نسخه دوباره همان
// منطقِ ثبت سفارش را — با همان اسمِ ستون‌هایی که در بقیه‌ی پروژه
// (مثل app/api/orders/confirm/route.ts و پنل ادمین) استفاده می‌شود —
// پیاده‌سازی می‌کند.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      senderName,
      senderPhone,
      senderCountry,
      notes,
      receiverName,
      receiverPhone,
      city,
      address,
      items,
      totalPrice,
      displayFiatAmount,
      displayCurrency,
    } = body;

    // اعتبارسنجی حداقلی سمت سرور — چک‌اوت سمت کلاینت هم اعتبارسنجی
    // می‌کند، ولی نباید فقط به آن اعتماد کرد.
    if (
      !senderName || !senderPhone || !senderCountry ||
      !receiverName || !receiverPhone || !city || !address ||
      !Array.isArray(items) || items.length === 0 ||
      totalPrice === undefined || totalPrice === null
    ) {
      return NextResponse.json({ error: 'اطلاعات سفارش ناقص است.' }, { status: 400 });
    }

    // اگر کاربر لاگین باشد (توکن فرستاده باشد)، سفارش را به حسابش وصل
    // می‌کنیم تا در تب «سفارش‌های من» دیده شود. اگر لاگین نباشد (مهمان)،
    // user_id خالی می‌ماند و سفارش دقیقاً مثل قبل و بدون مشکل ثبت می‌شود.
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token) {
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user) userId = userData.user.id;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          user_id: userId,
          sender_name: senderName,
          sender_phone: senderPhone,
          sender_country: senderCountry,
          order_notes: notes || null,
          customer_name: receiverName,
          customer_phone: receiverPhone,
          city,
          address,
          items,
          total_price: totalPrice,
          display_fiat_amount: displayFiatAmount ?? null,
          display_currency: displayCurrency ?? null,
          status: 'pending',
        },
      ])
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'خطا در ثبت سفارش' }, { status: 500 });
  }
}

// ─── لیست کامل سفارش‌ها (برای جدول پنل ادمین) ────────────────────────
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ─── تغییر وضعیت سفارش ─────────────────────────────────────────────
export async function PATCH(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'id و status الزامی هستند' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('orders').update({ status }).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── حذف سفارش ──────────────────────────────────────────────────────
export async function DELETE(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID سفارش الزامی است' }, { status: 400 });

    const { error } = await supabaseAdmin.from('orders').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}