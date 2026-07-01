'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

declare global {
  interface Navigator {
    modelContext?: {
      provideContext: (context: { tools: any[] }) => void;
    };
  }
}

export default function WebMCPProvider({ locale }: { locale: string }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.modelContext) {
      return;
    }

    const isEn = locale === 'en';

    const searchProductsTool = {
      name: 'search_products',
      description: 'Search Soughat Shop products by keyword and return matching items with price and slug.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword, e.g. product name or category' },
          limit: { type: 'number', description: 'Max results to return', default: 5 },
        },
        required: ['query'],
      },
      execute: async ({ query, limit = 5 }: { query: string; limit?: number }) => {
        const titleField = isEn ? 'title_en' : 'title';
        const { data, error } = await supabase
          .from('products')
          .select('id, slug, title, title_en, price, image')
          .ilike(titleField, `%${query}%`)
          .limit(limit);

        if (error) {
          return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
        }

        const results = (data || []).map((p) => ({
          id: p.id,
          slug: p.slug,
          title: isEn ? (p.title_en || p.title) : p.title,
          price_usd: p.price,
          image: p.image,
          url: `/${locale}/products/${p.slug}`,
        }));

        return { content: [{ type: 'text', text: JSON.stringify(results) }] };
      },
    };

    const getProductDetailsTool = {
      name: 'get_product_details',
      description: 'Get full details for a single Soughat Shop product by its slug.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'The product slug' },
        },
        required: ['slug'],
      },
      execute: async ({ slug }: { slug: string }) => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          return { content: [{ type: 'text', text: 'Product not found.' }] };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                id: data.id,
                slug: data.slug,
                title: isEn ? (data.title_en || data.title) : data.title,
                description: isEn ? (data.description_en || data.description) : data.description,
                price_usd: data.price,
                image: data.image,
              }),
            },
          ],
        };
      },
    };

    const addToCartTool = {
      name: 'add_to_cart',
      description: 'Add a Soughat Shop product to the current visitor cart by product slug.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'The product slug to add' },
        },
        required: ['slug'],
      },
      execute: async ({ slug }: { slug: string }) => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          return { content: [{ type: 'text', text: 'Product not found.' }] };
        }

        useStore.getState().addToCart({
          id: data.id,
          title: isEn ? (data.title_en || data.title) : data.title,
          title_en: data.title_en,
          price: data.price,
          image: data.image,
          category: data.category,
          pricing_type: data.pricing_type,
          weight: data.weight,
        });

        return { content: [{ type: 'text', text: `Added "${data.title}" to cart.` }] };
      },
    };

    const navigateToCheckoutTool = {
      name: 'navigate_to_checkout',
      description: 'Navigate the browser to the Soughat Shop checkout page.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => {
        router.push('/checkout');
        return { content: [{ type: 'text', text: 'Navigated to checkout.' }] };
      },
    };

    navigator.modelContext.provideContext({
      tools: [searchProductsTool, getProductDetailsTool, addToCartTool, navigateToCheckoutTool],
    });
  }, [locale, router]);

  return null;
}