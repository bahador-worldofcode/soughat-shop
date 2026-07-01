import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = {
    protocol: 'ucp',
    version: '0.1.0',
    status: 'not_yet_active',
    provider: {
      name: 'Soughat Shop',
      url: baseUrl,
    },
    endpoints: {
      catalog: `${baseUrl}/.well-known/api-catalog`,
      payments: null,
    },
    payment_rails_supported: ['crypto_usdt'],
    notes:
      'UCP endpoints are not live yet. Published for early discovery per the AI-Agent-Readiness roadmap. See /auth.md.',
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