import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/verifyAdmin';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PostgREST از کاما و پرانتز داخلِ فیلترهای or() برای جدا کردنِ شرط‌ها
// استفاده می‌کنه؛ برای اینکه عبارتِ جستجوی ادمین هیچ‌وقت این فیلتر رو
// خراب نکنه، این چند کاراکترِ خاص رو از ورودی حذف می‌کنیم.
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()%]/g, '').trim();
}

// ─── لیستِ صفحه‌بندی‌شده‌ی فاکتورهای شارژ کیف‌پول ──────────────────────
// قبلاً این مسیر همه‌ی فاکتورهای شارژ (از اولین روزِ فروشگاه تا الان)
// رو یک‌جا برمی‌گردوند و جستجو هم فقط سمتِ کلاینت (روی همون داده‌ی
// کامل) انجام می‌شد. حالا هم صفحه‌بندی و هم جستجو سمتِ سرور انجام
// می‌شه، پس هربار فقط چند فاکتور (نه کلِ تاریخچه) از دیتابیس خونده
// می‌شه.
export async function GET(request: Request) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get('search')?.trim() || '';
    const search = sanitizeSearchTerm(rawSearch);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE)
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from('wallet_topups')
      .select('*, profiles(full_name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      const isUuid = UUID_RE.test(search);

      // جستجو (نام/ایمیل) روی ستون‌های جدولِ profiles انجام می‌شه، نه
      // خودِ wallet_topups؛ پس اول شناسه‌ی کاربرهای منطبق رو پیدا
      // می‌کنیم و بعد فقط فاکتورهای همون‌ها رو می‌خونیم.
      const { data: matchedProfiles, error: profileSearchError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

      if (profileSearchError) throw profileSearchError;
      const matchingUserIds = (matchedProfiles ?? []).map((p) => p.id);

      if (matchingUserIds.length > 0 && isUuid) {
        query = query.or(`user_id.in.(${matchingUserIds.join(',')}),id.eq.${search}`);
      } else if (matchingUserIds.length > 0) {
        query = query.in('user_id', matchingUserIds);
      } else if (isUuid) {
        query = query.eq('id', search);
      } else {
        // نه مشتری‌ای با این نام/ایمیل پیدا شد، نه خودِ عبارت شکلِ یک
        // کدِ فاکتورِ معتبر رو داره — پس نتیجه‌ای هم نباید برگرده.
        return NextResponse.json({ topups: [], total: 0, page, pageSize, totalPages: 1 });
      }
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    const total = count ?? 0;

    return NextResponse.json({
      topups: data ?? [],
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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