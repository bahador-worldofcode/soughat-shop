import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { userId, amountUsd, note } = await request.json();
    if (!userId || typeof amountUsd !== 'number' || amountUsd === 0) {
      return NextResponse.json({ error: 'ورودی نامعتبر است' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.rpc('admin_adjust_wallet', {
      p_user_id: userId,
      p_amount_usd: amountUsd,
      p_note: note || null,
    });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}