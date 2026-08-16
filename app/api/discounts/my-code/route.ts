// مسیر فایل در پروژه: app/api/discounts/my-code/route.ts
// این یک فایل جدید است — باید در همین مسیر ساخته شود.
// --------------------------------------------------------------
// این Route فقط یک کار می‌کند: اگر کاربرِ لاگین‌کرده یک کدِ شخصیِ
// «تخفیفِ سفارشِ اول» دارد که هنوز مصرف نشده، همان را برمی‌گرداند —
// تا چک‌اوت بتواند خودکار در باکسِ کد تخفیف پرش کند (دقیقاً طبق
// خواسته: «به‌طور خودکار سیستم در مرحله‌ی پرداخت کد را اعمال می‌کند»).
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ code: null });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return NextResponse.json({ code: null });
    }

    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    if (!userData?.user) {
      return NextResponse.json({ code: null });
    }

    const { data } = await supabaseAdmin
      .from('discount_codes')
      .select('code, uses_count, max_uses, is_active, expires_at')
      .eq('user_id', userData.user.id)
      .eq('type', 'first_order')
      .maybeSingle();

    if (!data) return NextResponse.json({ code: null });

    const stillUsable =
      data.is_active &&
      (data.max_uses === null || data.uses_count < data.max_uses) &&
      (!data.expires_at || new Date(data.expires_at) > new Date());

    return NextResponse.json({ code: stillUsable ? data.code : null });
  } catch (error) {
    console.error('my-code error:', error);
    return NextResponse.json({ code: null });
  }
}