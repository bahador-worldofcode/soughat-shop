import { NextResponse } from 'next/server';

interface X402Options {
  amountUsd: number;
  description: string;
  resource: string;
}

export function x402PaymentRequired({ amountUsd, description, resource }: X402Options) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://soughat.shop';

  return NextResponse.json(
    {
      x402Version: 1,
      error: 'payment_required',
      accepts: [
        {
          scheme: 'exact',
          network: 'solana',
          asset: 'USDT',
          maxAmountRequired: amountUsd.toFixed(2),
          resource,
          description,
          payTo: null,
          extra: {
            note: 'x402 settlement is not yet enforced on this endpoint. Published for protocol discovery per the AI-Agent-Readiness roadmap.',
          },
        },
      ],
      documentation: `${baseUrl}/auth.md`,
    },
    { status: 402 }
  );
}