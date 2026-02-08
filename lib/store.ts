import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

type Currency = 'USD' | 'EUR' | 'GBP' | 'SEK';

export interface Product {
  id: string;
  title: string;
  title_en?: string; 
  price: number; 
  image: string;
  category?: string;
  pricing_type?: string; 
  weight?: number; // ✅ اضافه شد برای محصولات طلا
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
  decreaseFromCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  
  updateItemQuantity: (productId: string, quantity: number) => void;
  
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
      
      addToCart: (product) => set((state) => {
        const existing = state.cart.find((item) => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        // تمام فیلدها (شامل weight و pricing_type) اینجا به سبد منتقل می‌شوند
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),

      decreaseFromCart: (id) => set((state) => {
        const existing = state.cart.find((item) => item.id === id);
        if (existing && existing.quantity > 1) {
            return {
                cart: state.cart.map((item) =>
                    item.id === id ? { ...item, quantity: item.quantity - 1 } : item
                ),
            };
        } else {
            return {
                cart: state.cart.filter((item) => item.id !== id),
            };
        }
      }),

      updateItemQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map((item) => 
            item.id === id ? { ...item, quantity: quantity } : item
        )
      })),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== id),
      })),

      clearCart: () => set({ cart: [] }),

      totalItems: () => {
        const cart = get().cart;
        return cart.reduce((total, item) => {
            if (item.pricing_type === 'currency') {
                return total + 1;
            }
            return total + item.quantity;
        }, 0);
      },

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