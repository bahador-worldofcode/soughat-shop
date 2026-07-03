// app/layout.tsx
// این لایوت فقط برای رعایت الزام ساختاری Next.js هست
// (هر پروژه باید یک لایوت اصلی داشته باشه تا صفحاتی مثل not-found.tsx
// که بیرون از [locale] و admin هستن معتبر باشن).
// عمداً هیچ تگ html/body اینجا نیست، چون آن‌ها داخل
// app/[locale]/layout.tsx و app/admin/layout.tsx تعریف شدن
// و نباید تکراری بشن.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}