import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const dynamic = 'force-dynamic';

// ─── آمارِ کلیِ کاربران، مستقل از صفحه‌بندی ──────────────────────────
// کارت‌های بالای پنلِ کاربران (تعداد کل کاربران، سفارش‌ها، جمعِ خرید)
// باید همیشه عددِ واقعیِ کل رو نشون بدن، نه فقط جمعِ همون صفحه‌ای که
// لود شده. چون این یک کوئریِ سبک و مستقله (بدون خواندنِ ردیف‌به‌ردیفِ
// orders)، آوردنش در یک مسیرِ جدا باعث می‌شه هیچ‌وقت مجبور نباشیم برای
// این کارت‌ها، دوباره کل جدول‌ها رو بخونیم.
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('admin_user_stats');
    if (error) throw error;

    const stats = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      totalUsers: Number(stats?.total_users ?? 0),
      totalOrders: Number(stats?.total_orders ?? 0),
      totalRevenue: Number(stats?.total_revenue ?? 0),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}