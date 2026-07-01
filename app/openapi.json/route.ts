import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = {
    openapi: '3.1.0',
    info: {
      title: 'Soughat Shop API',
      version: '0.1.0-prelaunch',
      description:
        'Soughat Shop is a cross-border gift and product delivery service for the Iranian diaspora, using crypto-based payment rails. This specification is published ahead of API launch as part of an AI-Agent-Readiness rollout. No authenticated public endpoints are live yet. See /auth.md for onboarding status and roadmap.',
      contact: {
        name: 'Soughat Shop Agent Partnerships',
        email: 'agents@soughat.shop',
      },
    },
    servers: [
      {
        url: baseUrl,
        description: 'Production',
      },
    ],
    paths: {},
    'x-roadmap': {
      status: 'discovery-only',
      plannedEndpoints: [
        { path: '/api/v1/products', method: 'GET', description: 'Public product catalog listing' },
        { path: '/api/v1/products/{slug}', method: 'GET', description: 'Single product detail' },
        { path: '/api/v1/orders/{id}/status', method: 'GET', description: 'Order status lookup' },
        { path: '/api/v1/orders', method: 'POST', description: 'Authenticated order creation (Phase 3+)' },
      ],
    },
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.oai.openapi+json;version=3.1',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}