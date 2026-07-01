import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = {
    version: '0.2.0',
    site: {
      name: 'Soughat Shop',
      url: baseUrl,
    },
    skills: [
      {
        name: 'search_products',
        type: 'web-navigation',
        description:
          'Search the Soughat Shop product catalog by keyword and/or category.',
        execution: {
          method: 'GET',
          urlTemplate: `${baseUrl}/{locale}/products?q={query}&category={category}`,
          responseType: 'text/html',
        },
        parameters: {
          locale: { type: 'string', enum: ['fa', 'en'], default: 'fa' },
          query: { type: 'string', required: false, description: 'Free-text search term' },
          category: { type: 'string', required: false, description: 'Category slug filter' },
        },
      },
      {
        name: 'view_product',
        type: 'web-navigation',
        description: 'View full details, price, and images for a single product.',
        execution: {
          method: 'GET',
          urlTemplate: `${baseUrl}/{locale}/products/{slug}`,
          responseType: 'text/html',
        },
        parameters: {
          locale: { type: 'string', enum: ['fa', 'en'], default: 'fa' },
          slug: { type: 'string', required: true, description: 'Product slug identifier' },
        },
      },
      {
        name: 'track_order',
        type: 'web-navigation',
        description: 'Look up the delivery status of an existing order by order ID.',
        execution: {
          method: 'GET',
          urlTemplate: `${baseUrl}/{locale}/track`,
          responseType: 'text/html',
        },
        parameters: {
          locale: { type: 'string', enum: ['fa', 'en'], default: 'fa' },
        },
        notes: 'Order ID is entered client-side in a form; no URL query parameter available yet.',
      },
      {
        name: 'read_how_it_works',
        type: 'web-navigation',
        description: 'Read an explanation of the ordering, crypto-payment, and delivery process.',
        execution: {
          method: 'GET',
          urlTemplate: `${baseUrl}/{locale}/how-it-works`,
          responseType: 'text/html',
        },
        parameters: {
          locale: { type: 'string', enum: ['fa', 'en'], default: 'fa' },
        },
      },
    ],
    'x-roadmap-note':
      'Transactional skills (create_order, add_to_cart) are intentionally excluded until an authenticated commerce API is published. See /auth.md.',
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}