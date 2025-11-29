import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'قوانین و ضمانت ارسال کالا به ایران | سوغات شاپ',
  description: 'شرایط و قوانین ارسال کالا به ایران، نحوه بازگشت وجه در صورت عدم تحویل و تعهدات سوغات شاپ در قبال مشتریان.',
  keywords: ['قوانین ارسال به ایران', 'ضمانت بازگشت وجه', 'ارسال امن به ایران', 'شرایط خرید سوغات'],
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen pb-20 font-[family-name:var(--font-vazir)]">
      
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <ShieldCheck className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">قوانین و ضمانت‌نامه خدمات</h1>
          <p className="text-gray-500">شفافیت، اصل اول سوغات شاپ برای ارسال به ایران است.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-10 text-gray-700 leading-8 text-justify">
          
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              ۱. تعهد ارسال و تحویل در ایران
            </h2>
            <p className="mb-4">
              سوغات شاپ متعهد می‌شود کلیه سفارشات ثبت شده را عیناً مطابق با تصویر و توضیحات محصول تهیه کرده و به آدرس گیرنده در <span className="font-bold text-black">ایران</span> تحویل دهد.
            </p>
            <ul className="list-disc list-inside space-y-2 bg-gray-50 p-4 rounded-lg text-sm">
              <li>زمان تحویل برای تهران: ۲۴ تا ۴۸ ساعت کاری.</li>
              <li>زمان تحویل برای مراکز استان‌ها: ۳ تا ۵ روز کاری.</li>
              <li>سایر شهرستان‌ها: تا ۷ روز کاری.</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              ۲. چرا پرداخت کریپتو؟ (عدم پذیرش کارت اعتباری)
            </h2>
            <p>
              به دلیل تحریم‌های بانکی بین‌المللی علیه ایران، امکان استفاده مستقیم از درگاه‌های ویزا و مسترکارت برای کسب‌وکارهای فعال در داخل ایران وجود ندارد. 
            </p>
            <p className="mt-2">
              برای دور زدن این محدودیت و حفظ امنیت کاربران، تمامی پرداخت‌ها در سوغات شاپ از طریق <span className="font-bold">ارزهای دیجیتال (USDT و Solana)</span> انجام می‌شود. این روش سریع، بدون کارمزد بانکی و ۱۰۰٪ امن است.
            </p>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm ring-1 ring-blue-50">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              ۳. ضمانت بازگشت وجه (Money Back Guarantee)
            </h2>
            <p className="font-medium text-gray-900 mb-2">
              ما امنیت پول شما را تضمین می‌کنیم.
            </p>
            <p>
              در صورتی که بسته ارسالی به هر دلیلی (مفقودی، آسیب دیدگی شدید در حمل و نقل یا توقیف) به دست گیرنده در ایران نرسد، سوغات شاپ موظف است طبق انتخاب مشتری:
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center text-sm font-bold text-blue-800">
                گزینه الف: ارسال مجدد و رایگان سفارش
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center text-sm font-bold text-green-800">
                گزینه ب: عودت ۱۰۰٪ مبلغ پرداختی
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">۴. حریم خصوصی و امنیت</h2>
            <p>
              اطلاعات فرستنده (شما) و گیرنده (خانواده در ایران) کاملاً محرمانه نزد ما باقی می‌ماند. برای حفظ احترام و جنبه هدیه بودن کالا، روی بسته ارسالی در ایران <span className="font-bold">هیچ فاکتوری حاوی قیمت دلار</span> درج نمی‌شود.
            </p>
          </section>

        </div>

        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <p className="text-gray-500 mb-4">آیا سوال دیگری دارید؟</p>
          <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
             تماس با پشتیبانی
          </Link>
        </div>
      </div>
    </div>
  );
}