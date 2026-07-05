'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { Link2, Check, Share2 } from 'lucide-react';

type ShareButtonsProps = {
  url: string;
  title: string;
  isEn?: boolean;
};

type ShareNetwork = {
  name: string;
  icon: ReactElement;
  className: string;
  href?: string;
  onClick?: () => void;
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

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.415.56.217.96.477 1.382.899.421.421.68.82.898 1.381.166.422.36 1.057.415 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.249 1.805-.415 2.227a3.81 3.81 0 0 1-.899 1.382 3.81 3.81 0 0 1-1.381.898c-.422.166-1.057.36-2.227.415-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.805-.249-2.227-.415a3.81 3.81 0 0 1-1.382-.899 3.81 3.81 0 0 1-.898-1.381c-.166-.422-.36-1.057-.415-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.055-1.17.249-1.805.415-2.227.217-.56.477-.96.899-1.382a3.81 3.81 0 0 1 1.381-.898c.422-.166 1.057-.36 2.227-.415 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.332.014 7.052.072 5.775.131 4.905.333 4.14.63a5.98 5.98 0 0 0-2.16 1.408A5.98 5.98 0 0 0 .572 4.198C.276 4.964.074 5.834.015 7.111-.043 8.392-.057 8.8-.057 12.06s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.98 5.98 0 0 0 1.408 2.16 5.98 5.98 0 0 0 2.16 1.408c.765.297 1.636.499 2.913.558 1.28.058 1.688.072 4.948.072s3.667-.014 4.947-.072c1.277-.06 2.148-.261 2.913-.558a5.98 5.98 0 0 0 2.16-1.408 5.98 5.98 0 0 0 1.408-2.16c.297-.765.499-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.261-2.148-.558-2.913a5.98 5.98 0 0 0-1.408-2.16A5.98 5.98 0 0 0 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

export default function ShareButtons({ url, title, isEn = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [instaCopied, setInstaCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

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

  // نکته‌ی مهم: برخلاف واتساپ/تلگرام/ایکس/فیسبوک، اینستاگرام هیچ لینک رسمی
  // برای «اشتراک‌گذاری یک URL دلخواه» (نه در پست، نه در استوری از طریق وب)
  // ندارد. راه‌حل رایج و قابل‌اعتماد در همه‌ی سایت‌ها همین است: لینک مقاله
  // خودکار کپی می‌شود و اپ/سایت اینستاگرام باز می‌شود تا کاربر خودش لینک را
  // داخل استوری، بایو یا دایرکت پیست کند.
  const handleInstagramShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setInstaCopied(true);
      setTimeout(() => setInstaCopied(false), 4000);
    } catch {
      // اگر کپی خودکار پشتیبانی نشد، بازم اینستاگرام رو باز می‌کنیم
    }
    if (typeof window !== 'undefined') {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }
  };

  const networks: ShareNetwork[] = [
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
      name: 'Instagram',
      onClick: handleInstagramShare,
      icon: <InstagramIcon />,
      className: 'bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5] hover:brightness-110',
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

  return (
    <div dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold text-sm">
        <Share2 className="h-4 w-4 text-blue-500" />
        {isEn ? 'Share this article' : 'این مقاله رو با دیگران به اشتراک بذار'}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {networks.map((n) =>
          n.href ? (
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
          ) : (
            <button
              key={n.name}
              type="button"
              onClick={n.onClick}
              aria-label={`${isEn ? 'Share on' : 'اشتراک‌گذاری در'} ${n.name}`}
              className={`${n.className} text-white w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:shadow-lg transition-all duration-200`}
            >
              {n.icon}
            </button>
          )
        )}

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

      {instaCopied && (
        <p className="text-xs text-pink-600 mt-2">
          {isEn
            ? 'Link copied! Paste it into your Instagram story, bio, or DM.'
            : 'لینک کپی شد؛ توی استوری، بایو یا دایرکت اینستاگرامت پیستش کن!'}
        </p>
      )}
    </div>
  );
}