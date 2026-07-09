'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bug, Clock, Link as LinkIcon, Loader2, Mail, Monitor, Trash2 } from 'lucide-react';

interface BugReport {
  id: string;
  name: string | null;
  contact: string | null;
  description: string;
  image_url: string | null;
  page_url: string | null;
  user_agent: string | null;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

const STATUS_OPTIONS: { value: BugReport['status']; label: string; className: string }[] = [
  { value: 'new', label: 'جدید', className: 'bg-red-50 text-red-600 border-red-200' },
  { value: 'in_progress', label: 'در حال بررسی', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'resolved', label: 'حل‌شده', className: 'bg-green-50 text-green-600 border-green-200' },
];

export default function AdminBugReportsPage() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | BugReport['status']>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data } = await supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setReports(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: BugReport['status']) => {
    setUpdatingId(id);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch('/api/admin/bug-reports', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });

    if (res.ok) {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } else {
      alert('خطا در تغییر وضعیت گزارش');
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این گزارش مطمئن هستید؟')) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch(`/api/admin/bug-reports?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert('خطا در حذف گزارش');
    }
  };

  const filteredReports = filter === 'all' ? reports : reports.filter((r) => r.status === filter);
  const statusMeta = (status: BugReport['status']) => STATUS_OPTIONS.find((s) => s.value === status)!;

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bug className="h-6 w-6 text-red-500" /> گزارش‌های باگ و مشکلات
          </h2>
          <p className="text-sm text-gray-500">گزارش‌های ارسالی مشتریان از فرم «گزارش باگ» در فوتر سایت</p>
        </div>
        <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
          {reports.filter((r) => r.status === 'new').length} گزارش جدید
        </div>
      </div>

      {/* فیلتر وضعیت */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
          }`}
        >
          همه ({reports.length})
        </button>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filter === opt.value ? `${opt.className} ring-2 ring-offset-1` : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
            }`}
          >
            {opt.label} ({reports.filter((r) => r.status === opt.value).length})
          </button>
        ))}
      </div>

      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Bug className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">گزارشی یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const meta = statusMeta(report.status);
            return (
              <div
                key={report.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                      <Bug className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-bold text-gray-900 block truncate">{report.name || 'کاربر ناشناس'}</span>
                      {report.contact && (
                        <a
                          href={report.contact.includes('@') ? `mailto:${report.contact}` : `tel:${report.contact}`}
                          className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 dir-ltr truncate"
                        >
                          <Mail className="h-3 w-3 flex-shrink-0" /> {report.contact}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap ${meta.className}`}>
                    {meta.label}
                  </span>
                </div>

                {/* Body */}
                <div className="flex-1 mb-4 space-y-3">
                  <p className="text-gray-700 text-sm leading-6 bg-gray-50 p-3 rounded-xl whitespace-pre-wrap">
                    {report.description}
                  </p>

                  {report.image_url && (
                    <a href={report.image_url} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={report.image_url}
                        alt="عکس ضمیمه گزارش"
                        className="w-full max-h-48 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  )}

                  {report.page_url && (
                    <a
                      href={report.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
                      dir="ltr"
                    >
                      <LinkIcon className="h-3 w-3 flex-shrink-0" /> {report.page_url}
                    </a>
                  )}

                  {report.user_agent && (
                    <p
                      className="text-[10px] text-gray-400 flex items-center gap-1 truncate"
                      dir="ltr"
                      title={report.user_agent}
                    >
                      <Monitor className="h-3 w-3 flex-shrink-0" /> {report.user_agent}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(report.created_at).toLocaleDateString('fa-IR')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={report.status}
                      disabled={updatingId === report.id}
                      onChange={(e) => updateStatus(report.id, e.target.value as BugReport['status'])}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-blue-400 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف گزارش"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
