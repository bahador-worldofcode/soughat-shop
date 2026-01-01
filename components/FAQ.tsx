'use client';

import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FAQ() {
  const t = useTranslations('FAQ');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // تغییر مهم: ساخت آرایه اعداد از 1 تا 20 برای خواندن تمام سوالات از فایل json
  const faqs = Array.from({ length: 20 }, (_, i) => i + 1).map(num => ({
    q: t(`items.q${num}`),
    a: t(`items.a${num}`)
  }));

  return (
    <section className="bg-white py-16 border-t border-gray-100 font-[family-name:var(--font-vazir)]">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h2>
          <p className="text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div 
              key={index} 
              className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                openIndex === index ? 'border-blue-200 bg-blue-50/30 shadow-sm' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-start outline-none"
              >
                <span className={`font-bold text-sm md:text-base ${openIndex === index ? 'text-blue-800' : 'text-gray-700'}`}>
                  {item.q}
                </span>
                {openIndex === index ? (
                  <Minus className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Plus className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden px-5">
                  <p className="text-gray-600 leading-7 text-sm md:text-base border-t border-blue-100 pt-3 text-justify">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}