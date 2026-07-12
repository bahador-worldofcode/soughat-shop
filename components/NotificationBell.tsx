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
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (!user) return;
    const { data } = await (supabaseBrowser.from('notifications') as any)
      .select('id, title, message, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setItems(data);
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
    await (supabaseBrowser.from('notifications') as any)
      .update({ is_read: true })
      .in('id', unread.map((n) => n.id));
  };

  // حذفِ تکیِ یک نوتیف. تاریخچه‌ی کاملِ تراکنش‌ها (واریز/برداشت/تنظیمِ دستی)
  // همیشه توی جدولِ مستقلِ wallet_transactions و تبِ کیف‌پولِ پروفایل باقی
  // می‌مونه — این جدولِ notifications فقط یک «اعلانِ لحظه‌ای» بوده، نه دفترِکل،
  // پس حذفش از اینجا هیچ داده‌ی مالی‌ای رو گم نمی‌کنه.
  const dismissOne = async (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await (supabaseBrowser.from('notifications') as any).delete().eq('id', id);
  };

  // پاک‌کردنِ همه‌ی نوتیف‌های همین کاربر، با یک تاییدِ ساده تا کسی اشتباهی نزنه.
  const clearAll = async () => {
    if (items.length === 0 || clearing) return;
    if (!window.confirm(t('confirm_clear_all'))) return;

    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (!user) return;

    setClearing(true);
    setItems([]);
    await (supabaseBrowser.from('notifications') as any).delete().eq('user_id', user.id);
    setClearing(false);
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
                <p className="text-sm font-bold text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {new Date(n.created_at).toLocaleDateString(isEn ? 'en-US' : 'fa-IR', { dateStyle: 'medium', timeStyle: 'short' })}
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