import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = {
    protocol: 'acp',
    version: '0.1.0',
    status: 'not_yet_active',
    merchant: {
      name: 'Soughat Shop',
      url: baseUrl,
    },
    commerce_api: {
      base_url: `${baseUrl}/api/v1`,
      transports_supported: ['https'],
    },
    product_feed: `${baseUrl}/openapi.json`,
    checkout_endpoint: null,
    payment_methods_supported: ['crypto_usdt'],
    notes:
      'ACP endpoints are not live yet. This file is published for early agent discovery per the AI-Agent-Readiness roadmap. See /auth.md for partner access.',
    documentation: `${baseUrl}/auth.md`,
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}