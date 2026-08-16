// مسیر فایل در پروژه: app/api/admin/discounts/route.ts
// این یک فایل جدید است — باید در همین مسیر ساخته شود.
// --------------------------------------------------------------
// همه‌چیزِ پنل ادمینِ «کدهای تخفیف» از همین یک Route می‌آید:
//   GET  → آمار کلی + لیستِ کدهای شخصیِ سفارشِ اول + لیستِ کدهای دستی +
//          لیستِ سفارش‌هایی که تخفیف خورده‌اند (برای حسابرسیِ محاسبات)
//   POST → ساختِ یک کدِ تخفیفِ دستیِ جدید (برای کمپین/تخفیفِ گروهی)
//
// چرا همه در یک Route؟ چون حجمِ داده (تعدادِ کدهای تخفیف و سفارش‌های
// تخفیف‌خورده) برای یک فروشگاه در این مقیاس کوچک است؛ یک درخواستِ واحد
// ساده‌تر از هماهنگ‌کردنِ چند Route جداست، و پنل ادمین می‌تواند همه‌چیز
// را یک‌جا و هم‌زمان نشان دهد.
// --------------------------------------------------------------
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const [{ data: codes, error: codesError }, { data: discountedOrders, error: ordersError }] = await Promise.all([
      supabaseAdmin
        .from('discount_codes')
        .select('id, code, type, user_id, percent, is_active, max_uses, uses_count, expires_at, note, created_at')
        .order('created_at', { ascending: false }),
      // 🆕 هر سفارشی که با کد تخفیف ثبت شده — برای حسابرسیِ دقیقِ محاسبات:
      // اگه یک درصد جایی عدد اشتباه بود، همین‌جا (subtotal، درصد، مبلغِ
      // کسرشده، و جمعِ نهایی کنارِ هم) فوراً معلوم می‌شه.
      supabaseAdmin
        .from('orders')
        .select('id, created_at, status, customer_name, subtotal_price, discount_code, discount_percent, discount_amount_usd, total_price')
        .not('discount_code', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200),
    ]);

    if (codesError) throw codesError;
    if (ordersError) throw ordersError;

    // نام/ایمیلِ صاحبِ هر کدِ شخصی رو جدا می‌گیریم (چون discount_codes.user_id
    // به auth.users اشاره می‌کنه، نه مستقیم profiles؛ پس embed خودکارِ
    // PostgREST این‌جا کار نمی‌کنه — دستی جوینش می‌کنیم).
    const userIds = Array.from(
      new Set((codes || []).filter((c) => c.user_id).map((c) => c.user_id as string))
    );

    let profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      profilesMap = Object.fromEntries((profiles || []).map((p) => [p.id, { full_name: p.full_name, email: p.email }]));
    }

    // برای هر کدِ شخصیِ استفاده‌شده، سفارشی که باهاش ثبت شده رو پیدا می‌کنیم
    // (از همون لیستِ discountedOrders که بالا گرفتیم — نیازی به کوئریِ اضافه نیست).
    const orderByCode = Object.fromEntries((discountedOrders || []).map((o) => [o.discount_code, o]));

    const firstOrderCodes = (codes || [])
      .filter((c) => c.type === 'first_order')
      .map((c) => ({
        ...c,
        owner_name: c.user_id ? profilesMap[c.user_id]?.full_name || null : null,
        owner_email: c.user_id ? profilesMap[c.user_id]?.email || null : null,
        used_order_id: c.uses_count > 0 ? orderByCode[c.code]?.id || null : null,
      }));

    const manualCodes = (codes || []).filter((c) => c.type === 'manual');

    const stats = {
      totalCodesIssued: (codes || []).length,
      totalRedeemed: (codes || []).reduce((sum, c) => sum + (c.uses_count || 0), 0),
      totalDiscountGivenUSD: (discountedOrders || []).reduce((sum, o) => sum + (Number(o.discount_amount_usd) || 0), 0),
      firstOrderIssued: firstOrderCodes.length,
      firstOrderRedeemed: firstOrderCodes.filter((c) => c.uses_count > 0).length,
    };

    return NextResponse.json({ stats, firstOrderCodes, manualCodes, discountedOrders: discountedOrders || [] });
  } catch (error: any) {
    console.error('Admin discounts GET error:', error);
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    let { code, percent, maxUses, expiresAt, note } = body;

    const percentNum = Number(percent);
    if (!Number.isFinite(percentNum) || percentNum <= 0 || percentNum > 100) {
      return NextResponse.json({ error: 'درصد تخفیف باید بین ۱ تا ۱۰۰ باشد.' }, { status: 400 });
    }

    // اگه ادمین متنِ کد رو خالی بذاره، خودکار یک کدِ خوانا می‌سازیم.
    let finalCode = (code || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!finalCode) {
      finalCode = 'SOUGHAT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    }

    let maxUsesValue: number | null = null;
    if (maxUses !== undefined && maxUses !== null && maxUses !== '') {
      const n = Number(maxUses);
      if (!Number.isFinite(n) || n < 1) {
        return NextResponse.json({ error: 'سقفِ تعدادِ استفاده باید عددی مثبت باشد (یا برای نامحدود خالی بگذارید).' }, { status: 400 });
      }
      maxUsesValue = n;
    }

    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .insert([
        {
          code: finalCode,
          type: 'manual',
          user_id: null,
          percent: percentNum,
          max_uses: maxUsesValue,
          expires_at: expiresAt || null,
          note: note?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'این کد از قبل وجود دارد. یک متنِ دیگر انتخاب کنید.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ code: data });
  } catch (error: any) {
    console.error('Admin discounts POST error:', error);
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 });
  }
}