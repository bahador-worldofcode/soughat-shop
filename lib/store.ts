import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

type Currency = 'USD' | 'EUR' | 'GBP' | 'SEK';

export interface Product {
  id: string;
  title: string;
  price: number; 
  image: string;
  category?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface StoreState {
  // --- بخش ارز ---
  currency: Currency;
  rates: Record<string, number>;
  lastRatesUpdate: number;
  setCurrency: (currency: Currency) => void;
  getSymbol: () => string;
  convertPrice: (priceInUSD: number) => number;
  fetchRates: () => Promise<void>;

  // --- بخش سبد خرید ---
  cart: CartItem[];
  addToCart: (product: Product) => void;
  decreaseFromCart: (productId: string) => void; // <--- تابع جدید
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

const SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SEK: 'kr',
};

const DEFAULT_RATES = {
  USD: 1,
  EUR: 0.95,
  GBP: 0.79,
  SEK: 11.0,
};

const CACHE_DURATION = 3600 * 1000;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // === لاجیک ارز ===
      currency: 'USD',
      rates: DEFAULT_RATES,
      lastRatesUpdate: 0,

      setCurrency: (currency) => set({ currency }),
      
      getSymbol: () => SYMBOLS[get().currency],
      
      convertPrice: (priceInUSD) => {
        const currentRate = get().rates[get().currency] || 1;
        return Math.round(priceInUSD * currentRate * 100) / 100;
      },

      fetchRates: async () => {
        const now = Date.now();
        const lastUpdate = get().lastRatesUpdate;

        if (now - lastUpdate < CACHE_DURATION) {
          console.log('Using cached rates');
          return;
        }

        try {
          const { data } = await supabase.from('currencies').select('code, rate');
          if (data) {
            const newRates: Record<string, number> = {};
            data.forEach(item => {
              newRates[item.code] = item.rate;
            });
            set({ 
              rates: newRates,
              lastRatesUpdate: now 
            });
          }
        } catch (error) {
          console.error('Failed to fetch rates:', error);
        }
      },

      // === لاجیک سبد خرید ===
      cart: [],
      
      // افزودن (یکی زیاد کردن)
      addToCart: (product) => set((state) => {
        const existing = state.cart.find((item) => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),

      // کاهش (یکی کم کردن) - جدید
      decreaseFromCart: (id) => set((state) => {
        const existing = state.cart.find((item) => item.id === id);
        // اگر تعداد بیشتر از 1 بود، کم کن. اگر 1 بود، حذفش نکن (بذار کاربر خودش دکمه حذف رو بزنه یا اگه میخوای حذف شه بگو)
        // استراتژی: اگر 1 بود و زد، حذف میشه (مثل دیجی‌کالا)
        if (existing && existing.quantity > 1) {
            return {
                cart: state.cart.map((item) =>
                    item.id === id ? { ...item, quantity: item.quantity - 1 } : item
                ),
            };
        } else {
            // اگر 1 بود و منفی زد، حذف بشه
            return {
                cart: state.cart.filter((item) => item.id !== id),
            };
        }
      }),

      // حذف کامل آیتم
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== id),
      })),

      clearCart: () => set({ cart: [] }),

      totalItems: () => get().cart.reduce((total, item) => total + item.quantity, 0),

      totalPrice: () => {
        const totalUSD = get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        return get().convertPrice(totalUSD);
      },
    }),
    {
      name: 'soughat-storage',
      partialize: (state) => ({ 
        cart: state.cart, 
        currency: state.currency,
        rates: state.rates,
        lastRatesUpdate: state.lastRatesUpdate
      }), 
    }
  )
);