import { NextRequest } from 'next/server';
import { x402PaymentRequired } from '@/lib/x402';

export async function GET(req: NextRequest) {
  const paymentHeader = req.headers.get('x-payment');

  if (!paymentHeader) {
    return x402PaymentRequired({
      amountUsd: 0.01,
      description: 'Real-time currency rate feed (premium, agent-only)',
      resource: '/api/v1/premium-market-data',
    });
  }

  return x402PaymentRequired({
    amountUsd: 0.01,
    description: 'Payment verification is not yet implemented on this endpoint.',
    resource: '/api/v1/premium-market-data',
  });
}