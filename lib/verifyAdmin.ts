// lib/verifyAdmin.ts
// --------------------------------------------------------------
// قفل امنیتی واقعیِ پنل ادمین.
//
// نسخه‌ی قبلی این تابع (که قبلاً به‌صورت جدا و تکراری توی چند تا
// API Route کپی شده بود) فقط چک می‌کرد که «آیا این توکن متعلق به یک
// کاربر واقعی سوپابیسه یا نه» — نه اینکه آیا آن کاربر ادمین است یا
// یک مشتری عادی. یعنی هر مشتری که حساب داشت، تئوریاً می‌توانست از
// این API Routeها هم استفاده کند.
//
// این نسخه علاوه بر معتبر بودن توکن، ستون profiles.is_admin را هم
// چک می‌کند. همه‌ی API Routeهای زیر مسیر /api/admin باید از همین
// تابع مشترک استفاده کنند، نه یک کپی محلی.
// --------------------------------------------------------------

import { supabaseAdmin } from './supabase-admin';

export async function verifyAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) return false;

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return false;

  // ۱) آیا این توکن اصلاً معتبر است و به یک کاربر واقعی اشاره می‌کند؟
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) return false;

  // ۲) آیا همان کاربر، توی profiles پرچم is_admin دارد؟ (نکته‌ی اصلیِ رفع باگ)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !profile) return false;

  return profile.is_admin === true;
}