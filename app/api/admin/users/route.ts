import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const dynamic = 'force-dynamic';

// ─── لیست کامل کاربران ثبت‌نام‌کرده (به‌همراه آمار سفارش هرکدام) ──────
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, avatar_url, phone, country, is_admin, provider, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // آمار سفارش هر کاربر: تعداد سفارش‌ها و جمع مبلغ. چون معمولاً تعداد
    // سفارش‌ها برای این نوع فروشگاه خیلی زیاد نیست، همه را یک‌جا می‌خوانیم
    // و خودمان جمع می‌زنیم — ساده‌تر و سریع‌تر از ساختن یک view جداگانه.
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('user_id, total_price')
      .not('user_id', 'is', null);

    if (ordersError) throw ordersError;

    const statsByUser = new Map<string, { order_count: number; total_spent: number }>();
    for (const order of orders ?? []) {
      const key = order.user_id as string;
      const current = statsByUser.get(key) || { order_count: 0, total_spent: 0 };
      current.order_count += 1;
      current.total_spent += Number(order.total_price) || 0;
      statsByUser.set(key, current);
    }

    // تسک ۳۶ (EMAIL_PASSWORD_AUTH_SETUP.md): وضعیت «ایمیل تاییدشده؟» فقط
    // در auth.users موجود است (نه در جدول profiles)، پس با Admin API
    // آن را جدا می‌خوانیم و بر اساس id با پروفایل‌ها ترکیب می‌کنیم.
    // چون تعداد کاربران این فروشگاه زیاد نیست، همه‌ی صفحات را در یک
    // حلقه‌ی ساده جمع می‌کنیم (به‌جای پیاده‌سازی صفحه‌بندی سمت کلاینت).
    const confirmedByUserId = new Map<string, boolean>();
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data: authPage, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (authError) throw authError;

      for (const authUser of authPage.users) {
        confirmedByUserId.set(authUser.id, !!authUser.email_confirmed_at);
      }

      if (authPage.users.length < perPage) break; // به آخرین صفحه رسیدیم
      page += 1;
    }

    const users = (profiles ?? []).map((p) => ({
      ...p,
      // کاربرهای قدیمی‌تر (قبل از افزودن ستون provider در تسک ۱۴) مقدار
      // provider ندارند؛ چون قبل از فعال شدن ایمیل/پسورد فقط گوگل وجود
      // داشت، برای آن‌ها 'google' فرض می‌کنیم تا در پنل ادمین خالی نمانَد.
      provider: p.provider || 'google',
      email_confirmed: confirmedByUserId.get(p.id) ?? false,
      order_count: statsByUser.get(p.id)?.order_count ?? 0,
      total_spent: statsByUser.get(p.id)?.total_spent ?? 0,
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── ویرایش اطلاعات یک کاربر ─────────────────────────────────────────
export async function PATCH(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { id, full_name, phone, country, is_admin } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID کاربر الزامی است' }, { status: 400 });

    const updates: Record<string, any> = {};
    if (full_name !== undefined) updates.full_name = full_name || null;
    if (phone !== undefined) updates.phone = phone || null;
    if (country !== undefined) updates.country = country || null;
    if (is_admin !== undefined) updates.is_admin = !!is_admin;

    const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── حذف کامل یک کاربر ────────────────────────────────────────────────
// این هم پروفایل و هم خودِ حساب auth.users را حذف می‌کند (آدرس‌های
// ذخیره‌شده‌اش هم به‌خاطر ON DELETE CASCADE خودکار پاک می‌شوند؛
// سفارش‌های قبلی‌اش برای سوابق مالی/انبار نگه داشته می‌شوند، فقط
// user_id آن‌ها خالی می‌شود، طبق طراحی ON DELETE SET NULL).
export async function DELETE(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID کاربر الزامی است' }, { status: 400 });

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}