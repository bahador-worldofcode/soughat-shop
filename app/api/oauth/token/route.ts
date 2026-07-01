import { NextResponse } from 'next/server';

function notImplemented() {
  return NextResponse.json(
    {
      error: 'temporarily_unavailable',
      error_description:
        'OAuth 2.0 token issuance is not yet active for Soughat Shop. See /auth.md for current status and how to request partner API access.',
    },
    { status: 501 }
  );
}

export async function GET() {
  return notImplemented();
}

export async function POST() {
  return notImplemented();
}