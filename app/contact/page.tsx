import type { Metadata } from 'next';
import { Mail, MessageCircle, MapPin, Phone, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'تماس با ما | پشتیبانی ارسال به ایران',
  description: 'راه‌های ارتباطی با سوغات شاپ جهت پیگیری سفارشات ارسال شده به ایران، پشتیبانی تلفنی و چت آنلاین.',
  keywords: ['تماس با سوغات شاپ', 'تلفن پشتیبانی ارسال به ایران', 'دفتر تهران سوغات شاپ', '09168038017'],
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen py-12 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">تماس با ما</h1>
        <p className="text-gray-500 text-center mb-12">ما همیشه در کنار شما هستیم تا خیالتان از بابت ارسال هدیه به ایران راحت باشد.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Email Card */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">ایمیل سازمانی</h3>
            <p className="text-gray-500 text-sm mb-4">پاسخگویی سریع به سوالات شما</p>
            <a href="mailto:support@soughat.shop" className="text-blue-600 font-mono dir-ltr font-bold hover:underline">support@soughat.shop</a>
          </div>

          {/* Chat/Phone Card - UPDATED */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-1 rounded-bl-lg">پاسخگویی فوری</div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">تماس و واتساپ</h3>
            <p className="text-gray-500 text-sm mb-4">پشتیبانی مستقیم مدیریت</p>
            
            <div className="flex flex-col gap-2 items-center justify-center dir-ltr">
                <a href="tel:+989168038017" className="text-gray-900 font-bold text-lg hover:text-green-600 transition-colors">
                    +98 916 803 8017
                </a>
                <a href="https://wa.me/989168038017" target="_blank" className="text-xs inline-flex items-center text-green-600 hover:underline">
                    ارسال پیام در واتساپ <ArrowLeft className="h-3 w-3 ml-1" />
                </a>
            </div>
          </div>

          {/* Office Card */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">مرکز پردازش (تهران)</h3>
            <p className="text-gray-500 text-sm mb-4">انبار مرکزی ارسال کالا</p>
            <span className="text-gray-700 text-sm block">تهران، میدان آزادی، خیابان آزادی (دفتر توزیع)</span>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="text-center bg-blue-50 rounded-xl p-8 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">سوال فوری دارید؟</h2>
          <p className="text-gray-600 mb-6">شاید پاسخ شما در بخش قوانین باشد.</p>
          <a href="/terms" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">
            مشاهده قوانین و ضمانت‌نامه
          </a>
        </div>
      </div>
    </div>
  );
}