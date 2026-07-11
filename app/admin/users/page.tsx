'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Loader2,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  Calendar,
  Package,
  DollarSign,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Users as UsersIcon,
  UserCog,
  KeyRound,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  is_admin: boolean;
  provider: string | null; // تسک ۳۶: روش ورود ('google' یا 'email')
  email_confirmed: boolean; // تسک ۳۶: آیا ایمیل تایید شده؟
  created_at: string;
  order_count: number;
  total_spent: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', country: '', is_admin: false });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setCurrentUserId(session?.user?.id ?? null);
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  };

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/users', { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطا در دریافت کاربران');
      setUsers(json.users as AdminUser[]);
    } catch (err: any) {
      setLoadError(err.message || 'خطای ناشناخته');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      country: user.country || '',
      is_admin: user.is_admin,
    });
    setSaveError('');
  };

  const closeEdit = () => {
    setEditingUser(null);
    setSaveError('');
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    setSaveError('');
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ id: editingUser.id, ...editForm }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطا در ذخیره تغییرات');

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...editForm } : u))
      );
      setEditingUser(null);
    } catch (err: any) {
      setSaveError(err.message || 'خطای ناشناخته');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطا در حذف کاربر');

      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'خطای ناشناخته');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term)
    );
  });

  const totalUsers = users.length;
  const totalRevenue = users.reduce((sum, u) => sum + (u.total_spent || 0), 0);
  const totalOrders = users.reduce((sum, u) => sum + (u.order_count || 0), 0);

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(iso)
      );
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center flex flex-col items-center">
        <Loader2 className="animate-spin mb-2" /> در حال دریافت لیست کاربران...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      {/* هدر */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مدیریت کاربران</h2>
          <p className="text-sm text-gray-500">لیست کامل مشتری‌های ثبت‌نام‌کرده و آمار سفارش‌هایشان</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو (نام، ایمیل، تلفن)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl">
            <UsersIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">تعداد کل کاربران</p>
            <p className="text-xl font-bold text-gray-800">{totalUsers.toLocaleString('fa-IR')}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl">
            <Package className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">سفارش‌های ثبت‌شده با حساب</p>
            <p className="text-xl font-bold text-gray-800">{totalOrders.toLocaleString('fa-IR')}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-xl">
            <DollarSign className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">جمع خرید این کاربران (دلار)</p>
            <p className="text-xl font-bold text-gray-800">${totalRevenue.toLocaleString('en-US')}</p>
          </div>
        </div>
      </div>

      {/* جدول کاربران */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">کاربر</th>
                <th className="px-6 py-4 font-medium">روش ورود</th>
                <th className="px-6 py-4 font-medium">ایمیل تاییدشده؟</th>
                <th className="px-6 py-4 font-medium">تماس</th>
                <th className="px-6 py-4 font-medium">کشور</th>
                <th className="px-6 py-4 font-medium">عضویت از</th>
                <th className="px-6 py-4 font-medium">سفارش‌ها</th>
                <th className="px-6 py-4 font-medium text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    کاربری یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {user.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-gray-400">
                              {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-800 truncate">
                              {user.full_name || '(بدون نام)'}
                            </span>
                            {user.is_admin && (
                              <span
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                title="این کاربر دسترسی ادمین دارد"
                              >
                                <ShieldCheck className="h-3 w-3" />
                                ادمین
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 truncate">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            {user.email || '---'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.provider === 'email' ? (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                          <KeyRound className="h-3 w-3" />
                          ایمیل/رمز
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                          <Mail className="h-3 w-3" />
                          گوگل
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.email_confirmed ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          تاییدشده
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold">
                          <XCircle className="h-4 w-4" />
                          تاییدنشده
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700 font-mono dir-ltr justify-end">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {user.phone || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Globe className="h-3.5 w-3.5 text-gray-400" />
                        {user.country || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-bold text-gray-800">{user.order_count}</span>
                        <span className="text-gray-400"> سفارش</span>
                        {user.total_spent > 0 && (
                          <div className="text-xs text-green-600 font-bold">${user.total_spent.toLocaleString('en-US')}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ویرایش"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={user.id === currentUserId}
                          title={user.id === currentUserId ? 'نمی‌توانید حساب خودتان را حذف کنید' : 'حذف کاربر'}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال ویرایش کاربر */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserCog className="h-5 w-5 text-blue-600" />
                ویرایش کاربر
              </h3>
              <button onClick={closeEdit}>
                <X className="h-5 w-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {saveError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">شماره تماس</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">کشور محل اقامت</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm((p) => ({ ...p, country: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editForm.is_admin}
                    disabled={editingUser.id === currentUserId}
                    onChange={(e) => setEditForm((p) => ({ ...p, is_admin: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    دسترسی ادمین به این کاربر بدهیم
                  </span>
                </label>
                {editingUser.id === currentUserId && (
                  <p className="text-[11px] text-gray-400 mt-1">نمی‌توانید دسترسی ادمین خودتان را از این‌جا تغییر دهید.</p>
                )}
                {editForm.is_admin && editingUser.id !== currentUserId && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    این کاربر بعد از ذخیره، دسترسی کامل به پنل مدیریت خواهد داشت.
                  </p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-2">
              <button
                onClick={closeEdit}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تایید حذف کاربر */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">حذف «{deleteTarget.full_name || deleteTarget.email}»؟</h3>
            <p className="text-sm text-gray-500 mb-2">
              حساب کاربری و آدرس‌های ذخیره‌شده‌اش کاملاً حذف می‌شود و قابل بازگشت نیست.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              سفارش‌های قبلی‌اش برای سوابق مالی حذف نمی‌شوند، فقط از این حساب جدا می‌شوند.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50"
              >
                انصراف
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                بله، حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}