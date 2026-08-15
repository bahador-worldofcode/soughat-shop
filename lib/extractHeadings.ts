import { stripHtmlToText } from '@/lib/sanitizeHtml';

// ==========================================================================
// این تابع، تیترهای سطح ۲ (h2) را که روی‌شان id گذاشته شده از خودِ HTML خام
// محتوای پست (قبل از رندر) استخراج می‌کند تا برای ساخت «فهرست مطالب» سایدبار
// کنار مقاله (components/TableOfContents.tsx) استفاده شود.
//
// این کار سمت سرور و همراه با خودِ HTML صفحه انجام می‌شود (نه با جاوااسکریپت
// سمت کاربر بعد از لود صفحه)، پس فهرست مطالب همون لحظه‌ی اول رندر آماده‌ست و
// هیچ چشمک یا layout shift ای نداره.
//
// فقط h2 هایی که id دارند (یعنی همان‌هایی که در محتوای پست به‌صورت
// <h2 id="sec-1">...</h2> نوشته شده‌اند) در فهرست مطالب ظاهر می‌شوند؛ h2
// بدون id (مثلاً در پست‌های قدیمی‌تر که هنوز این ساختار را ندارند) به‌سادگی
// نادیده گرفته می‌شود، پس این تابع برای همه‌ی پست‌ها (قدیمی و جدید) کاملاً
// امن است و چیزی را خراب نمی‌کند — فقط وقتی headings خالی برگردد،
// TableOfContents خودش تصمیم می‌گیرد که اصلاً چیزی رندر نکند.
// ==========================================================================

export interface Heading {
  id: string;
  text: string;
}

export function extractHeadings(html: string): Heading[] {
  if (!html) return [];

  const headings: Heading[] = [];
  const regex = /<h2\b[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h2>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const id = match[1];
    const text = stripHtmlToText(match[2]);
    if (id && text) {
      headings.push({ id, text });
    }
  }

  return headings;
}