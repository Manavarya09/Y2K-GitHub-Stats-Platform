import { NextRequest, NextResponse } from 'next/server';
import { getGitHubUser, calculateStats, analyzePersonality } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return NextResponse.json({ error: 'Valid username required' }, { status: 400 });
  }

  try {
    const user = await getGitHubUser(username);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stats = calculateStats(user);
    const personality = analyzePersonality(user, stats);

    return NextResponse.json(
      { personality },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error analyzing personality:', error);
    return NextResponse.json(
      { error: 'Failed to analyze personality' },
      { status: 500 }
    );
  }
}
