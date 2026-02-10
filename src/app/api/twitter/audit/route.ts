import { NextResponse } from 'next/server';

// DEPRECATED: Twitter audits now go through /api/analyze with platform=twitter
// This route is kept for backwards compatibility but redirects to the new flow
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use POST /api/analyze with platform="twitter" instead.' },
    { status: 410 }
  );
}
