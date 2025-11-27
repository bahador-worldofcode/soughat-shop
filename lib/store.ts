import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// تعریف تایپ‌ها (درهم حذف شد، کرون اضافه شد)
type Currency = 'USD' | 'EUR' | 'GBP' | 'SEK';

export interface Product {
  id: string;
  title: string;
  price: number; // قیمت همیشه به دلار
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface StoreState {
  // --- بخش ارز ---
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getSymbol: () => string;
  convertPrice: (priceInUSD: number) => number;

  // --- بخش سبد خرید ---
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

const RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  SEK: 11.0, // هر 1 دلار = حدود 11 کرون سوئد
};

const SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SEK: 'kr',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // === لاجیک ارز ===
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
      getSymbol: () => SYMBOLS[get().currency],
      convertPrice: (priceInUSD) => {
        const rate = RATES[get().currency];
        return Math.round(priceInUSD * rate * 100) / 100;
      },

      // === لاجیک سبد خرید ===
      cart: [],
      
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
    }
  )
);