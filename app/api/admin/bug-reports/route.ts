import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

// ─── تغییر وضعیت گزارش (جدید / در حال بررسی / حل‌شده) ─────────────────
export async function PATCH(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id) return NextResponse.json({ error: 'شناسه گزارش الزامی است.' }, { status: 400 });

    const allowedStatuses = ['new', 'in_progress', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'وضعیت نامعتبر است.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('bug_reports').update({ status }).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── حذف کامل یک گزارش (و عکسِ ضمیمه‌اش از Storage، اگر وجود داشت) ─────
export async function DELETE(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'شناسه گزارش الزامی است.' }, { status: 400 });

    // اول عکس مرتبط (اگر وجود داشت) را از Storage پاک می‌کنیم تا فضای
    // Supabase الکی اشغال نماند
    const { data: reportRow } = await supabaseAdmin
      .from('bug_reports')
      .select('image_url')
      .eq('id', id)
      .single();

    if (reportRow?.image_url) {
      const fileName = reportRow.image_url.split('/bug-reports/').pop();
      if (fileName) {
        await supabaseAdmin.storage.from('bug-reports').remove([fileName]);
      }
    }

    const { error } = await supabaseAdmin.from('bug_reports').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
