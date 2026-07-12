import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// ─── لیستِ صفحه‌بندی‌شده‌ی کاربران (+ آمار سفارش هرکدام) ───────────────
// قبلاً این مسیر کل جدولِ profiles، کل جدولِ orders و کلِ auth.users رو
// یک‌جا می‌خوند تا آمار هر کاربر رو خودش حساب کنه — همون چیزی که با
// زیاد شدنِ مشتری‌ها فشار زیادی به سرور می‌آورد. حالا فقط همون تعداد
// ردیفی که برای «همین صفحه» لازمه رو از تابعِ دیتابیسیِ admin_list_users
// می‌گیریم (نگاه کن به supabase/wallet_admin_pagination.sql).
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE)
    );
    const offset = (page - 1) * pageSize;

    const { data, error } = await supabaseAdmin.rpc('admin_list_users', {
      p_search: search || null,
      p_limit: pageSize,
      p_offset: offset,
    });

    if (error) throw error;

    const rows = (data ?? []) as Array<Record<string, any>>;
    // total_count روی هر ردیف تکراری برمی‌گرده (نتیجه‌ی count(*) over())،
    // پس کافیه از ردیفِ اول بخونیمش؛ اگه صفحه خالی بود یعنی نتیجه‌ای نیست.
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    const users = rows.map(({ total_count, ...rest }) => rest);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
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