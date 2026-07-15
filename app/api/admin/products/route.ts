import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

const LOCALES = ['fa', 'en'] as const;

// بعد از هر ساخت/ویرایش/حذفِ محصول، کشِ صفحاتِ عمومیِ مربوط به
// محصولات را خودکار خالی می‌کنیم (هم لیست، هم جزئیات هر محصول)،
// تا ادمین برای دیدنِ تغییرش مجبور نباشد به صفحه‌ی «مدیریت کش»
// برود و دستی دکمه بزند.
//
// 🆕 رفع باگِ «تازه نشدنِ فوریِ لیست محصولات بعد از رفع بحران CPU»:
// -----------------------------------------------------------------------
// بعد از رفع بحران «Exceeded free resources - Fluid Active CPU»،
// app/[locale]/products/page.tsx دیگر مستقیم از Supabase نمی‌خواند؛ نتیجه‌ی
// کوئری محصولات را با unstable_cache و تگِ 'products-list' تا ۶۰ ثانیه در
// Data Cache خودِ Next.js نگه می‌دارد (به app/[locale]/products/page.tsx و
// app/api/admin/cache/route.ts مراجعه کنید). revalidatePath بالا فقط
// خروجیِ رندرشده‌ی صفحه را پاک می‌کند و برای صفحه‌ی جزئیاتِ هر محصول
// (که با revalidate=60 ایستا/ISR است) کافی است؛ اما هیچ اثری روی آن Data
// Cache تگ‌دار ندارد. بدون خط زیر، بعد از افزودن/ویرایش/حذفِ یک محصول در
// پنل ادمین، صفحه‌ی «همه‌ی محصولات» تا ۶۰ ثانیه همچنان لیستِ قدیمی را از
// همان کش نشان می‌داد — دقیقاً همان «کهنه ماندنِ اطلاعات دیتابیس» که در
// قوانینِ اولیه‌ی این پروژه ممنوع بود. با revalidateTag('products-list')،
// همان لحظه‌ی ثبتِ تغییر در ادمین، این Data Cache هم خالی می‌شود.
function revalidateProductsCache() {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/products`, 'layout');
  });
  revalidateTag('products-list');
}

// 1. افزودن محصول جدید (POST)
export async function POST(request: Request) {
  try {
    // چک کردن قفل امنیتی (حالا واقعاً چک می‌کند که کاربر ادمین است، نه هر کاربر لاگین‌شده)
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([body])
      .select();

    if (error) throw error;

    revalidateProductsCache();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ویرایش محصول (PUT)
export async function PUT(request: Request) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'ID محصول الزامی است' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    revalidateProductsCache();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. حذف محصول (DELETE)
export async function DELETE(request: Request) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID محصول الزامی است' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidateProductsCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}