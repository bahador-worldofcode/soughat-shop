'use client';
import { useEffect, useState, useRef } from 'react';
import { Bell, X, Trash2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useTranslations, useLocale } from 'next-intl';

interface Notif {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// 🆕 فرمت‌کننده‌ی امنِ تاریخ: اگه created_at خالی/نامعتبر باشه (مثلاً بعد از
// یک تغییر دیتابیس یک ردیف بدون created_at ساخته شده باشه)، به‌جای اینکه
// new Date(...).toLocaleDateString(...) یک RangeError پرتاب کنه و کل سایت
// (چون Header بیرون از error.tsx رندر می‌شه) کرش کنه، فقط یک رشته‌ی خالی
// برمی‌گردونیم و رندر ادامه پیدا می‌کنه.
function formatNotifDate(value: string | null | undefined, isEn: boolean) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    // 🔧 نکته‌ی مهم: toLocaleDateString گزینه‌ی timeStyle رو قبول نمی‌کنه و
    // همیشه با آن خطا می‌ده («Invalid option: timeStyle»)، چون فقط برای
    // نمایش بخش تاریخه. برای نمایش تاریخ + ساعت با هم باید از toLocaleString
    // استفاده کنیم (نه toLocaleDateString) — این یکی dateStyle و timeStyle
    // رو با هم قبول می‌کنه.
    return d.toLocaleString(isEn ? 'en-US' : 'fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '';
  }
}

export default function NotificationBell() {
  const t = useTranslations('Notifications');
  const locale = useLocale();
  const isEn = locale === 'en';
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const load = async () => {
    try {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) return;
      const { data, error } = await (supabaseBrowser.from('notifications') as any)
        .select('id, title, message, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // 🆕 اگه سوپابیس خطا برگردوند (مثلاً ستونی که تازگی در دیتابیس تغییر
      // دادیم دیگه وجود نداره یا اسمش عوض شده)، فقط لاگ می‌کنیم و از تابع
      // خارج می‌شیم؛ به‌جای اینکه با دیتای خراب/نامعتبر setItems صدا بزنیم.
      if (error) {
        console.error('NotificationBell: error loading notifications', error);
        return;
      }
      if (data) setItems(data);
    } catch (err) {
      // 🆕 هر خطای غیرمنتظره‌ی دیگه (شبکه، پارس و ...) هم اینجا قورت داده
      // می‌شه تا هیچ‌وقت باعث کرش کل سایت نشه.
      console.error('NotificationBell: unexpected error in load()', err);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // هر ۶۰ ثانیه یک‌بار چک کن
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    const unread = items.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await (supabaseBrowser.from('notifications') as any)
        .update({ is_read: true })
        .in('id', unread.map((n) => n.id));
    } catch (err) {
      console.error('NotificationBell: error in markAllRead()', err);
    }
  };

  // حذفِ تکیِ یک نوتیف. تاریخچه‌ی کاملِ تراکنش‌ها (واریز/برداشت/تنظیمِ دستی)
  // همیشه توی جدولِ مستقلِ wallet_transactions و تبِ کیف‌پولِ پروفایل باقی
  // می‌مونه — این جدولِ notifications فقط یک «اعلانِ لحظه‌ای» بوده، نه دفترِکل،
  // پس حذفش از اینجا هیچ داده‌ی مالی‌ای رو گم نمی‌کنه.
  const dismissOne = async (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await (supabaseBrowser.from('notifications') as any).delete().eq('id', id);
    } catch (err) {
      console.error('NotificationBell: error in dismissOne()', err);
    }
  };

  // پاک‌کردنِ همه‌ی نوتیف‌های همین کاربر، با یک تاییدِ ساده تا کسی اشتباهی نزنه.
  const clearAll = async () => {
    if (items.length === 0 || clearing) return;
    if (!window.confirm(t('confirm_clear_all'))) return;

    try {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) return;

      setClearing(true);
      setItems([]);
      await (supabaseBrowser.from('notifications') as any).delete().eq('user_id', user.id);
    } catch (err) {
      console.error('NotificationBell: error in clearAll()', err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) markAllRead(); }}
        aria-label={t('aria_label')}
        className="relative p-2.5 hover:bg-blue-50 rounded-xl transition-colors group border border-transparent hover:border-blue-100"
      >
        <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50 font-[family-name:var(--font-vazir)]">
          {items.length > 0 && (
            <div className="sticky top-0 flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-white">
              <span className="text-xs font-bold text-gray-400">{t('aria_label')}</span>
              <button
                onClick={clearAll}
                disabled={clearing}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                {t('clear_all')}
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('empty')}</p>
          ) : (
            items.map((n) => (
              <div key={n.id} className={`relative p-3 pe-8 border-b border-gray-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                <p className="text-sm font-bold text-gray-800">{n.title ?? ''}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message ?? ''}</p>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {formatNotifDate(n.created_at, isEn)}
                </p>
                <button
                  onClick={() => dismissOne(n.id)}
                  aria-label={t('dismiss_aria')}
                  className="absolute top-2.5 end-2 text-gray-300 hover:text-red-500 active:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}