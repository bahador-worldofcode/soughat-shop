import { containsHtmlTags } from '@/lib/sanitizeHtml';

export function productToMarkdown(product: any, locale: string, categoryName?: string) {
  const isEn = locale === 'en';
  const title = isEn ? (product.title_en || product.title) : product.title;
  const description = isEn ? (product.description_en || product.description) : product.description;
  const features: string[] = isEn ? (product.features_en || product.features || []) : (product.features || []);
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`> Category: ${categoryName || product.category} | Price: $${product.price} USD | Status: In Stock`);
  lines.push('');
  if (product.image) {
    lines.push(`![${title}](${product.image})`);
    lines.push('');
  }
  lines.push('## Description');
  lines.push('');
  lines.push(description || '');
  lines.push('');
  if (features && features.length > 0) {
    lines.push('## Features');
    lines.push('');
    features.forEach((f) => lines.push(`- ${f}`));
    lines.push('');
  }
  lines.push('## Purchase');
  lines.push('');
  lines.push(`- Canonical URL: ${siteUrl}/${locale}/products/${product.slug}`);
  lines.push(`- Price (USD): ${product.price}`);
  lines.push(`- Accepted payment: USDT (crypto), other fiat-equivalent via checkout`);
  lines.push(`- Delivery: Inside Iran only`);
  lines.push('');
  lines.push('---');
  lines.push(`Machine-readable API discovery: ${siteUrl}/.well-known/api-catalog`);

  return lines.join('\n');
}

// ==========================================================================
// حالا که ادمین می‌تواند در فیلد محتوا مستقیماً HTML بنویسد (رنگ، بولد، لینک)،
// این فید مارک‌داون (برای ایجنت‌ها/ربات‌ها) نباید تگ‌های خام HTML را نشان دهد.
// این تابع HTML را به یک نسخه‌ی ساده و خوانا (نزدیک به markdown) تبدیل می‌کند.
// برای پست‌های قدیمی (بدون تگ HTML) هیچ تغییری اعمال نمی‌شود.
// ==========================================================================
function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'");
}

function htmlContentToMarkdown(html: string): string {
  let text = html;

  // تیترها
  text = text.replace(/<h2[^>]*>/gi, '\n\n## ').replace(/<\/h2>/gi, '\n\n');
  text = text.replace(/<h3[^>]*>/gi, '\n\n### ').replace(/<\/h3>/gi, '\n\n');
  text = text.replace(/<h4[^>]*>/gi, '\n\n#### ').replace(/<\/h4>/gi, '\n\n');
  text = text.replace(/<h5[^>]*>/gi, '\n\n##### ').replace(/<\/h5>/gi, '\n\n');

  // بولد و ایتالیک
  text = text.replace(/<(strong|b)[^>]*>/gi, '**').replace(/<\/(strong|b)>/gi, '**');
  text = text.replace(/<(em|i)[^>]*>/gi, '_').replace(/<\/(em|i)>/gi, '_');

  // لینک‌ها: <a href="URL">متن</a> -> [متن](URL)
  text = text.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // آیتم‌های لیست
  text = text.replace(/<li[^>]*>/gi, '- ').replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/?(ul|ol)[^>]*>/gi, '\n');

  // پاراگراف‌ها و خطوط جدید
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n').replace(/<p[^>]*>/gi, '');
  text = text.replace(/<\/div>/gi, '\n').replace(/<div[^>]*>/gi, '');

  // هر تگ باقی‌مانده‌ای که پوشش داده نشده حذف می‌شود
  text = text.replace(/<[^>]+>/g, '');

  text = decodeBasicEntities(text);

  // فشرده کردن خطوط خالی اضافی
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export function postToMarkdown(post: any, locale: string) {
  const isEn = locale === 'en';
  const title = isEn ? (post.title_en || post.title) : post.title;
  const rawContent = isEn ? (post.content_en || post.content) : post.content;
  const content = containsHtmlTags(rawContent || '') ? htmlContentToMarkdown(rawContent) : rawContent;
  const summary = isEn ? (post.summary_en || post.summary) : post.summary;
  // ✅ تصویر بر اساس زبان، با بازگشت خودکار به تصویر اصلی اگر image_en خالی بود
  const image = isEn ? (post.image_en || post.image) : post.image;
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  if (summary) {
    lines.push(`> ${summary}`);
    lines.push('');
  }
  if (image) {
    lines.push(`![${title}](${image})`);
    lines.push('');
  }
  lines.push(content || '');
  lines.push('');
  lines.push('---');
  lines.push(`Canonical URL: ${siteUrl}/${locale}/blog/${post.slug}`);

  return lines.join('\n');
}