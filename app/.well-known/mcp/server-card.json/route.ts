import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = {
    schemaVersion: '2026-01-01',
    serverInfo: {
      name: 'soughat-shop-mcp',
      displayName: 'Soughat Shop',
      version: '0.1.0',
      description:
        'Cross-border gift and product delivery service for the Iranian diaspora. Crypto-based (USDT) payments, delivery inside Iran.',
      website: baseUrl,
    },
    status: 'not_yet_active',
    mcpEndpoint: null,
    transport: null,
    capabilities: {
      tools: [],
      resources: [],
    },
    notes:
      'No live MCP transport endpoint is available yet. This card is published for early discovery per the site AI-Agent-Readiness roadmap. Interim frontend tool registration (WebMCP) is targeted for a later phase. See /auth.md for contact and partner-access details.',
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