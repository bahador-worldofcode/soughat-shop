'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Eye, X, Loader2, Trash2, User, Globe, Phone, FileText, MapPin, Calendar, DollarSign, Euro, PoundSterling, Landmark, Copy, CheckCircle2 } from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  // اطلاعات گیرنده (ایران)
  customer_name: string;
  customer_phone: string;
  city: string;
  address: string;
  // اطلاعات فرستنده (خارج)
  sender_name: string;
  sender_phone: string;
  sender_country: string;
  // اطلاعات جدید CS
  display_currency: string;
  display_fiat_amount: number;
  // سایر
  order_notes: string;
  total_price: number;
  status: string;
  items: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  // کد سفارشی که همین الان کپی شده (برای نمایش موقت تیک سبز روی دکمه‌ی کپی)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // چون جدول orders حالا کاملاً قفل است (RLS بدون هیچ policy عمومی)، دیگر
  // نمی‌شود مستقیم با کلاینت anon این جدول را خواند/نوشت. به‌جایش توکن
  // سشن ادمین را می‌گیریم و به API امن سمت سرور می‌فرستیم.
  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  };

  // کپی کردن کد کامل (UUID) سفارش در کلیپ‌بورد؛ چون کد کوتاه‌شده‌ی داخل جدول
  // (۸ کاراکتر اول + ...) برای جست‌وجو در صفحه‌ی پیگیری سفارش کافی نیست.
  const handleCopyId = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000);
    } catch (err) {
      alert('کپی خودکار ممکن نشد. کد سفارش: ' + id);
    }
  };

  const fetchOrders = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/orders', { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطا در دریافت سفارش‌ها');
      setOrders(json as Order[]);
    } catch (err: any) {
      alert(err.message || 'خطای ناشناخته در دریافت سفارش‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ id: selectedOrder.id, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطا در تغییر وضعیت');

      const updatedOrders = orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (err: any) {
      alert('خطا: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('آیا از حذف این سفارش مطمئن هستید؟ این عملیات غیرقابل بازگشت است.')) return;

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE', headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطا در حذف (مجوز دسترسی ندارید یا ارتباط قطع است)');

      setOrders(orders.filter(o => o.id !== id));
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Helpers
  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'در انتظار پرداخت',
      'paid': 'پرداخت شده',
      'sent': 'ارسال شده',
      'delivered': 'تحویل شده',
      'cancelled': 'لغو شده'
    };
    return map[status] || status;
  };

  const getCurrencySymbol = (code: string) => {
    switch (code) {
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'SEK': return 'kr';
        default: return '$';
    }
  };

  if (loading) return <div className="p-10 text-center flex flex-col items-center"><Loader2 className="animate-spin mb-2" /> در حال دریافت لیست سفارشات...</div>;

  return (
    <div className="space-y-6 font-[family-name:var(--font-vazir)]">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">مدیریت سفارشات</h2>
           <p className="text-sm text-gray-500">لیست کامل سفارشات با جزئیات فرستنده و گیرنده</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="جستجو (نام، کد سفارش)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">کد / تاریخ</th>
                <th className="px-6 py-4 font-medium">فرستنده (خارج)</th>
                <th className="px-6 py-4 font-medium">گیرنده (ایران)</th>
                <th className="px-6 py-4 font-medium">مبلغ</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
                <th className="px-6 py-4 font-medium text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">سفارشی یافت نشد.</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm font-mono font-bold text-gray-700 dir-ltr text-right">{order.id.slice(0, 8)}...</span>
                      <button
                        onClick={(e) => handleCopyId(order.id, e)}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors flex-shrink-0"
                        title="کپی کد کامل سفارش (برای پیگیری سفارش مشتری)"
                      >
                        {copiedId === order.id ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="block text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString('fa-IR')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-blue-900">{order.sender_name || '-'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Globe className="h-3 w-3" /> {order.sender_country || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{order.customer_name}</div>
                    <div className="text-xs text-gray-500 mt-1">{order.city}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dir-ltr">${order.total_price}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="مشاهده جزئیات">
                            <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={(e) => handleDelete(order.id, e)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="حذف سفارش">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
               <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    جزئیات سفارش
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-gray-400 font-mono">{selectedOrder.id}</span>
                    <button
                      onClick={(e) => handleCopyId(selectedOrder.id, e)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
                      title="کپی کد کامل سفارش"
                    >
                      {copiedId === selectedOrder.id ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
               </div>
              <button onClick={() => setSelectedOrder(null)}><X className="h-6 w-6 text-gray-400 hover:text-red-500" /></button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Status Bar */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">وضعیت فعلی:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                    </span>
                </div>
                
                <div className="flex gap-2">
                  {['pending', 'paid', 'sent', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      disabled={updating}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        selectedOrder.status === st ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {updating && selectedOrder.status === st ? <Loader2 className="h-3 w-3 animate-spin" /> : getStatusText(st)}
                    </button>
                  ))}
                </div>
              </div>

              {/* باکس Customer Service (اطلاعات ارزی مشتری) */}
              <div className="bg-green-50/50 p-5 rounded-2xl border border-green-200">
                  <h4 className="font-bold text-green-900 flex items-center gap-2 text-sm border-b border-green-200 pb-2 mb-2">
                      <Landmark className="h-4 w-4" /> اطلاعات پرداخت مشتری (برای پشتیبانی)
                  </h4>
                  <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-700">مشتری با قیمت دیده شده:</span>
                      <span className="text-xl text-green-700 font-mono dir-ltr">
                           {getCurrencySymbol(selectedOrder.display_currency)} {selectedOrder.display_fiat_amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                      <span>ارزش پایه ثبت شده (برای کریپتو):</span>
                      <span className="font-mono text-gray-700">${selectedOrder.total_price} USD</span>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* باکس فرستنده */}
                 <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
                    <h4 className="font-bold text-blue-900 flex items-center gap-2 text-sm border-b border-blue-200 pb-2 mb-2">
                        <Globe className="h-4 w-4" /> اطلاعات فرستنده (خارج)
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                            <span className="text-xs text-gray-500 block mb-1">نام و نام خانوادگی</span>
                            <span className="font-bold text-gray-800">{selectedOrder.sender_name || '---'}</span>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">کشور</span>
                                <span className="font-bold text-gray-800">{selectedOrder.sender_country || '---'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">تلفن/واتساپ</span>
                                <span className="font-bold text-gray-800 font-mono dir-ltr">{selectedOrder.sender_phone || '---'}</span>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* باکس گیرنده */}
                 <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 space-y-3">
                    <h4 className="font-bold text-red-900 flex items-center gap-2 text-sm border-b border-red-200 pb-2 mb-2">
                        <MapPin className="h-4 w-4" /> اطلاعات گیرنده (ایران)
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                            <span className="text-xs text-gray-500 block mb-1">نام تحویل گیرنده</span>
                            <span className="font-bold text-gray-800">{selectedOrder.customer_name}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block mb-1">شماره تماس</span>
                            <span className="font-bold text-gray-800 font-mono dir-ltr">{selectedOrder.customer_phone}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block mb-1">آدرس کامل</span>
                            <p className="font-medium text-gray-800 text-xs leading-5">{selectedOrder.city} - {selectedOrder.address}</p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* باکس یادداشت */}
              {selectedOrder.order_notes && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm">
                      <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" /> یادداشت مشتری
                      </h4>
                      <p className="text-gray-700 leading-6 italic">"{selectedOrder.order_notes}"</p>
                  </div>
              )}

              {/* لیست اقلام */}
              <div>
                 <h4 className="font-bold text-gray-800 mb-3 text-sm">اقلام سفارش</h4>
                 <div className="space-y-2">
                    {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50 items-center">
                        <img src={item.image} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500">قیمت واحد: ${item.price}</p>
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-gray-900">x{item.quantity}</span>
                            <span className="block text-sm font-bold text-blue-600 font-mono">${item.price * item.quantity}</span>
                        </div>
                        </div>
                    ))}
                 </div>
                 <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="font-bold text-gray-600">جمع کل سفارش (دلار)</span>
                    <span className="text-2xl font-bold text-blue-700 font-mono">${selectedOrder.total_price}</span>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}