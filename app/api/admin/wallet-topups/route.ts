import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('wallet_topups')
    .select('*, profiles(full_name, email, phone)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !['paid', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'ورودی نامعتبر است' }, { status: 400 });
    }

    if (status === 'cancelled') {
      const { error } = await supabaseAdmin
        .from('wallet_topups')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('status', 'pending'); // فقط اگه هنوز pending باشه قابل لغوه
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // status === 'paid' → از طریق تابع اتمیکِ دیتابیس شارژ می‌کنیم، نه یک UPDATE ساده
    const { data, error } = await supabaseAdmin.rpc('credit_wallet_topup', { p_topup_id: id });
    if (error) throw error;

    if (data === false) {
      return NextResponse.json(
        { error: 'این درخواست قبلاً پردازش شده — دوباره شارژ نشد (برای جلوگیری از شارژ تکراری).' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}