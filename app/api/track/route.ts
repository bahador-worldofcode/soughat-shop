import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// --------------------------------------------------------------
// این روت عمومی است (بدون نیاز به لاگین) — دقیقاً مثل قبل که هرکسی با
// داشتن کد سفارش (UUID) می‌توانست وضعیتش را ببیند. تنها فرقش این است
// که حالا به‌جای خواندن مستقیم جدول orders از مرورگر (که باعث می‌شد
// کل جدول هم قابل خواندن باشد)، این جستجو از سمت سرور و فقط برای
// همان یک شناسه‌ی دقیق انجام می‌شود.
// --------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get('id') || '').trim();

  if (!id) {
    return NextResponse.json({ error: 'کد سفارش الزامی است' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, status, customer_name, total_price, created_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'سفارشی با این کد پیدا نشد' }, { status: 404 });
  }

  return NextResponse.json({ order: data });
}