import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-16 pb-20 lg:pt-24 lg:pb-32">
      <div className="container mx-auto px-4 text-center">
        
        {/* Badge */}
        <div className="mx-auto mb-6 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          <Gift className="mr-2 h-4 w-4" />
          <span>ارسال مطمئن هدیه به سراسر ایران</span>
        </div>

        {/* Main Heading */}
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
          فاصله‌ها را با <span className="text-blue-600">عشق</span> پر کنید
        </h1>

        {/* Subheading */}
        <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed">
          تنها پلتفرم ارسال هدیه به ایران با پرداخت ارزی و کریپتو (USDC/SOL). 
          بدون نیاز به حساب بانکی ایران، لبخند را به خانواده خود هدیه دهید.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/products" 
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all w-full sm:w-auto"
          >
            مشاهده محصولات
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Link>
          
          <Link 
            href="/about" 
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-all w-full sm:w-auto"
          >
            چطور کار می‌کند؟
          </Link>
        </div>

      </div>
    </section>
  );
}