// مسیر فایل در پروژه: app/api/discounts/validate/route.ts
// این یک فایل جدید است — باید در همین مسیر ساخته شود.
// --------------------------------------------------------------
// این Route فقط برای «پیش‌نمایش» است: چک‌اوت این را صدا می‌زند تا وقتی
// مشتری کد تخفیفش را وارد و روی «اعمال» کلیک می‌کند، فوراً مبلغِ تخفیف
// را ببیند — بدون این‌که خودِ کد در همین لحظه «مصرف» شود (مصرفِ واقعی و
// اتمیک فقط در لحظه‌ی ثبتِ نهاییِ سفارش، داخلِ app/api/orders/route.ts
// اتفاق می‌افتد). این جداسازیِ عمدی باعث می‌شود مشتری بتواند چند بار کد
// را امتحان/حذف کند بدون این‌که هربار یک بارِ مصرف از کدش کم شود.
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { code, subtotalUSD } = await request.json();

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ valid: false, error: 'کد تخفیف را وارد کنید.' }, { status: 400 });
    }
    const subtotal = Number(subtotalUSD);
    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return NextResponse.json({ valid: false, error: 'سبدِ خرید نامعتبر است.' }, { status: 400 });
    }

    // اگر کاربر لاگین باشد، شناسه‌اش را از توکن می‌گیریم — تا کدهای
    // شخصیِ «سفارشِ اول» بتوانند مالکیت را چک کنند. برای مهمان (بدون
    // توکن)، userId خالی می‌ماند و فقط کدهای عمومی/دستی برایش کار می‌کنند.
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token) {
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user) userId = userData.user.id;
      }
    }

    const { data, error } = await supabaseAdmin.rpc('validate_discount_code', {
      p_code: code.trim(),
      p_user_id: userId,
      p_subtotal_usd: subtotal,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.valid) {
      return NextResponse.json({ valid: false, error: row?.error_message || 'کد تخفیف معتبر نیست.' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: row.out_code,
      percent: Number(row.out_percent),
      discountAmountUSD: Number(row.out_discount_amount_usd),
      finalTotalUSD: Number(row.out_final_total_usd),
    });
  } catch (error: any) {
    console.error('Discount validate error:', error);
    return NextResponse.json({ valid: false, error: 'خطا در بررسیِ کد تخفیف. لطفاً دوباره تلاش کنید.' }, { status: 500 });
  }
}