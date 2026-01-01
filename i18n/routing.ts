import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // لیست زبان‌های پشتیبانی شده
  locales: ['fa', 'en'],
  
  // زبان پیش‌فرض
  defaultLocale: 'fa'
});