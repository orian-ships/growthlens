import { NextRequest, NextResponse } from 'next/server';
import { createConnectLink, getConnectedAccount } from '@/lib/composio';

// POST /api/connect — create a connect link for Twitter OAuth
export async function POST(req: NextRequest) {
  try {
    const { userId, toolkit, callbackUrl } = await req.json();

    if (!userId || !toolkit) {
      return NextResponse.json(
        { error: 'userId and toolkit are required' },
        { status: 400 }
      );
    }

    if (!['twitter', 'linkedin'].includes(toolkit)) {
      return NextResponse.json(
        { error: 'toolkit must be twitter or linkedin' },
        { status: 400 }
      );
    }

    // Check if already connected
    const existing = await getConnectedAccount(userId, toolkit);
    if (existing && existing.status === 'ACTIVE') {
      return NextResponse.json({
        connected: true,
        connectedAccountId: existing.id,
      });
    }

    const callback = callbackUrl || `${req.nextUrl.origin}/callback`;
    const result = await createConnectLink(userId, toolkit as 'twitter' | 'linkedin', callback);

    return NextResponse.json({
      connected: false,
      redirectUrl: result.redirectUrl,
      connectedAccountId: result.connectedAccountId,
    });
  } catch (error) {
    console.error('[GL] Connect error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 500 }
    );
  }
}

// GET /api/connect?userId=xxx&toolkit=twitter — check connection status
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const toolkit = req.nextUrl.searchParams.get('toolkit');

  if (!userId || !toolkit) {
    return NextResponse.json(
      { error: 'userId and toolkit query params required' },
      { status: 400 }
    );
  }

  const account = await getConnectedAccount(userId, toolkit);

  return NextResponse.json({
    connected: account?.status === 'ACTIVE',
    connectedAccountId: account?.id || null,
    status: account?.status || 'NOT_CONNECTED',
  });
}
