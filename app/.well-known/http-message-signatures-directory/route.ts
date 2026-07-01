import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  const body = {
    status: 'not_yet_active',
    purpose:
      "Reserved for future HTTP Message Signature verification config (Web Bot Auth draft-meunier-web-bot-auth-architecture), used once Soughat Shop's agentic-commerce API (Phase 5) accepts signed requests from AI agents acting on a user's behalf.",
    keys: [],
    notes:
      'Soughat Shop does not currently require or verify request signatures on any endpoint. See /auth.md for roadmap status.',
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