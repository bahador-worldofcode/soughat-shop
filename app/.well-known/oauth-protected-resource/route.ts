import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = {
    resource: baseUrl,
    authorization_servers: [baseUrl],
    bearer_methods_supported: ['header'],
    scopes_supported: [],
    resource_signing_alg_values_supported: [],
    resource_documentation: `${baseUrl}/auth.md`,
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}