'use client';
import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useTranslations } from 'next-intl';

interface Notif {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const t = useTranslations('Notifications');
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
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
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('empty')}</p>
          ) : (
            items.map((n) => (
              <div key={n.id} className={`p-3 border-b border-gray-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                <p className="text-sm font-bold text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}