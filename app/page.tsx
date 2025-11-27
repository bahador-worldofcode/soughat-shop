import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";

// این‌ها محصولات نمونه هستند (بعداً از دیتابیس می‌خوانیم)
const PRODUCTS = [
  {
    id: '1',
    title: 'پسته اکبری درجه یک - ۱ کیلوگرم',
    price: 28, // قیمت به دلار/تتر
    image: 'https://placehold.co/400x400/e2e8f0/1e40af?text=Pistachio',
  },
  {
    id: '2',
    title: 'زعفران قائنات (سرگل) - ۵ گرم',
    price: 15,
    image: 'https://placehold.co/400x400/e2e8f0/1e40af?text=Saffron',
  },
  {
    id: '3',
    title: 'گز آردی ۴۰ درصد پسته - اصفهان',
    price: 12,
    image: 'https://placehold.co/400x400/e2e8f0/1e40af?text=Gaz',
  },
  {
    id: '4',
    title: 'بشقاب میناکاری اعلاء - ۲۰ سانتی',
    price: 45,
    image: 'https://placehold.co/400x400/e2e8f0/1e40af?text=Handicraft',
  },
];

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen pb-20">
      <Hero />
      
      {/* بخش محصولات */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-gray-900">محصولات پرفروش</h2>
          <span className="text-sm text-blue-600 hover:underline cursor-pointer">
            مشاهده همه
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
      </section>
    </main>
  );
}