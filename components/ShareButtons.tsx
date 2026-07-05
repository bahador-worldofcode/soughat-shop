'use client';

import { useEffect, useState } from 'react';
import { Link2, Check, Share2 } from 'lucide-react';

type ShareButtonsProps = {
  url: string;
  title: string;
  isEn?: boolean;
};

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.868-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.46 3.485 1.334 5.003L2 22l5.116-1.341a9.958 9.958 0 0 0 4.888 1.28h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.929-7.07a9.935 9.935 0 0 0-7.072-2.869zm0 18.17h-.003a8.24 8.24 0 0 1-4.194-1.148l-.301-.179-3.037.797.811-2.96-.196-.304a8.223 8.223 0 0 1-1.264-4.379c0-4.552 3.705-8.256 8.258-8.256a8.2 8.2 0 0 1 5.837 2.419 8.2 8.2 0 0 1 2.417 5.841c-.001 4.552-3.705 8.169-8.328 8.169z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M21.947 4.665a1.35 1.35 0 0 0-1.37-.234L2.98 11.15c-.905.353-.899 1.639.01 1.984l4.475 1.706 1.723 5.55c.156.502.79.658 1.16.286l2.436-2.44 4.652 3.42c.598.44 1.457.11 1.6-.617l3.06-15.31a1.35 1.35 0 0 0-.15-1.064zM9.348 13.9l-3.63-1.384 11.928-6.55L9.348 13.9zm.99 4.86-.556-1.792 1.44 1.052-.884.74zm5.917.29-4.42-3.25 6.94-6.51-2.52 9.76z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.508 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.462h-1.26c-1.243 0-1.63.771-1.63 1.562v1.876h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z"/>
    </svg>
  );
}

export default function ShareButtons({ url, title, isEn = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const networks = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <WhatsAppIcon />,
      className: 'bg-[#25D366] hover:bg-[#20BD5A]',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <TelegramIcon />,
      className: 'bg-[#26A5E4] hover:bg-[#2296D1]',
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <XIcon />,
      className: 'bg-black hover:bg-gray-800',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FacebookIcon />,
      className: 'bg-[#1877F2] hover:bg-[#1466D8]',
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // روی مرورگرهای خیلی قدیمی که clipboard API ندارن، بی‌صدا رد می‌شیم؛
      // دکمه‌های شبکه‌های اجتماعی همچنان کار می‌کنن
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // کاربر شیت اشتراک‌گذاری رو بسته یا کنسل کرده — نیازی به هندل کردن نیست
    }
  };

  return (
    <div dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-sm">
        <Share2 className="h-4 w-4 text-blue-500" />
        {isEn ? 'Share this article' : 'این مقاله رو با دیگران به اشتراک بذار'}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {networks.map((n) => (
          <a
            key={n.name}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${isEn ? 'Share on' : 'اشتراک‌گذاری در'} ${n.name}`}
            className={`${n.className} text-white w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:shadow-lg transition-all duration-200`}
          >
            {n.icon}
          </a>
        ))}

        <button
          type="button"
          onClick={handleCopy}
          aria-label={isEn ? 'Copy link' : 'کپی لینک'}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-md hover:scale-110 transition-all duration-200"
        >
          {copied ? <Check className="h-5 w-5 text-green-600" /> : <Link2 className="h-5 w-5" />}
        </button>

        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-4 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:scale-105 transition-all duration-200"
          >
            <Share2 className="h-4 w-4" />
            {isEn ? 'More' : 'بیشتر'}
          </button>
        )}
      </div>

      {copied && (
        <p className="text-xs text-green-600 mt-2">
          {isEn ? 'Link copied to clipboard!' : 'لینک کپی شد!'}
        </p>
      )}
    </div>
  );
}