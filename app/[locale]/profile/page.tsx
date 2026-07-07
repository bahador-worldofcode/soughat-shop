// app/[locale]/profile/page.tsx
// --------------------------------------------------------------
// صفحهٔ پروفایل کاربری (Customer Profile) — نسخهٔ کامل و حرفه‌ای
// شامل ۳ تب:
//   ۱) اطلاعات حساب: نام، شماره تماس، عکس پروفایل (آپلود واقعی فایل،
//      نه لینک)، ایمیل (فقط خواندنی)
//   ۲) آدرس‌های ذخیره‌شده: دفترچه آدرس گیرنده‌ها برای سفارش‌های بعدی
//   ۳) سفارش‌های من: تاریخچه‌ی سفارش‌هایی که با همین حساب ثبت شده‌اند
// --------------------------------------------------------------

'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { compressAvatarImage, ImageCompressError } from '@/lib/imageCompress';
import Toast from '@/components/Toast';
import {
  Loader2,
  User as UserIcon,
  AlertCircle,
  UserCircle2,
  LogOut,
  Camera,
  Phone,
  MapPin,
  Package,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ExternalLink,
  Globe,
} from 'lucide-react';

// ---------------------------------------------------------------
// انواع داده‌ها
// ---------------------------------------------------------------
interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  created_at: string;
}

interface SavedAddress {
  id: string;
  label: string;
  receiver_name: string;
  receiver_phone: string;
  city: string;
  address: string;
  is_default: boolean;
  created_at: string;
}

interface OrderRow {
  id: string;
  status: string;
  city: string;
  total_price: number;
  display_fiat_amount: number | null;
  display_currency: string | null;
  items: { name?: string; quantity?: number }[] | null;
  created_at: string;
}

type TabKey = 'account' | 'addresses' | 'orders';

const emptyAddressForm = {
  label: '',
  receiver_name: '',
  receiver_phone: '',
  city: '',
  address: '',
};

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const tAuth = useTranslations('Auth');
  const tTrack = useTranslations('Track');
  const locale = useLocale();
  const router = useRouter();

  // ── وضعیت کلی صفحه ──────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<TabKey>('account');
  const [toast, setToast] = useState({ show: false, message: '' });

  // ── تب «اطلاعات حساب» ───────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── تب «آدرس‌های ذخیره‌شده» ──────────────────────────────────
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, boolean>>({});
  const [addressSaving, setAddressSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedAddress | null>(null);

  // ── تب «سفارش‌های من» ────────────────────────────────────────
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(false);

  // ── بارگذاری اولیه‌ی پروفایل ─────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setLoadError(false);

      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session?.user) {
        setNotLoggedIn(true);
        setLoading(false);
        return;
      }

      const { data, error } = await (supabaseBrowser.from('profiles') as any)
        .select('id, email, full_name, avatar_url, phone, country, created_at')
        .eq('id', session.user.id)
        .single();

      if (error || !data) {
        setLoadError(true);
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
      setFullName(data.full_name ?? '');
      setPhone(data.phone ?? '');
      setCountry(data.country ?? '');
      setAvatarUrl(data.avatar_url ?? null);
      setLoading(false);
    };

    loadProfile();
  }, []);

  // ── بارگذاری تنبل (Lazy) آدرس‌ها و سفارش‌ها، فقط وقتی تب باز می‌شود ──
  useEffect(() => {
    if (tab === 'addresses' && addresses === null && !addressesLoading) {
      loadAddresses();
    }
    if (tab === 'orders' && orders === null && !ordersLoading) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadAddresses = async () => {
    setAddressesLoading(true);
    const { data, error } = await (supabaseBrowser.from('saved_addresses') as any)
      .select('id, label, receiver_name, receiver_phone, city, address, is_default, created_at')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAddresses(data as SavedAddress[]);
    } else {
      setAddresses([]);
    }
    setAddressesLoading(false);
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(false);
    try {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      const res = await fetch('/api/profile/orders', {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'error');
      setOrders(json.orders as OrderRow[]);
    } catch {
      setOrdersError(true);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // ── ذخیره‌ی نام و شماره تماس ──────────────────────────────────
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await (supabaseBrowser.from('profiles') as any)
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        country: country.trim() || null,
      })
      .eq('id', profile.id);

    setSaving(false);

    if (error) {
      setToast({ show: true, message: error.message });
      return;
    }

    setProfile((prev) =>
      prev
        ? { ...prev, full_name: fullName.trim() || null, phone: phone.trim() || null, country: country.trim() || null }
        : prev
    );
    setToast({ show: true, message: `${t('saved_title')} — ${t('saved_desc')}` });
  };

  // ── آپلود عکس پروفایل ─────────────────────────────────────────
  const handleAvatarButtonClick = () => fileInputRef.current?.click();

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // تا انتخاب دوباره‌ی همان فایل هم onChange را صدا بزند
    if (!file || !profile) return;

    setUploadingAvatar(true);
    try {
      const blob = await compressAvatarImage(file);
      const path = `${profile.id}/avatar.jpg`;

      const { error: uploadError } = await supabaseBrowser.storage
        .from('avatars')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseBrowser.storage.from('avatars').getPublicUrl(path);
      const bustedUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await (supabaseBrowser.from('profiles') as any)
        .update({ avatar_url: bustedUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setAvatarUrl(bustedUrl);
      setProfile((prev) => (prev ? { ...prev, avatar_url: bustedUrl } : prev));
      setToast({ show: true, message: t('avatar_updated') });
    } catch (err: any) {
      const message = err instanceof ImageCompressError ? err.message : t('avatar_error_generic');
      setToast({ show: true, message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile) return;
    setUploadingAvatar(true);
    const { error } = await (supabaseBrowser.from('profiles') as any)
      .update({ avatar_url: null })
      .eq('id', profile.id);
    setUploadingAvatar(false);
    if (error) {
      setToast({ show: true, message: error.message });
      return;
    }
    setAvatarUrl(null);
    setProfile((prev) => (prev ? { ...prev, avatar_url: null } : prev));
  };

  // ── مدیریت فرم آدرس (افزودن/ویرایش) ───────────────────────────
  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setAddressFormErrors({});
    setShowAddressForm(true);
  };

  const openEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      receiver_name: addr.receiver_name,
      receiver_phone: addr.receiver_phone,
      city: addr.city,
      address: addr.address,
    });
    setAddressFormErrors({});
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
    if (addressFormErrors[name]) {
      setAddressFormErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const saveAddress = async () => {
    const errors: Record<string, boolean> = {};
    if (!addressForm.label.trim()) errors.label = true;
    if (!addressForm.receiver_name.trim()) errors.receiver_name = true;
    if (!addressForm.receiver_phone.trim()) errors.receiver_phone = true;
    if (!addressForm.city.trim()) errors.city = true;
    if (!addressForm.address.trim()) errors.address = true;

    if (Object.keys(errors).length > 0) {
      setAddressFormErrors(errors);
      return;
    }

    if (!profile) return;
    setAddressSaving(true);

    if (editingAddressId) {
      const { error } = await (supabaseBrowser.from('saved_addresses') as any)
        .update({ ...addressForm })
        .eq('id', editingAddressId);

      if (error) {
        setToast({ show: true, message: error.message });
        setAddressSaving(false);
        return;
      }
    } else {
      const { error } = await (supabaseBrowser.from('saved_addresses') as any).insert([
        { ...addressForm, user_id: profile.id },
      ]);

      if (error) {
        setToast({ show: true, message: error.message });
        setAddressSaving(false);
        return;
      }
    }

    setAddressSaving(false);
    setShowAddressForm(false);
    setToast({ show: true, message: t('addresses.saved') });
    loadAddresses();
  };

  const confirmDeleteAddress = async () => {
    if (!deleteTarget) return;
    const { error } = await (supabaseBrowser.from('saved_addresses') as any)
      .delete()
      .eq('id', deleteTarget.id);

    setDeleteTarget(null);

    if (error) {
      setToast({ show: true, message: error.message });
      return;
    }
    setToast({ show: true, message: t('addresses.deleted') });
    loadAddresses();
  };

  const setDefaultAddress = async (addr: SavedAddress) => {
    if (!profile) return;
    await (supabaseBrowser.from('saved_addresses') as any)
      .update({ is_default: false })
      .eq('user_id', profile.id)
      .neq('id', addr.id);

    const { error } = await (supabaseBrowser.from('saved_addresses') as any)
      .update({ is_default: true })
      .eq('id', addr.id);

    if (error) {
      setToast({ show: true, message: error.message });
      return;
    }
    loadAddresses();
  };

  // ── خروج از حساب ───────────────────────────────────────────
  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.replace('/login');
  };

  const formatMemberSince = (iso: string) => {
    try {
      const loc = locale === 'fa' ? 'fa-IR' : 'en-US';
      return new Intl.DateTimeFormat(loc, { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(iso)
      );
    } catch {
      return iso;
    }
  };

  const formatOrderDate = (iso: string) => {
    try {
      const loc = locale === 'fa' ? 'fa-IR' : 'en-US';
      return new Intl.DateTimeFormat(loc, { year: 'numeric', month: 'short', day: 'numeric' }).format(
        new Date(iso)
      );
    } catch {
      return iso;
    }
  };

  // نگاشت وضعیت سفارش به آیکون/رنگ — از همان متن‌های صفحه‌ی پیگیری سفارش استفاده می‌کنیم
  const statusMeta = (status: string) => {
    if (status === 'cancelled') {
      return { label: tTrack('status_cancelled'), icon: XCircle, className: 'bg-red-50 text-red-600' };
    }
    const map: Record<string, { icon: any; className: string }> = {
      pending: { icon: Clock, className: 'bg-amber-50 text-amber-600' },
      paid: { icon: CheckCircle, className: 'bg-blue-50 text-blue-600' },
      sent: { icon: Truck, className: 'bg-indigo-50 text-indigo-600' },
      delivered: { icon: Package, className: 'bg-green-50 text-green-600' },
    };
    const meta = map[status] || map.pending;
    return { label: tTrack(`steps.${status}`), icon: meta.icon, className: meta.className };
  };

  // ── وضعیت بارگذاری ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 font-[family-name:var(--font-vazir)]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </div>
    );
  }

  // ── کاربر وارد نشده ──────────────────────────────────────────
  if (notLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-vazir)]">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <UserCircle2 className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('not_logged_in')}</h1>
          <p className="text-sm text-gray-500 mb-6">{t('not_logged_in_desc')}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            {t('login')}
          </button>
        </div>
      </div>
    );
  }

  // ── خطای بارگذاری ────────────────────────────────────────────
  if (loadError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-vazir)]">
        <div className="max-w-md w-full bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">{t('load_error')}</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = fullName.trim() || profile.email || 'User';

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'account', label: t('tabs.account'), icon: UserIcon },
    { key: 'addresses', label: t('tabs.addresses'), icon: MapPin },
    { key: 'orders', label: t('tabs.orders'), icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-vazir)]">
      <Toast
        message={toast.message}
        show={toast.show}
        onDone={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* هدر */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>

        {/* نوار تب‌ها */}
        <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 px-3 rounded-xl transition-colors whitespace-nowrap ${
                tab === key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── تب ۱: اطلاعات حساب ───────────────────────────── */}
        {tab === 'account' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* آواتار */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-200 flex items-center justify-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={t('avatar')} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-400">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarButtonClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 left-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md transition-colors disabled:opacity-60"
                  aria-label={t('avatar_change')}
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>

              <div className="text-center">
                <p className="font-bold text-gray-900">{displayName}</p>
                {profile.created_at && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t('member_since')} {formatMemberSince(profile.created_at)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAvatarButtonClick}
                  disabled={uploadingAvatar}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  {t('avatar_change')}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    {t('avatar_remove')}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400">{t('avatar_hint')}</p>
            </div>

            {/* فرم */}
            <div className="space-y-5">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('full_name')}
                </label>
                <div className="relative">
                  <UserIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="full_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('full_name_ph')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('phone')}
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="phone"
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phone_ph')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900 text-left"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('country')}
                </label>
                <div className="relative">
                  <Globe className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={t('country_ph')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{t('country_hint')}</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email ?? ''}
                  readOnly
                  disabled
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1.5">{t('email_readonly')}</p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  t('save')
                )}
              </button>

              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-4 rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
                {tAuth('logout')}
              </button>
            </div>
          </div>
        )}

        {/* ── تب ۲: آدرس‌های ذخیره‌شده ─────────────────────── */}
        {tab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">{t('addresses.title')}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{t('addresses.subtitle')}</p>
              </div>
              <button
                onClick={openAddAddress}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-3.5 rounded-xl transition-colors whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                {t('addresses.add_new')}
              </button>
            </div>

            {addressesLoading && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}

            {!addressesLoading && addresses && addresses.length === 0 && (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{t('addresses.empty')}</p>
              </div>
            )}

            {!addressesLoading &&
              addresses &&
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-bold text-gray-900">{addr.label}</span>
                      {addr.is_default && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 fill-current" />
                          {t('addresses.default_badge')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{addr.receiver_name} — {addr.receiver_phone}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{addr.city} — {addr.address}</p>
                  </div>

                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    {!addr.is_default && (
                      <button
                        onClick={() => setDefaultAddress(addr)}
                        className="text-xs font-bold text-blue-600 hover:underline whitespace-nowrap text-right"
                      >
                        {t('addresses.set_default')}
                      </button>
                    )}
                    <button
                      onClick={() => openEditAddress(addr)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700 whitespace-nowrap"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t('addresses.edit')}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(addr)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 whitespace-nowrap"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('addresses.delete')}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── تب ۳: سفارش‌های من ───────────────────────────── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900">{t('orders.title')}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{t('orders.subtitle')}</p>
            </div>

            {ordersLoading && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}

            {!ordersLoading && ordersError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">
                {t('orders.load_error')}
              </div>
            )}

            {!ordersLoading && !ordersError && orders && orders.length === 0 && (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{t('orders.empty')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('orders.empty_desc')}</p>
              </div>
            )}

            {!ordersLoading &&
              !ordersError &&
              orders &&
              orders.map((order) => {
                const meta = statusMeta(order.status);
                const StatusIcon = meta.icon;
                const itemsSummary = (order.items || [])
                  .map((i) => i.name)
                  .filter(Boolean)
                  .join('، ');

                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 mb-1">{t('orders.order_number')}</p>
                        <p className="font-mono text-xs text-gray-600 dir-ltr truncate">{order.id}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${meta.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </div>

                    {itemsSummary && <p className="text-sm text-gray-700 mt-3 line-clamp-2">{itemsSummary}</p>}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 flex-wrap gap-2">
                      <div className="text-xs text-gray-500">
                        {formatOrderDate(order.created_at)} — {order.city}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-sm">
                          {order.display_fiat_amount
                            ? `${order.display_fiat_amount.toLocaleString()} ${order.display_currency ?? ''}`
                            : `$${order.total_price}`}
                        </span>
                        <button
                          onClick={() => router.push(`/track?id=${order.id}`)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline whitespace-nowrap"
                        >
                          {t('orders.track_btn')}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── مودال افزودن/ویرایش آدرس ──────────────────────────── */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">
                {editingAddressId ? t('addresses.edit') : t('addresses.add_new')}
              </h3>
              <button onClick={closeAddressForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('addresses.label')}</label>
                <input
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressFormChange}
                  placeholder={t('addresses.label_ph')}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${
                    addressFormErrors.label ? 'border-red-400' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('addresses.receiver_name')}
                </label>
                <input
                  name="receiver_name"
                  value={addressForm.receiver_name}
                  onChange={handleAddressFormChange}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${
                    addressFormErrors.receiver_name ? 'border-red-400' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('addresses.receiver_phone')}
                </label>
                <input
                  name="receiver_phone"
                  dir="ltr"
                  value={addressForm.receiver_phone}
                  onChange={handleAddressFormChange}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none text-left ${
                    addressFormErrors.receiver_phone ? 'border-red-400' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('addresses.city')}</label>
                <input
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressFormChange}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${
                    addressFormErrors.city ? 'border-red-400' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('addresses.address')}</label>
                <textarea
                  name="address"
                  rows={3}
                  value={addressForm.address}
                  onChange={handleAddressFormChange}
                  placeholder={t('addresses.address_ph')}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${
                    addressFormErrors.address ? 'border-red-400' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeAddressForm}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50"
              >
                {t('addresses.cancel')}
              </button>
              <button
                onClick={saveAddress}
                disabled={addressSaving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {addressSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('addresses.save_address')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── مودال تایید حذف آدرس ──────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">{t('addresses.delete_confirm_title')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('addresses.delete_confirm_desc')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50"
              >
                {t('addresses.cancel')}
              </button>
              <button
                onClick={confirmDeleteAddress}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm"
              >
                {t('addresses.confirm_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}