'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, MessageSquare, User, Clock, Phone, Mail } from 'lucide-react';

interface Message {
  id: string;
  user_contact: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این پیام مطمئن هستید؟')) return;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessages(messages.filter(m => m.id !== id));
    } else {
      alert('خطا در حذف پیام');
    }
  };

  // تشخیص اینکه تماس ایمیل است یا شماره
  const getContactLink = (contact: string) => {
    if (contact.includes('@')) return `mailto:${contact}`;
    return `tel:${contact}`;
  };

  if (loading) return <div className="p-10 text-center">در حال بارگذاری صندوق پیام...</div>;

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">پیام‌های مشتریان</h2>
           <p className="text-sm text-gray-500">لیست تیکت‌ها و پیام‌های ارسالی از ویجت پشتیبانی</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            {messages.length} پیام دریافت شده
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">صندوق پیام خالی است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                
                {/* Header: Contact Info */}
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                        <span className="text-xs text-gray-500 block">ارسال کننده:</span>
                        <a 
                            href={getContactLink(msg.user_contact)} 
                            className="font-bold text-gray-900 hover:text-blue-600 truncate block dir-ltr text-right"
                        >
                            {msg.user_contact}
                        </a>
                    </div>
                </div>

                {/* Body: Content */}
                <div className="flex-1 mb-4">
                    <p className="text-gray-700 text-sm leading-6 bg-gray-50 p-3 rounded-xl min-h-[80px]">
                        {msg.content}
                    </p>
                </div>

                {/* Footer: Date & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(msg.created_at).toLocaleDateString('fa-IR')}</span>
                        <span className="mx-1">-</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>

                    <div className="flex gap-2">
                        {/* دکمه پاسخ سریع */}
                        <a 
                            href={getContactLink(msg.user_contact)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="پاسخ دادن"
                        >
                            {msg.user_contact.includes('@') ? <Mail className="h-4 w-4"/> : <Phone className="h-4 w-4"/>}
                        </a>

                        {/* دکمه حذف */}
                        <button 
                            onClick={() => handleDelete(msg.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف پیام"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}