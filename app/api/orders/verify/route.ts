import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// این روت عمداً حداقلی است: فقط می‌گوید سفارش وجود دارد یا نه، و «وضعیتِ»
// پرداختش چیه (pending/paid/...). هیچ اطلاعات شخصی (نام، آدرس، تلفن و ...)
// برنمی‌گرداند، چون این مسیر از سمت کلاینت و بدون احراز هویت صدا زده می‌شود
// (صفحه‌ی success). وضعیت هم داده‌ی حساسی نیست — فقط به صفحه‌ی success کمک
// می‌کنه تشخیص بده سفارش با کیف‌پول (که همون لحظه‌ی ثبت واقعاً پرداخت و
// paid شده) ثبت شده یا با کریپتو (که هنوز pending و منتظرِ تاییدِ دستیِ
// ادمینه)، تا پیامِ درست رو نشون بده.
//
// چرا این فایل لازم است؟
// صفحه‌ی success قبلاً به هر orderId توی URL (حتی جعلی/تصادفی) اعتماد می‌کرد،
// سبد خرید کاربر را پاک می‌کرد و یک کد رهگیری «موفق» نشان می‌داد.
// این روت به آن صفحه اجازه می‌دهد قبل از پاک کردن سبد خرید و نمایش پیام موفقیت،
// از دیتابیس مطمئن شود که سفارش واقعاً وجود دارد.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ exists: true, status: data.status }, { status: 200 });
  } catch (error: any) {
    // اگر orderId فرمت درستی نداشته باشد (مثلاً UUID نامعتبر)، همینجا با خطا مواجه می‌شویم؛
    // در این حالت هم باید safe-fail کنیم و بگوییم سفارش معتبر نیست، نه اینکه 500 برگردانیم
    // و کاربر را با یک خطای فنی روبرو کنیم.
    return NextResponse.json({ exists: false }, { status: 200 });
  }
}