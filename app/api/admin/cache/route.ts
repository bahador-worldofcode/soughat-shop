// app/api/admin/cache/route.ts
// --------------------------------------------------------------
// API «مدیریت کش» پنل ادمین. صفحاتِ عمومیِ سایت (هوم، لیست/جزئیاتِ
// محصولات، لیست/جزئیاتِ وبلاگ) با revalidate زمانی (۶۰ ثانیه)
// کش می‌شوند. این یعنی بعد از هر تغییر توسط ادمین، مشتری‌ها ممکن
// است تا ۶۰ ثانیه نسخه‌ی قدیمی را ببینند. این Route Handler به
// ادمین اجازه می‌دهد با یک کلیک، کشِ سرور را فوراً و دستی خالی کند
// — دقیقاً مثل دکمه‌ی «Flush Cache» در Magento.
//
// امنیت: دقیقاً مثل بقیه‌ی API Routeهای زیر مسیر /api/admin، از
// همان تابع مشترک verifyAdmin استفاده می‌شود؛ یعنی فقط کاربرانی که
// profiles.is_admin = true دارند می‌توانند این Route را صدا بزنند.
// --------------------------------------------------------------

import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyAdmin } from '@/lib/verifyAdmin';

// زبان‌های سایت — چون هر مسیر با پیشوندِ زبان کش می‌شود
// (/fa/products و /en/products دو ورودیِ جداگانه در کشِ Next.js
// هستند)، باید هر دو را جداگانه revalidate کنیم.
const LOCALES = ['fa', 'en'] as const;

type CacheScope = 'home' | 'products' | 'blog' | 'all';

function revalidateHome() {
  LOCALES.forEach((locale) => {
    // صفحه‌ی اصلی: app/[locale]/(home)/page.tsx -> مسیر واقعی /fa یا /en
    revalidatePath(`/${locale}`, 'page');
  });
}

function revalidateProducts() {
  LOCALES.forEach((locale) => {
    // 'layout' یعنی هم لیست محصولات (/products) و هم صفحه‌ی
    // جزئیاتِ هر محصول (/products/[slug]) با هم پاک می‌شوند —
    // نیازی نیست تک‌تکِ اسلاگ‌های محصولات را جداگانه بدهیم.
    revalidatePath(`/${locale}/products`, 'layout');
  });

  // 🆕 صفحه‌ی لیست محصولات (app/[locale]/products/page.tsx) از این به بعد
  // کوئری‌های Supabase خودش را جدا با unstable_cache و این دو تگ کش
  // می‌کند. revalidatePath بالا فقط خروجیِ رندرشده‌ی صفحه را پاک می‌کند؛
  // این دو خط هم لازم‌اند تا خودِ داده‌های کش‌شده (لیست فیلترشده‌ی محصولات
  // و لیست دسته‌بندی‌ها) هم واقعاً تازه شوند، وگرنه ممکن است تا ۶۰ ثانیه‌ی
  // دیگر داده‌ی قدیمی از Data Cache برگردد.
  revalidateTag('products-list');
  revalidateTag('categories');
}

function revalidateBlog() {
  LOCALES.forEach((locale) => {
    revalidatePath(`/${locale}/blog`, 'layout');
  });

  // 🆕 لیستِ وبلاگ (app/[locale]/blog/page.tsx) هم از این به بعد کوئریِ
  // خودش را جدا با unstable_cache کش می‌کند؛ همون دلیلِ revalidateTag در
  // revalidateProducts بالا.
  revalidateTag('blog-list');
}

export async function POST(request: Request) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'عدم دسترسی! لطفاً وارد پنل شوید.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const scope: CacheScope = body?.scope ?? 'all';
    const slug: string | undefined = body?.slug;
    const type: 'products' | 'blog' | undefined = body?.type;

    const cleared: string[] = [];

    // پاک‌سازیِ یک آیتمِ خاص (مثلاً فقط همین محصول یا همین پست
    // وبلاگ که تازه ویرایش شده) — مفید برای وقتی ادمین می‌خواهد
    // بدون خالی‌کردنِ کلِ کش، فقط همین یکی را فوری تازه کند.
    if (slug && type === 'products') {
      LOCALES.forEach((locale) => revalidatePath(`/${locale}/products/${slug}`, 'page'));
      // 🆕 لیستِ محصولات هم ممکن است همین محصول را (با عنوان/قیمت/عکسِ
      // قدیمی) در کشِ خودش داشته باشد؛ برای هماهنگی این را هم تازه می‌کنیم.
      revalidateTag('products-list');
      cleared.push(`product:${slug}`);
    } else if (slug && type === 'blog') {
      LOCALES.forEach((locale) => revalidatePath(`/${locale}/blog/${slug}`, 'page'));
      revalidateTag('blog-list');
      cleared.push(`blog:${slug}`);
    } else {
      // پاک‌سازیِ کلِ یک بخش
      if (scope === 'home' || scope === 'all') {
        revalidateHome();
        cleared.push('home');
      }
      if (scope === 'products' || scope === 'all') {
        revalidateProducts();
        cleared.push('products');
      }
      if (scope === 'blog' || scope === 'all') {
        revalidateBlog();
        cleared.push('blog');
      }
    }

    return NextResponse.json({
      success: true,
      cleared,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}