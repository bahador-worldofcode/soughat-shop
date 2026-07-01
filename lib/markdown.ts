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

export function postToMarkdown(post: any, locale: string) {
  const isEn = locale === 'en';
  const title = isEn ? (post.title_en || post.title) : post.title;
  const content = isEn ? (post.content_en || post.content) : post.content;
  const summary = isEn ? (post.summary_en || post.summary) : post.summary;
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  if (summary) {
    lines.push(`> ${summary}`);
    lines.push('');
  }
  if (post.image) {
    lines.push(`![${title}](${post.image})`);
    lines.push('');
  }
  lines.push(content || '');
  lines.push('');
  lines.push('---');
  lines.push(`Canonical URL: ${siteUrl}/${locale}/blog/${post.slug}`);

  return lines.join('\n');
}