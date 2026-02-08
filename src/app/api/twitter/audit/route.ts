import { NextRequest, NextResponse } from 'next/server';
import { fetchTwitterProfile, searchTwitterPosts, getConnectedAccount } from '@/lib/composio';

// POST /api/twitter/audit — audit a Twitter/X profile
export async function POST(req: NextRequest) {
  try {
    const { username, userId } = await req.json();

    if (!username || !userId) {
      return NextResponse.json(
        { error: 'username and userId are required' },
        { status: 400 }
      );
    }

    // Get connected account
    const account = await getConnectedAccount(userId, 'twitter');
    if (!account || account.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Twitter not connected. Please connect your X account first.' },
        { status: 401 }
      );
    }

    // Fetch profile + posts in parallel
    const [profileData, postsData] = await Promise.all([
      fetchTwitterProfile(account.id, username.replace('@', '')),
      searchTwitterPosts(account.id, username.replace('@', ''), 50),
    ]);

    return NextResponse.json({
      success: true,
      profile: profileData,
      posts: postsData,
    });
  } catch (error) {
    console.error('[GL] Twitter audit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Twitter audit failed' },
      { status: 500 }
    );
  }
}
