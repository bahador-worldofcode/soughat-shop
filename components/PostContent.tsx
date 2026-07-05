import { sanitizePostHtml, containsHtmlTags } from '@/lib/sanitizeHtml';

// ==========================================================================
// این کامپوننت، محتوای هر پست را نمایش می‌دهد.
//
// دو حالت داریم:
// ۱. پست‌های قدیمی: با همان سینتکس ساده‌ی قبلی نوشته شده‌اند (**بولد**، ## تیتر،
//    [متن](لینک)). این‌ها هیچ تگ HTML واقعی ندارند، پس با همان پارسر قدیمی
//    (renderLegacyMarkdown) نمایش داده می‌شوند تا چیزی خراب نشود.
// ۲. پست‌های جدید: ادمین مستقیماً کد HTML می‌نویسد (<b>، <span style="color:...">،
//    <a href="...">). این‌ها تگ HTML دارند، پس بعد از پاک‌سازی امنیتی
//    (sanitizePostHtml) مستقیماً به صورت HTML رندر می‌شوند.
// ==========================================================================

function parseInlineStyles(text: string) {
  if (!text) return null;
  const parts = text.split(/(\[.*?\]\(.*?\)|https?:\/\/[^\s]+|\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-bold hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
    }
    if (part.match(/^https?:\/\//)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 break-all hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function renderLegacyMarkdown(text: string) {
  if (!text) return null;
  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return <br key={index} />;

    if (line.startsWith('#### ')) {
      return (
        <h4 key={index} className="text-base md:text-lg font-extrabold text-gray-800 mt-6 mb-2">
          {parseInlineStyles(line.replace('#### ', ''))}
        </h4>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-lg md:text-xl font-bold text-gray-800 mt-8 mb-3 pr-2 border-r-2 border-blue-200">
          {parseInlineStyles(line.replace('### ', ''))}
        </h3>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-xl md:text-2xl font-bold text-gray-900 mt-10 mb-4 border-r-4 border-blue-600 pr-4 leading-tight">
          {parseInlineStyles(line.replace('## ', ''))}
        </h2>
      );
    }

    const isList = line.match(/^(\d+\.|-)\s/);
    if (isList) {
      return (
        <div key={index} className="flex gap-2 mb-2 pr-4 md:pr-8 items-start">
          <span className="text-blue-500 font-bold mt-1.5 text-xs">●</span>
          <p className="text-gray-700 leading-8 text-justify">
            {parseInlineStyles(line.replace(/^(\d+\.|-)\s/, ''))}
          </p>
        </div>
      );
    }

    return (
      <p key={index} className="mb-2 leading-7 text-justify text-gray-700">
        {parseInlineStyles(line)}
      </p>
    );
  });
}

export default function PostContent({ content, dir = 'rtl' }: { content: string; dir?: 'rtl' | 'ltr' }) {
  if (!content) return null;

  if (containsHtmlTags(content)) {
    const clean = sanitizePostHtml(content);
    return (
      <div
        className="post-content"
        dir={dir}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  return <div dir={dir}>{renderLegacyMarkdown(content)}</div>;
}