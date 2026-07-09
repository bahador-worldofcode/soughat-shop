// lib/imageCompress.ts
// --------------------------------------------------------------
// عکس پروفایلی که کاربر از گوشی/کامپیوترش انتخاب می‌کند معمولاً چند
// مگابایت حجم دارد. چون در Supabase Storage سقف حجم را روی ۱۰۰ کیلوبایت
// گذاشته‌ایم (تا دیتابیس/استوریج سنگین نشود)، این فایل قبل از آپلود،
// عکس را در همان مرورگر کاربر (بدون نیاز به سرور) کوچک و فشرده می‌کند.
//
// روش کار: عکس را روی یک <canvas> می‌کشیم، ابعادش را به حداکثر ۵۱۲ پیکسل
// محدود می‌کنیم و به‌صورت JPEG با کیفیت کاهشی صادر می‌کنیم تا زیر سقف
// مجاز برسد.
// --------------------------------------------------------------

export const MAX_AVATAR_BYTES = 100 * 1024; // 100KB — باید با مقدار file_size_limit در profile_upgrade.sql یکی باشد
const MAX_DIMENSION = 512;

export class ImageCompressError extends Error {}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageCompressError('این فایل یک فایل تصویری معتبر نیست.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ImageCompressError('خطا در پردازش عکس.'))),
      'image/jpeg',
      quality
    );
  });
}

/**
 * فایل عکس ورودی را کوچک و فشرده می‌کند تا زیر MAX_AVATAR_BYTES بشود.
 * فقط jpeg/png/webp را می‌پذیرد (همان فرمت‌های مجاز در باکت avatars).
 */
export async function compressAvatarImage(file: File): Promise<Blob> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new ImageCompressError('فرمت عکس مجاز نیست. لطفاً از JPG، PNG یا WebP استفاده کنید.');
  }

  const img = await loadImage(file);

  let { width, height } = img;
  if (width > height && width > MAX_DIMENSION) {
    height = Math.round((height * MAX_DIMENSION) / width);
    width = MAX_DIMENSION;
  } else if (height > MAX_DIMENSION) {
    width = Math.round((width * MAX_DIMENSION) / height);
    height = MAX_DIMENSION;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageCompressError('مرورگر شما از پردازش عکس پشتیبانی نمی‌کند.');
  ctx.drawImage(img, 0, 0, width, height);

  // با کیفیت بالا شروع می‌کنیم و کم‌کم پایین می‌آوریم تا زیر سقف مجاز برسیم
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > MAX_AVATAR_BYTES && quality > 0.15) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > MAX_AVATAR_BYTES) {
    throw new ImageCompressError(
      'حتی بعد از فشرده‌سازی، عکس بیشتر از حد مجاز است. لطفاً عکس ساده‌تری انتخاب کنید.'
    );
  }

  return blob;
}

// --------------------------------------------------------------
// 🆕 فشرده‌سازی عکسِ فرم «گزارش باگ» (components/BugReportForm.tsx).
//
// برخلاف آواتار (که صرفاً باید کوچک و شمایلی بماند)، عکسِ گزارش باگ
// معمولاً یک اسکرین‌شات از خطاست و باید متن/جزئیاتِ داخلش خوانا بماند؛
// برای همین ابعاد و سقف حجمِ بزرگ‌تری نسبت به آواتار در نظر گرفته‌ایم.
//
// نکته‌ی مهم: MAX_BUG_REPORT_IMAGE_BYTES باید دقیقاً با دو جای دیگر
// همگام بماند تا کاربر هیچ‌وقت با خطای گمراه‌کننده مواجه نشود:
//   ۱) file_size_limit باکت 'bug-reports' در supabase/bug_reports.sql
//   ۲) MAX_IMAGE_BYTES در app/api/bug-reports/route.ts (چک نهاییِ سرور)
// --------------------------------------------------------------
export const MAX_BUG_REPORT_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const BUG_REPORT_MAX_DIMENSION = 1600;

/**
 * عکسِ ضمیمه‌ی گزارشِ باگ را در صورت نیاز کوچک/فشرده می‌کند تا زیر
 * MAX_BUG_REPORT_IMAGE_BYTES برسد. اگر فایل انتخابی از قبل کوچک‌تر از
 * سقف مجاز بود، همان فایل اصلی (بدون افت کیفیت) برگردانده می‌شود.
 */
export async function compressBugReportImage(file: File): Promise<Blob> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new ImageCompressError('فرمت عکس مجاز نیست. لطفاً از JPG، PNG یا WebP استفاده کنید.');
  }

  // اگر عکس همین الان هم زیر سقف مجاز بود، نیازی به فشرده‌سازی نیست
  // (کیفیت اصلی/فرمت اصلی حفظ می‌شود)
  if (file.size <= MAX_BUG_REPORT_IMAGE_BYTES) {
    return file;
  }

  const img = await loadImage(file);

  let { width, height } = img;
  if (width > height && width > BUG_REPORT_MAX_DIMENSION) {
    height = Math.round((height * BUG_REPORT_MAX_DIMENSION) / width);
    width = BUG_REPORT_MAX_DIMENSION;
  } else if (height > BUG_REPORT_MAX_DIMENSION) {
    width = Math.round((width * BUG_REPORT_MAX_DIMENSION) / height);
    height = BUG_REPORT_MAX_DIMENSION;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageCompressError('مرورگر شما از پردازش عکس پشتیبانی نمی‌کند.');
  ctx.drawImage(img, 0, 0, width, height);

  // برای اسکرین‌شات، کیفیت را کمتر از آواتار افت نمی‌دهیم (حداقل ۰.۳)
  // تا متنِ داخل عکسِ خطا همچنان خوانا بماند
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > MAX_BUG_REPORT_IMAGE_BYTES && quality > 0.3) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > MAX_BUG_REPORT_IMAGE_BYTES) {
    throw new ImageCompressError(
      'حتی بعد از فشرده‌سازی، عکس بیشتر از حد مجاز است. لطفاً عکس ساده‌تری انتخاب کنید.'
    );
  }

  return blob;
}
