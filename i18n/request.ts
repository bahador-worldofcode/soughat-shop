import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // اگر زبانی غیر از fa یا en بود، پیش‌فرض fa شود
  if (!locale || !['fa', 'en'].includes(locale)) {
    locale = 'fa';
  }
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});