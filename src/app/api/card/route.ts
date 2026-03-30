import { NextRequest, NextResponse } from 'next/server';
import { getGitHubUser, calculateStats, analyzePersonality, calculateLevel } from '@/lib/github';

export const dynamic = 'force-dynamic';

const THEMES = {
  cyberpunk: {
    name: 'Cyberpunk',
    bg1: '#0a0a1a',
    bg2: '#1a0a2a',
    accent1: '#00ffff',
    accent2: '#ff00ff',
    border: '#00ffff',
  },
  sunset: {
    name: 'Sunset Vibes',
    bg1: '#1a0a0a',
    bg2: '#2a1a0a',
    accent1: '#ff6b6b',
    accent2: '#ffd93d',
    border: '#ff6b6b',
  },
  forest: {
    name: 'Forest',
    bg1: '#0a1a0a',
    bg2: '#0a2a1a',
    accent1: '#00ff88',
    accent2: '#00ffff',
    border: '#00ff88',
  },
  ocean: {
    name: 'Ocean',
    bg1: '#0a0a1a',
    bg2: '#0a1a2a',
    accent1: '#0066ff',
    accent2: '#00ffff',
    border: '#0066ff',
  },
  purple: {
    name: 'Purple Haze',
    bg1: '#1a0a2a',
    bg2: '#2a0a3a',
    accent1: '#ff00ff',
    accent2: '#00ff88',
    border: '#ff00ff',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const theme = searchParams.get('theme') || 'cyberpunk';

  if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return NextResponse.json({ error: 'Valid username required' }, { status: 400 });
  }

  const selectedTheme = THEMES[theme as keyof typeof THEMES] || THEMES.cyberpunk;

  try {
    const user = await getGitHubUser(username);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stats = calculateStats(user);
    const personality = analyzePersonality(user, stats);
    const level = calculateLevel(stats);

    const svg = generateCardSVG({
      username: user.login,
      avatar: user.avatarUrl,
      stats,
      personality,
      level,
      theme: selectedTheme,
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating card:', error);
    return NextResponse.json(
      { error: 'Failed to generate card' },
      { status: 500 }
    );
  }
}

interface CardData {
  username: string;
  avatar: string;
  stats: ReturnType<typeof calculateStats>;
  personality: ReturnType<typeof analyzePersonality>;
  level: ReturnType<typeof calculateLevel>;
  theme: typeof THEMES.cyberpunk;
}

function generateCardSVG(data: CardData): string {
  const { username, avatar, stats, personality, level, theme } = data;
  const t = theme;
  
  return `
<svg width="600" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${t.bg1}"/>
      <stop offset="100%" style="stop-color:${t.bg2}"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${t.accent1};stop-opacity:0.5"/>
      <stop offset="50%" style="stop-color:${t.accent2};stop-opacity:0.5"/>
      <stop offset="100%" style="stop-color:${t.accent1};stop-opacity:0.5"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="avatarClip">
      <circle cx="100" cy="100" r="45"/>
    </clipPath>
    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${t.accent1}"/>
      <stop offset="100%" style="stop-color:${t.accent2}"/>
    </linearGradient>
  </defs>
  
  <rect width="600" height="200" rx="16" fill="url(#bgGrad)"/>
  <rect x="2" y="2" width="596" height="196" rx="14" fill="none" stroke="url(#glowGrad)" stroke-width="2" filter="url(#glow)"/>
  
  <!-- Animated grid lines -->
  <g opacity="0.05">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i * 30}" y1="0" x2="${i * 30}" y2="200" stroke="${t.accent1}" stroke-width="1"/>`).join('')}
    ${Array.from({length: 10}, (_, i) => `<line x1="0" y1="${i * 20}" x2="600" y2="${i * 20}" stroke="${t.accent1}" stroke-width="1"/>`).join('')}
  </g>
  
  <circle cx="100" cy="100" r="48" fill="none" stroke="${personality.color}" stroke-width="3" filter="url(#glow)" opacity="0.8"/>
  <circle cx="100" cy="100" r="45" fill="${t.bg1}"/>
  <image x="55" y="55" width="90" height="90" xlink:href="${avatar}" clip-path="url(#avatarClip)"/>
  
  <text x="170" y="50" font-family="monospace" font-size="22" font-weight="bold" fill="#fff">@${username}</text>
  <text x="170" y="72" font-family="monospace" font-size="11" fill="${personality.color}">${personality.type}</text>
  <text x="170" y="86" font-family="monospace" font-size="10" fill="${personality.color}" opacity="0.7">${personality.icon} ${personality.badge}</text>
  
  <rect x="170" y="95" width="120" height="16" rx="3" fill="rgba(255,255,255,0.1)"/>
  <rect x="170" y="95" width="${level.progress * 1.2}" height="16" rx="3" fill="url(#progressGrad)" filter="url(#glow)"/>
  <text x="175" y="106" font-family="monospace" font-size="8" fill="#fff">Lv.${level.level} ${level.title}</text>
  <text x="280" y="106" font-family="monospace" font-size="8" fill="#888">${stats.totalCommits.toLocaleString()} XP</text>
  
  <g transform="translate(310, 45)">
    <text x="0" y="0" font-family="monospace" font-size="10" fill="#666">REPOS</text>
    <text x="0" y="18" font-family="monospace" font-size="16" font-weight="bold" fill="${t.accent1}">${stats.totalRepos}</text>
  </g>
  <g transform="translate(310, 90)">
    <text x="0" y="0" font-family="monospace" font-size="10" fill="#666">STARS</text>
    <text x="0" y="18" font-family="monospace" font-size="16" font-weight="bold" fill="${t.accent2}">${stats.totalStars.toLocaleString()}</text>
  </g>
  <g transform="translate(420, 45)">
    <text x="0" y="0" font-family="monospace" font-size="10" fill="#666">COMMITS</text>
    <text x="0" y="18" font-family="monospace" font-size="16" font-weight="bold" fill="${personality.color}">${stats.totalCommits.toLocaleString()}</text>
  </g>
  <g transform="translate(420, 90)">
    <text x="0" y="0" font-family="monospace" font-size="10" fill="#666">FOLLOWERS</text>
    <text x="0" y="18" font-family="monospace" font-size="16" font-weight="bold" fill="#fff">${stats.followers.toLocaleString()}</text>
  </g>
  
  <!-- Stats badges -->
  <g transform="translate(170, 130)">
    <rect x="0" y="0" width="50" height="24" rx="4" fill="rgba(255,255,255,0.05)"/>
    <text x="25" y="15" font-family="monospace" font-size="9" fill="#666" text-anchor="middle">🔥 ${stats.streak}d</text>
  </g>
  <g transform="translate(225, 130)">
    <rect x="0" y="0" width="50" height="24" rx="4" fill="rgba(255,255,255,0.05)"/>
    <text x="25" y="15" font-family="monospace" font-size="9" fill="#666" text-anchor="middle">⭐ ${stats.totalStars}</text>
  </g>
  <g transform="translate(280, 130)">
    <rect x="0" y="0" width="60" height="24" rx="4" fill="rgba(255,255,255,0.05)"/>
    <text x="30" y="15" font-family="monospace" font-size="9" fill="#666" text-anchor="middle">📚 ${stats.topLanguages[0]?.name || '-'}</text>
  </g>
  
  <text x="580" y="190" font-family="monospace" font-size="9" fill="#444" text-anchor="end">GitWrapped.exe</text>
</svg>
  `.trim();
}
