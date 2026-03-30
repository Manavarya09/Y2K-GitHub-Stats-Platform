import { NextRequest, NextResponse } from 'next/server';
import { getGitHubUser, calculateStats, analyzePersonality, calculateLevel, getAchievements } from '@/lib/github';

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
    const level = calculateLevel(stats);
    const achievements = getAchievements(stats);

    return NextResponse.json(
      { 
        user: {
          login: user.login,
          avatarUrl: user.avatarUrl,
          name: user.name,
          bio: user.bio,
          company: user.company,
          location: user.location,
          websiteUrl: user.websiteUrl,
          twitterUsername: user.twitterUsername,
          followers: user.followers.totalCount,
          following: user.following.totalCount,
          topRepositories: user.topRepositories,
        },
        stats,
        personality,
        level,
        achievements: achievements.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          rarity: a.rarity,
          unlocked: a.unlocked,
          progress: a.progress,
          maxProgress: a.maxProgress,
        })),
      },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching full data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
