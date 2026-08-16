// مسیر فایل در پروژه: app/api/admin/discounts/[id]/route.ts
// این یک فایل و یک مسیر جدید است — باید داخل app/api/admin/discounts/
// یک زیرپوشه‌ی [id] بسازید و این فایل را با نام route.ts داخلش بگذارید.
// --------------------------------------------------------------
// PATCH → فعال/غیرفعال کردنِ یک کد (کلید سوییچِ اضطراری در پنل)
// DELETE → حذفِ کامل یک کدِ دستی (کدهای شخصیِ سفارشِ اول را نمی‌توان از
//          این مسیر حذف کرد — چون هر کاربر باید همیشه دقیقاً یک کدِ
//          شخصی داشته باشد؛ اگر لازم شد، فقط غیرفعالش کنید)
// --------------------------------------------------------------
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { isActive } = await request.json();

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive باید true یا false باشد.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('discount_codes').update({ is_active: isActive }).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // فقط کدهای دستی حذف می‌شن — کدهای شخصیِ سفارشِ اول (type='first_order')
    // دست‌نخورده می‌مونن، حتی اگه به اشتباه همین درخواست براشون بیاد.
    const { error } = await supabaseAdmin.from('discount_codes').delete().eq('id', id).eq('type', 'manual');
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 });
  }
}