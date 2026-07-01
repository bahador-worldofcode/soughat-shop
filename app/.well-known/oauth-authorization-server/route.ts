import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/oauth/token`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'client_credentials'],
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
    scopes_supported: [],
    code_challenge_methods_supported: ['S256'],
    service_documentation: `${baseUrl}/auth.md`,
    op_policy_uri: `${baseUrl}/auth.md`,
    'x-status': 'not_yet_active',
    'x-status-note':
      'Metadata is published for discovery only. authorization_endpoint and token_endpoint currently return HTTP 501 temporarily_unavailable. See /auth.md.',
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}