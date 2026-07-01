import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = {
    linkset: [
      {
        anchor: `${baseUrl}/`,
        'service-desc': [
          {
            href: `${baseUrl}/openapi.json`,
            type: 'application/vnd.oai.openapi+json;version=3.1',
            title: 'Soughat Shop OpenAPI Specification',
          },
        ],
        'service-doc': [
          {
            href: `${baseUrl}/auth.md`,
            type: 'text/markdown',
            title: 'Soughat Shop Agent & API Access Guide',
          },
        ],
      },
    ],
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}