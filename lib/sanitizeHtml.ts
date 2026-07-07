import DOMPurify from 'isomorphic-dompurify';

// ==========================================================================
// این فایل مسئول «تمیزکاری» کدهای HTML‌ای است که ادمین در فیلد محتوا می‌نویسد.
// چرا لازم است؟
// چون حالا محتوای پست می‌تواند شامل تگ‌های HTML واقعی باشد (رنگ، بولد، لینک و ...)
// باید مطمئن شویم فقط تگ‌ها و ویژگی‌های «امن» رندر می‌شوند و کد مخرب
// (مثل <script> یا onClick=...) هرگز به مرورگر مشتری فرستاده نمی‌شود.
// این فایل هم در صفحه‌ی عمومی وبلاگ (سرور) و هم در پیش‌نمایش پنل ادمین
// (کلاینت) استفاده می‌شود تا رفتار رندر همیشه یکسان باشد.
// ==========================================================================

const ALLOWED_TAGS = [
  'p', 'br', 'div', 'span',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'h2', 'h3', 'h4', 'h5',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'code', 'pre', 'hr',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'src', 'alt', 'title',
  'style', 'class',
];

// فقط این ویژگی‌های CSS داخل style="..." مجاز هستند (برای رنگ و بولد و ...)
const ALLOWED_STYLE_PROPS = [
  'color',
  'background-color',
  'font-weight',
  'font-style',
  'text-decoration',
  'font-size',
  'text-align',
];

function sanitizeStyleAttribute(styleValue: string): string {
  const declarations = styleValue.split(';').map((d) => d.trim()).filter(Boolean);
  const safe = declarations.filter((decl) => {
    const prop = decl.split(':')[0]?.trim().toLowerCase();
    return prop && ALLOWED_STYLE_PROPS.includes(prop);
  });
  return safe.join('; ');
}

// این هوک بعد از هر بار پاک‌سازی صدا زده می‌شود:
// ۱. ویژگی style را محدود به لیست بالا می‌کند
// ۲. به لینک‌هایی که target="_blank" دارند rel="noopener noreferrer" اضافه می‌کند
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'style' && data.attrValue) {
    data.attrValue = sanitizeStyleAttribute(data.attrValue);
  }
});

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * محتوای HTML وارد شده توسط ادمین را پاک‌سازی می‌کند تا فقط تگ‌ها/ویژگی‌های
 * امن (رنگ، بولد، لینک، تیتر، لیست و ...) باقی بمانند.
 */
export function sanitizePostHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  }) as unknown as string;
}

/**
 * تشخیص می‌دهد آیا محتوا حاوی تگ HTML واقعی هست یا نه.
 * پست‌های قدیمی با سینتکس markdown‌مانند قبلی (**بولد**، ## تیتر) نوشته شده‌اند
 * و هیچ تگ HTML‌ای ندارند؛ آن‌ها باید همچنان با پارسر قدیمی نمایش داده شوند.
 * پست‌های جدید که ادمین مستقیماً HTML می‌نویسد، تگ دارند و باید مستقیماً
 * (بعد از پاک‌سازی) رندر شوند.
 */
export function containsHtmlTags(content: string): boolean {
  if (!content) return false;
  return /<\/?[a-z][\s\S]*?>/i.test(content);
}

/**
 * محتوای HTML را به متن ساده (بدون تگ) تبدیل می‌کند — برای جاهایی که باید
 * فقط متنِ خام نمایش داده بشه (زیرتیتر صفحه، متا-دیسکریپشن و ...) و نه HTML.
 * بدون این تابع، اگر فیلدی مثل description حاوی تگ‌های واقعی HTML باشه
 * (مثلاً <h2>...</h2><p>...</p>)، چون این مکان‌ها HTML رو رندر نمی‌کنن (فقط
 * متن ساده نشون می‌دن)، خودِ تگ‌ها به صورت کد خام روی صفحه دیده می‌شن.
 */
export function stripHtmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<\/?[a-z][\s\S]*?>/gi, ' ') // حذف تگ‌ها
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}