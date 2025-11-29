import { createClient } from '@supabase/supabase-js';

// دریافت آدرس و کلید سرویس از متغیرهای محیطی
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// جلوگیری از اجرای این کد در مرورگر (لایه محافظتی اضافی)
if (!supabaseServiceRoleKey && typeof window === 'undefined') {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined on the server.');
}

// ساخت کلاینت ادمین با دسترسی کامل (Bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});