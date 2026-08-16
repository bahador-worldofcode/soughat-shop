// مسیر فایل در پروژه: app/api/orders/route.ts
// این فایل جایگزین فایل فعلی همین مسیر می‌شود (کامل جایگزین کنید).

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const dynamic = 'force-dynamic';

// ─── گرد کردنِ مبالغ پولی به ۲ رقمِ اعشار ──────────────────────────────
// جمعِ قیمت‌های اعشاری در جاوااسکریپت (مثلاً 27.48 + 20.65 + 18.57 + 20.23)
// به‌خاطرِ نحوه‌ی ذخیره‌سازیِ اعداد اعشاری در کامپیوتر، گاهی به‌جای یک عددِ
// دقیقِ ۲ رقمی، چیزی مثلِ 86.92999999999999 تولید می‌کند. این تابع همیشه
// قبل از ذخیره در دیتابیس، عدد را به ۲ رقمِ اعشارِ تمیز گرد می‌کند تا این
// خطا اصلاً وارد دیتابیس نشود — چه سفارش از چک‌اوتِ سایت بیاید، چه از هر
// مسیرِ دیگری در آینده.
function roundMoney(value: number): number {
  const num = Number(value);
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

// ─── ثبت سفارش جدید (صفحه‌ی چک‌اوت سمت مشتری این را صدا می‌زند) ──────
// این تابع POST قبلاً این‌جا وجود داشت ولی در یکی از ویرایش‌های اخیر این
// فایل (هم‌زمان با اضافه‌شدنِ verifyAdmin به GET/PATCH/DELETE) به‌اشتباه
// از فایل حذف شده بود. چون این route هیچ export ای برای POST نداشت،
// Next.js خودکار یک پاسخ ۴۰۵ با بدنه‌ی کاملاً خالی برمی‌گرداند؛ و چون
// بدنه خالی بود، خطِ `await response.json()` توی چک‌اوت با پیامِ
// "Unexpected end of JSON input" کرش می‌کرد. این نسخه دوباره همان
// منطقِ ثبت سفارش را — با همان اسمِ ستون‌هایی که در بقیه‌ی پروژه
// (مثل app/api/orders/confirm/route.ts و پنل ادمین) استفاده می‌شود —
// پیاده‌سازی می‌کند.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      senderName,
      senderPhone,
      senderCountry,
      notes,
      receiverName,
      receiverPhone,
      city,
      address,
      items,
      totalPrice,
      displayFiatAmount,
      displayCurrency,
      recipientCardNumber,
      recipientIban,
      recipientAccountNumber,
      recipientAccountHolderName,
      // 🆕 کدِ تخفیف (اختیاری) — همان کدی که مشتری در چک‌اوت اعمال کرده.
      discountCode,
    } = body;

    // اعتبارسنجی حداقلی سمت سرور — چک‌اوت سمت کلاینت هم اعتبارسنجی
    // می‌کند، ولی نباید فقط به آن اعتماد کرد.
    if (
      !senderName || !senderPhone || !senderCountry ||
      !receiverName || !receiverPhone || !city || !address ||
      !Array.isArray(items) || items.length === 0 ||
      totalPrice === undefined || totalPrice === null
    ) {
      return NextResponse.json({ error: 'اطلاعات سفارش ناقص است.' }, { status: 400 });
    }

    // اگر کاربر لاگین باشد (توکن فرستاده باشد)، سفارش را به حسابش وصل
    // می‌کنیم تا در تب «سفارش‌های من» دیده شود. اگر لاگین نباشد (مهمان)،
    // user_id خالی می‌ماند و سفارش دقیقاً مثل قبل و بدون مشکل ثبت می‌شود.
    // (userId این‌جا زودتر از قبل محاسبه می‌شود — چون منطقِ تخفیفِ زیر هم
    // بهش نیاز داره: کدهای شخصیِ «سفارشِ اول» باید مالکیتِ کاربر رو چک کنن.)
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token) {
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user) userId = userData.user.id;
      }
    }

    // 🆕 اگر مشتری کد تخفیفی اعمال کرده، همین‌جا — و فقط همین‌جا — به‌طور
    // واقعی «مصرف» می‌شود. چک‌اوت قبلاً همین کد را یک‌بار از طریق
    // app/api/discounts/validate/route.ts پیش‌نمایش کرده بود، ولی آن
    // فراخوانی چیزی مصرف نمی‌کند؛ فقط همین‌جا (با تابعِ RPC که به‌صورتِ
    // اتمیک uses_count را چک و افزایش می‌دهد) کد واقعاً یک‌بار مصرف
    // می‌شود. عمداً به هیچ عددی که از کلاینت آمده (مثل درصد یا مبلغِ
    // تخفیف) اعتماد نمی‌کنیم — همه‌چیز اینجا از نو، سمتِ سرور، محاسبه
    // می‌شود.
    const subtotal = roundMoney(totalPrice);
    let finalTotal = subtotal;
    let discountPercent: number | null = null;
    let discountAmountUSD: number | null = null;
    let appliedDiscountCode: string | null = null;

    if (discountCode && typeof discountCode === 'string' && discountCode.trim()) {
      const { data: redeemData, error: redeemError } = await supabaseAdmin.rpc('redeem_discount_code', {
        p_code: discountCode.trim(),
        p_user_id: userId,
        p_subtotal_usd: subtotal,
      });

      if (redeemError) throw redeemError;

      const redeemRow = Array.isArray(redeemData) ? redeemData[0] : redeemData;
      if (!redeemRow || !redeemRow.valid) {
        return NextResponse.json(
          { error: redeemRow?.error_message || 'کد تخفیف دیگر معتبر نیست. لطفاً آن را حذف کنید و دوباره تلاش کنید.' },
          { status: 409 }
        );
      }

      appliedDiscountCode = redeemRow.out_code;
      discountPercent = Number(redeemRow.out_percent);
      discountAmountUSD = Number(redeemRow.out_discount_amount_usd);
      finalTotal = Number(redeemRow.out_final_total_usd);
    }


    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          user_id: userId,
          sender_name: senderName,
          sender_phone: senderPhone,
          sender_country: senderCountry,
          order_notes: notes || null,
          customer_name: receiverName,
          customer_phone: receiverPhone,
          city,
          address,
          items,
          // 🆕 total_price همیشه «مبلغِ نهاییِ قابل‌پرداخت» است — یعنی
          // اگر تخفیفی اعمال شده، از قبل کسر شده؛ اگر نه، برابرِ subtotal.
          // همه‌ی سیستم‌های دیگر (محاسبه‌ی کریپتو، کسرِ کیف‌پول، نمایش در
          // پروفایل/پنل ادمین) دقیقاً همین ستون رو می‌خونن و نیازی به هیچ
          // تغییری ندارن.
          total_price: roundMoney(finalTotal),
          subtotal_price: subtotal,
          discount_code: appliedDiscountCode,
          discount_percent: discountPercent,
          discount_amount_usd: discountAmountUSD,
          display_fiat_amount: displayFiatAmount != null ? roundMoney(displayFiatAmount) : null,
          display_currency: displayCurrency ?? null,
          recipient_card_number: recipientCardNumber?.trim() || null,
          recipient_iban: recipientIban?.trim() || null,
          recipient_account_number: recipientAccountNumber?.trim() || null,
          // نام صاحبِ حساب می‌تونه با نامِ گیرنده فرق داشته باشه (مثلاً
          // آدرس مالِ مادره ولی کارت مالِ برادره) — پس فیلدِ جدا نگه می‌داریم.
          recipient_account_holder_name: recipientAccountHolderName?.trim() || null,
          status: 'pending',
        },
      ])
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'خطا در ثبت سفارش' }, { status: 500 });
  }
}

// ─── لیست کامل سفارش‌ها (برای جدول پنل ادمین) ────────────────────────
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ─── تغییر وضعیت سفارش ─────────────────────────────────────────────
export async function PATCH(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'id و status الزامی هستند' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('orders').update({ status }).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── حذف سفارش ──────────────────────────────────────────────────────
export async function DELETE(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID سفارش الزامی است' }, { status: 400 });

    const { error } = await supabaseAdmin.from('orders').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}