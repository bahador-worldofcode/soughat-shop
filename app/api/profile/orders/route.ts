// app/api/profile/orders/route.ts
// --------------------------------------------------------------
// این روت، سفارش‌های «همان کاربرِ لاگین‌کرده» را برمی‌گرداند تا در
// تب «سفارش‌های من» در صفحه‌ی پروفایل نمایش داده شود.
//
// چرا مستقیم از کلاینت به جدول orders کوئری نمی‌زنیم؟
// چون صفحه‌ی «پیگیری سفارش» (track) از قبل به‌صورت عمومی (بدون لاگین)
// روی جدول orders کوئری می‌زند، پس نمی‌شود RLS سخت‌گیرانه روی آن جدول
// گذاشت. به‌جایش، این روت با کلید سرویس (service role) در سمت سرور کار
// می‌کند و خودش دستی توکن کاربر را چک می‌کند تا مطمئن شود کاربر فقط
// سفارش‌های خودش را می‌بیند، نه بقیه را.
// --------------------------------------------------------------

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return NextResponse.json({ error: 'وارد نشده‌اید.' }, { status: 401 });
    }

    // توکن را با کلید سرویس تایید می‌کنیم تا مطمئن شویم واقعاً معتبر است
    // و مال همین کاربر است (کاربر نمی‌تواند user_id دلخواه بفرستد).
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'نشست شما منقضی شده، دوباره وارد شوید.' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, status, city, total_price, display_fiat_amount, display_currency, items, created_at')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ orders: data ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 });
  }
}