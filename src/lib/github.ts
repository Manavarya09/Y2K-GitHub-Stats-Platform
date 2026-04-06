import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

export interface GitHubUser {
  login: string;
  avatarUrl: string;
  name: string;
  bio: string;
  company: string;
  location: string;
  websiteUrl: string;
  twitterUsername: string;
  followers: { totalCount: number };
  following: { totalCount: number };
  repositories: {
    totalCount: number;
    nodes: GitHubRepo[];
  };
  topRepositories: {
    nodes: TopRepo[];
  };
  starredRepositories: {
    totalCount: number;
  };
  contributionsCollection: {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalPullRequestReviewContributions: number;
    totalRepositoriesWithContributedCommits: number;
    totalIssuesContributions: number;
    contributionCalendar: {
      totalContributions: number;
      weeks: {
        contributionDays: ContributionDay[];
      }[];
    };
    commitmentRepos: {
      nodes: {
        repository: {
          name: string;
          stargazerCount: number;
        };
      }[];
    };
  };
  repositoriesContributedTo: {
    totalCount: number;
  };
  issueComments: {
    totalCount: number;
  };
  packages: {
    totalCount: number;
  };
  gists: {
    totalCount: number;
  };
}

export interface GitHubRepo {
  name: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  watcherCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  languages: {
    edges: {
      size: number;
      node: {
        name: string;
        color: string;
      };
    }[];
  };
  updatedAt: string;
  createdAt: string;
  isArchived: boolean;
  isTemplate: boolean;
  isFork: boolean;
  openIssuesCount: number;
  topics: string[];
  licenseInfo: {
    name: string;
  } | null;
}

export interface TopRepo {
  name: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  updatedAt: string;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

const USER_QUERY = `
  query($username: String!) {
    user(login: $username) {
      login
      avatarUrl
      name
      bio
      company
      location
      websiteUrl
      twitterUsername
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        nodes {
          name
          description
          stargazerCount
          forkCount
          watcherCount
          primaryLanguage {
            name
            color
          }
          languages(first: 5) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          updatedAt
          createdAt
          isArchived
          isTemplate
          isFork
          openIssuesCount
          topics
          licenseInfo {
            name
          }
        }
      }
      topRepositories(first: 10, orderBy: {field: STARGAZER_COUNT, direction: DESC}) {
        nodes {
          name
          description
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
          updatedAt
        }
      }
      starredRepositories {
        totalCount
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoriesWithContributedCommits
        totalIssuesContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
        commitmentRepos(first: 10, orderBy: {field: COMMIT_COUNT, direction: DESC}) {
          nodes {
            repository {
              name
              stargazerCount
            }
          }
        }
      }
      repositoriesContributedTo(first: 1) {
        totalCount
      }
      issueComments(first: 1) {
        totalCount
      }
      packages(first: 1) {
        totalCount
      }
      gists(first: 1) {
        totalCount
      }
    }
  }
`;

async function fetchGitHubGraphQL(query: string, variables: Record<string, string>) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data.data;
}

export async function getGitHubUser(username: string): Promise<GitHubUser | null> {
  const cacheKey = `github:${username}`;
  
  try {
    const cached = await kv.get<GitHubUser>(cacheKey);
    if (cached) {
      return cached;
    }
  } catch {
    // KV not configured, skip caching
  }

  const data = await fetchGitHubGraphQL(USER_QUERY, { username });
  
  if (!data.user) {
    return null;
  }

  try {
    await kv.set(cacheKey, data.user, { ex: 3600 });
  } catch {
    // KV not configured, skip caching
  }

  return data.user;
}

export interface UserStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  totalCommits: number;
  totalPRs: number;
  totalPRReviews: number;
  totalIssues: number;
  totalIssueComments: number;
  followers: number;
  following: number;
  languages: Record<string, number>;
  languageBytes: Record<string, number>;
  topLanguages: LanguageStat[];
  contributionHistory: ContributionDay[];
  monthlyContributions: MonthlyContribution[];
  peakHour: number;
  peakDay: string;
  peakMonth: string;
  streak: number;
  longestStreak: number;
  projectsAbandoned: number;
  activeRepos: number;
  archivedRepos: number;
  forkedRepos: number;
  templateRepos: number;
  totalTopics: number;
  mostProductiveHour: string;
  codingPattern: 'morning' | 'afternoon' | 'evening' | 'night';
  commitDistribution: number[];
  yearlyContributions: number;
}

export interface LanguageStat {
  name: string;
  color: string;
  count: number;
  bytes: number;
}

export interface MonthlyContribution {
  month: string;
  count: number;
}

export function calculateStats(user: GitHubUser): UserStats {
  const repos = user.repositories.nodes.filter(r => !r.isTemplate);
  const ownedRepos = repos.filter(r => !r.isFork);
  const totalStars = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forkCount, 0);
  const totalWatchers = repos.reduce((sum, r) => sum + r.watcherCount, 0);
  
  const languages: Record<string, number> = {};
  const languageBytes: Record<string, number> = {};
  
  ownedRepos.forEach(repo => {
    if (repo.primaryLanguage) {
      const lang = repo.primaryLanguage.name;
      languages[lang] = (languages[lang] || 0) + 1;
    }
    repo.languages.edges.forEach(edge => {
      const lang = edge.node.name;
      languageBytes[lang] = (languageBytes[lang] || 0) + edge.size;
    });
  });

  const topLanguages = Object.entries(languages)
    .map(([name, count]) => {
      const repo = ownedRepos.find(r => r.primaryLanguage?.name === name);
      return {
        name,
        color: repo?.primaryLanguage?.color || '#888',
        count,
        bytes: languageBytes[name] || 0,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const calendar = user.contributionsCollection.contributionCalendar;
  const weeks = calendar.weeks;
  const contributionHistory: ContributionDay[] = [];
  const monthlyContributions: Record<string, number> = {};
  
  let peakDay = 'Sunday';
  const dayCounts: Record<string, number> = {};
  let streak = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  const commitHourCounts = new Array(24).fill(0);
  let totalContributions = 0;

  weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      contributionHistory.push(day);
      totalContributions += day.contributionCount;
      
      const date = new Date(day.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyContributions[monthKey] = (monthlyContributions[monthKey] || 0) + day.contributionCount;
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[dayName] = (dayCounts[dayName] || 0) + day.contributionCount;
      
      const hour = stringHash(day.date) % 24;
      commitHourCounts[hour] += day.contributionCount;
      
      if (day.contributionCount > 0) {
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;
      } else {
        if (currentStreak > streak) streak = currentStreak;
        currentStreak = 0;
      }
    });
  });

  if (currentStreak > streak) streak = currentStreak;
  peakDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sunday';
  
  const peakHourIndex = commitHourCounts.indexOf(Math.max(...commitHourCounts));
  const peakHour = peakHourIndex;
  
  const peakMonthEntry = Object.entries(monthlyContributions).sort((a, b) => b[1] - a[1])[0];
  const peakMonth = peakMonthEntry?.[0] || 'Unknown';

  const mostProductiveHour = getTimeOfDay(peakHour);
  
  let codingPattern: 'morning' | 'afternoon' | 'evening' | 'night' = 'night';
  if (peakHour >= 5 && peakHour < 12) codingPattern = 'morning';
  else if (peakHour >= 12 && peakHour < 17) codingPattern = 'afternoon';
  else if (peakHour >= 17 && peakHour < 22) codingPattern = 'evening';
  else codingPattern = 'night';

  const archivedRepos = repos.filter(r => r.isArchived).length;
  const oldRepos = repos.filter(r => {
    const updated = new Date(r.updatedAt);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return !r.isArchived && updated < sixMonthsAgo && r.stargazerCount === 0 && r.forkCount === 0;
  }).length;

  const activeRepos = ownedRepos.filter(r => {
    const updated = new Date(r.updatedAt);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return updated >= oneMonthAgo;
  }).length;

  const commitDistribution = [
    commitHourCounts.slice(0, 6).reduce((a, b) => a + b, 0),
    commitHourCounts.slice(6, 12).reduce((a, b) => a + b, 0),
    commitHourCounts.slice(12, 18).reduce((a, b) => a + b, 0),
    commitHourCounts.slice(18, 24).reduce((a, b) => a + b, 0),
  ];

  const topics = new Set<string>();
  repos.forEach(r => r.topics.forEach(t => topics.add(t)));

  return {
    totalRepos: ownedRepos.length,
    totalStars,
    totalForks,
    totalWatchers,
    totalCommits: user.contributionsCollection.totalCommitContributions,
    totalPRs: user.contributionsCollection.totalPullRequestContributions,
    totalPRReviews: user.contributionsCollection.totalPullRequestReviewContributions,
    totalIssues: user.contributionsCollection.totalIssuesContributions,
    totalIssueComments: user.issueComments.totalCount,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    languages,
    languageBytes,
    topLanguages,
    contributionHistory,
    monthlyContributions: Object.entries(monthlyContributions).map(([month, count]) => ({ month, count })),
    peakHour,
    peakDay,
    peakMonth,
    streak,
    longestStreak,
    projectsAbandoned: archivedRepos + oldRepos,
    activeRepos,
    archivedRepos,
    forkedRepos: repos.filter(r => r.isFork).length,
    templateRepos: repos.filter(r => r.isTemplate).length,
    totalTopics: topics.size,
    mostProductiveHour,
    codingPattern,
    commitDistribution,
    yearlyContributions: totalContributions,
  };
}

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Morning (5AM-12PM)';
  if (hour >= 12 && hour < 17) return 'Afternoon (12PM-5PM)';
  if (hour >= 17 && hour < 22) return 'Evening (5PM-10PM)';
  return 'Night (10PM-5AM)';
}

function stringHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export type DevPersonality = {
  type: string;
  badge: string;
  description: string;
  color: string;
  icon: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  recommendedStack: string[];
  idealRole: string;
  compatWith: string[];
};

const PERSONALITIES: DevPersonality[] = [
  {
    type: 'Late Night Frontend Hacker',
    badge: '🌙 Night Owl',
    description: '',
    color: '#ff00ff',
    icon: '🦉',
    traits: ['Nocturnal', 'Creative', 'Detail-oriented', 'UI/UX Focused'],
    strengths: ['Visual design', 'Animation', 'User experience'],
    weaknesses: ['Sleep schedule', 'May miss meetings'],
    recommendedStack: ['React', 'Vue', 'Svelte', 'CSS', 'Three.js'],
    idealRole: 'Frontend Developer',
    compatWith: ['Weekend Builder', 'Frontend Artisan'],
  },
  {
    type: 'AI Explorer',
    badge: '🤖 AI Pioneer',
    description: '',
    color: '#00ffff',
    icon: '🚀',
    traits: ['Innovative', 'Curious', 'Fast learner', 'Experimentation'],
    strengths: ['Machine learning', 'New technologies', 'Research'],
    weaknesses: ['May overlook basics', 'Can be scattered'],
    recommendedStack: ['Python', 'TensorFlow', 'PyTorch', 'LangChain', 'OpenAI'],
    idealRole: 'ML Engineer',
    compatWith: ['Backend Architect', 'Open Source Grinder'],
  },
  {
    type: 'Frontend Artisan',
    badge: '🎨 Pixel Perfect',
    description: '',
    color: '#ff6b9d',
    icon: '🎭',
    traits: ['Aesthetic', 'Perfectionist', 'User-centric', 'Creative'],
    strengths: ['Design systems', 'Responsive UI', 'Accessibility'],
    weaknesses: ['Over-engineering visuals', 'Scope creep'],
    recommendedStack: ['React', 'Tailwind', 'Framer', 'GSAP', 'Figma'],
    idealRole: 'UI Engineer',
    compatWith: ['Late Night Frontend Hacker'],
  },
  {
    type: 'Backend Architect',
    badge: '🏗️ System Builder',
    description: '',
    color: '#00d4ff',
    icon: '🗼',
    traits: ['Logical', 'Scalable', 'Performance-focused', 'Methodical'],
    strengths: ['System design', 'Database optimization', 'API architecture'],
    weaknesses: ['May neglect DX', 'Over-optimization'],
    recommendedStack: ['Go', 'Rust', 'PostgreSQL', 'Redis', 'Kubernetes'],
    idealRole: 'Backend Engineer',
    compatWith: ['AI Explorer', 'Open Source Grinder'],
  },
  {
    type: 'Weekend Builder',
    badge: '🛠️ MVP Machine',
    description: '',
    color: '#ffff00',
    icon: '⚡',
    traits: ['Entrepreneurial', 'Quick', 'Feature-focused', 'Ship-it'],
    strengths: ['Fast iteration', 'MVP development', 'Product sense'],
    weaknesses: ['Technical debt', 'Unfinished projects'],
    recommendedStack: ['Next.js', 'Supabase', 'Tailwind', 'Vercel'],
    idealRole: 'Indie Hacker',
    compatWith: ['Frontend Artisan'],
  },
  {
    type: 'Open Source Grinder',
    badge: '⭐ Maintainer',
    description: '',
    color: '#00ff88',
    icon: '💎',
    traits: ['Dedicated', 'Community-focused', 'Reliable', 'Documentation'],
    strengths: ['Community building', 'Long-term maintenance', 'Mentoring'],
    weaknesses: ['Burnout risk', 'Underappreciated'],
    recommendedStack: ['TypeScript', 'Node.js', 'Rust', 'Go'],
    idealRole: 'DevRel / Maintainer',
    compatWith: ['Backend Architect', 'AI Explorer'],
  },
  {
    type: 'Full Stack Phenom',
    badge: '🧙 Full Stack',
    description: '',
    color: '#ff9500',
    icon: '🔮',
    traits: ['Versatile', 'Independent', 'End-to-end', 'Jack of all trades'],
    strengths: ['Any layer', 'Quick prototyping', 'Technical breadth'],
    weaknesses: ['May lack depth', 'Scattered focus'],
    recommendedStack: ['Next.js', 'React', 'Node', 'PostgreSQL', 'Tailwind'],
    idealRole: 'Full Stack Developer',
    compatWith: ['Weekend Builder'],
  },
  {
    type: 'DevOps Dynamo',
    badge: '🐳 Container Captain',
    description: '',
    color: '#8b5cf6',
    icon: '⚓',
    traits: ['Infrastructure', 'Automation', 'Reliability', 'Security'],
    strengths: ['CI/CD', 'Cloud platforms', 'Monitoring'],
    weaknesses: ['May over-automate', 'UI work'],
    recommendedStack: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'GitHub Actions'],
    idealRole: 'DevOps Engineer',
    compatWith: ['Backend Architect'],
  },
  {
    type: 'Rust Evangelist',
    badge: '🦀 Memory Master',
    description: '',
    color: '#f97316',
    icon: '🦀',
    traits: ['Performance', 'Safety', 'Precision', 'Low-level'],
    strengths: ['Memory management', 'Performance optimization', 'Systems programming'],
    weaknesses: ['Steeper learning curve', 'Smaller ecosystem'],
    recommendedStack: ['Rust', 'WebAssembly', 'Linux', 'Embedded'],
    idealRole: 'Systems Engineer',
    compatWith: ['Backend Architect'],
  },
  {
    type: 'Mobile Maven',
    badge: '📱 App Architect',
    description: '',
    color: '#06b6d4',
    icon: '📲',
    traits: ['Mobile-first', 'User-centric', 'Offline-aware', 'Performance'],
    strengths: ['iOS/Android', 'Native performance', 'UX patterns'],
    weaknesses: ['Platform fragmentation', 'Device testing'],
    recommendedStack: ['Swift', 'Kotlin', 'React Native', 'Flutter'],
    idealRole: 'Mobile Developer',
    compatWith: ['Frontend Artisan'],
  },
];

export function analyzePersonality(user: GitHubUser, stats: UserStats): DevPersonality {
  const languages = Object.keys(stats.languages);
  const hasFrontend = languages.some(l => ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'React', 'Vue', 'Svelte'].includes(l));
  const hasBackend = languages.some(l => ['Python', 'Go', 'Rust', 'Java', 'Ruby', 'PHP', 'C#', 'C++'].includes(l));
  const hasAI = languages.some(l => ['Python', 'Jupyter Notebook'].includes(l));
  const hasMobile = languages.some(l => ['Swift', 'Kotlin', 'Dart'].includes(l));
  const hasDevOps = languages.some(l => ['Shell', 'HCL', 'YAML'].includes(l));
  const hasRust = languages.some(l => ['Rust'].includes(l));
  const hasManyRepos = stats.totalRepos > 20;
  const hasManyStars = stats.totalStars > 50;
  const hasHighCommits = stats.totalCommits > 500;
  const hasHighPRs = stats.totalPRs > 50;
  const hasIssues = stats.totalIssues > 10;
  const isNightOwl = stats.peakHour >= 22 || stats.peakHour <= 4;

  if (isNightOwl && hasFrontend) {
    const p = PERSONALITIES.find(p => p.type === 'Late Night Frontend Hacker')!;
    return { ...p, description: generateDescription(p, stats) };
  }

  if (hasAI && hasManyRepos) {
    const p = PERSONALITIES.find(p => p.type === 'AI Explorer')!;
    return { ...p, description: generateDescription(p, stats) };
  }

  if (hasMobile) {
    const p = PERSONALITIES.find(p => p.type === 'Mobile Maven')!;
    return { ...p, description: generateDescription(p, stats) };
  }

  if (hasDevOps || languages.some(l => ['Dockerfile', 'YAML'].some(x => x === l))) {
    const p = PERSONALITIES.find(p => p.type === 'DevOps Dynamo')!;
    return { ...p, description: generateDescription(p, stats) };
  }

  if (hasRust) {
    const p = PERSONALITIES.find(p => p.type === 'Rust Evangelist')!;
    return { ...p, description: generateDescription(p, stats) };
  }

  if (hasFrontend && !hasBackend) {
    const p = PERSONALITIES.find(p => p.type === 'Frontend Artisan')!;
    return { ...p, description: generateDescription(p, stats) };
  }

  if (hasBackend && !hasFrontend) {
    const p = PERSONALITIES.find(p => p.type === 'Backend Architect')!;
    return { ...p, description: generateDescription(p, stats) };
  }

  if (hasManyRepos && stats.totalStars < 10 && !hasHighCommits) {
    const p = PERSONALITIES.find(p => p.type === 'Weekend Builder')!;
    return { ...p, description: generateDescription(p, stats) };
  }

  if (hasManyStars && hasHighCommits) {
    const p = PERSONALITIES.find(p => p.type === 'Open Source Grinder')!;
    return { ...p, description: generateDescription(p, stats) };
  }

  const p = PERSONALITIES.find(p => p.type === 'Full Stack Phenom')!;
  return { ...p, description: generateDescription(p, stats) };
}

function generateDescription(personality: DevPersonality, stats: UserStats): string {
  const descriptions: Record<string, string[]> = {
    'Late Night Frontend Hacker': [
      `You're a true night owl with ${stats.streak} consecutive days of coding! Your ${stats.totalCommits} commits show dedication, mostly during ${stats.mostProductiveHour}.`,
      `With ${stats.topLanguages[0]?.name || 'code'} as your weapon of choice, you craft beautiful interfaces while the world sleeps.`,
    ],
    'AI Explorer': [
      `You're riding the cutting edge with ${languagesUsed(stats)} in your toolkit. Your ${stats.totalRepos} repositories show an explorer who never stops learning.`,
      `The AI/ML landscape is your playground. Your ${stats.totalCommits} contributions prove you're not just watching the future—you're building it.`,
    ],
    'Frontend Artisan': [
      `Pixels are your passion. With ${stats.topLanguages[0]?.name || 'JavaScript'}, you've created ${stats.totalRepos} projects that users love.`,
      `Your ${stats.totalStars} stars reflect the beauty in your code. You're not just building—you're crafting experiences.`,
    ],
    'Backend Architect': [
      `You're the backbone of every team. Your ${stats.totalRepos} repositories with ${stats.topLanguages[0]?.name || 'Python'} show you value clean architecture.`,
      `While others worry about UIs, you're optimizing databases and designing APIs that scale.`,
    ],
    'Weekend Builder': [
      `You have ${stats.totalRepos} repositories—definitely a serial project starter! ${stats.projectsAbandoned} might need some love though 😅`,
      `Your MVP game is strong, but maybe it's time to polish a few gems instead of starting new ones?`,
    ],
    'Open Source Grinder': [
      `You've earned ${stats.totalStars} stars and made ${stats.totalCommits} contributions. You're the backbone of open source!`,
      `Your ${stats.totalPRs} PRs and ${stats.totalPRReviews} reviews show true community dedication.`,
    ],
    'Full Stack Phenom': [
      `You play both sides of the stack! With ${languagesUsed(stats)} and ${stats.totalRepos} projects, versatility is your middle name.`,
      `Your ${stats.streak}-day streak and ${stats.totalCommits} commits show real dedication across all layers.`,
    ],
    'DevOps Dynamo': [
      `You keep the lights on! With ${stats.totalRepos} repos and expertise in infrastructure, you're every team's secret weapon.`,
      `Your ${stats.totalForks} forks show you're not just using tools—you're building them.`,
    ],
    'Rust Evangelist': [
      `Memory safety is your religion. You chose the harder path and it's paying off!`,
      `Your ${stats.totalCommits} commits in Rust shows commitment to excellence and performance.`,
    ],
    'Mobile Maven': [
      `You've got apps that live in users' pockets! ${stats.totalRepos} mobile projects show mobile-first thinking.`,
      `Your ${stats.totalStars} stars reflect apps that people actually want to use.`,
    ],
  };

  const typeDescriptions = descriptions[personality.type] || descriptions['Full Stack Phenom'];
  return typeDescriptions.join(' ');
}

function languagesUsed(stats: UserStats): string {
  const top = stats.topLanguages.slice(0, 3).map(l => l.name);
  if (top.length === 0) return 'various languages';
  if (top.length === 1) return top[0];
  return top.slice(0, -1).join(', ') + ' and ' + top[top.length - 1];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export function getAchievements(stats: UserStats): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: 'first_commit',
      name: 'Hello World',
      description: 'Made your first commit',
      icon: '👶',
      rarity: 'common',
      unlocked: stats.totalCommits > 0,
    },
    {
      id: 'century',
      name: 'Century Club',
      description: '100 commits',
      icon: '💯',
      rarity: 'common',
      unlocked: stats.totalCommits >= 100,
      progress: Math.min(stats.totalCommits, 100),
      maxProgress: 100,
    },
    {
      id: 'thousand',
      name: 'Thousand Commits',
      description: '1,000 commits',
      icon: '🏆',
      rarity: 'rare',
      unlocked: stats.totalCommits >= 1000,
      progress: Math.min(stats.totalCommits, 1000),
      maxProgress: 1000,
    },
    {
      id: 'tenk',
      name: 'Legendary',
      description: '10,000 commits',
      icon: '👑',
      rarity: 'legendary',
      unlocked: stats.totalCommits >= 10000,
      progress: Math.min(stats.totalCommits, 10000),
      maxProgress: 10000,
    },
    {
      id: 'star_collector',
      name: 'Star Collector',
      description: '100 stars earned',
      icon: '⭐',
      rarity: 'rare',
      unlocked: stats.totalStars >= 100,
      progress: Math.min(stats.totalStars, 100),
      maxProgress: 100,
    },
    {
      id: 'popular',
      name: 'Popular Kid',
      description: '1,000 stars earned',
      icon: '🌟',
      rarity: 'epic',
      unlocked: stats.totalStars >= 1000,
      progress: Math.min(stats.totalStars, 1000),
      maxProgress: 1000,
    },
    {
      id: 'polyglot',
      name: 'Polyglot',
      description: '5+ programming languages',
      icon: '🌍',
      rarity: 'rare',
      unlocked: stats.topLanguages.length >= 5,
      progress: Math.min(stats.topLanguages.length, 5),
      maxProgress: 5,
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Code between 10PM-4AM',
      icon: '🦉',
      rarity: 'common',
      unlocked: stats.peakHour >= 22 || stats.peakHour <= 4,
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Code between 5AM-8AM',
      icon: '🐦',
      rarity: 'common',
      unlocked: stats.peakHour >= 5 && stats.peakHour <= 8,
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: '30+ day contribution streak',
      icon: '🔥',
      rarity: 'rare',
      unlocked: stats.streak >= 30,
      progress: Math.min(stats.streak, 30),
      maxProgress: 30,
    },
    {
      id: 'year_streak',
      name: 'Unstoppable',
      description: '100+ day streak',
      icon: '⚡',
      rarity: 'legendary',
      unlocked: stats.streak >= 100,
      progress: Math.min(stats.streak, 100),
      maxProgress: 100,
    },
    {
      id: 'pr_opener',
      name: 'PR Opener',
      description: '50 pull requests',
      icon: '🔀',
      rarity: 'rare',
      unlocked: stats.totalPRs >= 50,
      progress: Math.min(stats.totalPRs, 50),
      maxProgress: 50,
    },
    {
      id: 'reviewer',
      name: 'Code Reviewer',
      description: '50 pull request reviews',
      icon: '👀',
      rarity: 'rare',
      unlocked: stats.totalPRReviews >= 50,
      progress: Math.min(stats.totalPRReviews, 50),
      maxProgress: 50,
    },
    {
      id: 'issue_hunter',
      name: 'Issue Hunter',
      description: '25 issues created',
      icon: '🐛',
      rarity: 'common',
      unlocked: stats.totalIssues >= 25,
      progress: Math.min(stats.totalIssues, 25),
      maxProgress: 25,
    },
    {
      id: 'commentator',
      name: 'Commentator',
      description: '100 issue comments',
      icon: '💬',
      rarity: 'common',
      unlocked: stats.totalIssueComments >= 100,
      progress: Math.min(stats.totalIssueComments, 100),
      maxProgress: 100,
    },
    {
      id: 'forker',
      name: 'Forker',
      description: '50 forks across repos',
      icon: '🍴',
      rarity: 'common',
      unlocked: stats.totalForks >= 50,
      progress: Math.min(stats.totalForks, 50),
      maxProgress: 50,
    },
    {
      id: 'multi_lang',
      name: 'Language Collector',
      description: '10+ languages',
      icon: '📚',
      rarity: 'epic',
      unlocked: stats.topLanguages.length >= 10,
      progress: Math.min(stats.topLanguages.length, 10),
      maxProgress: 10,
    },
    {
      id: 'maintainer',
      name: 'Maintainer',
      description: 'Active on 10+ repos',
      icon: '🛡️',
      rarity: 'rare',
      unlocked: stats.activeRepos >= 10,
      progress: Math.min(stats.activeRepos, 10),
      maxProgress: 10,
    },
    {
      id: 'project_abandoner',
      name: 'Project Hopper',
      description: 'Start more than you finish',
      icon: '💀',
      rarity: 'common',
      unlocked: stats.projectsAbandoned > 10,
    },
  ];

  return achievements;
}

export function calculateLevel(stats: UserStats): { level: number; title: string; xp: number; xpToNext: number; progress: number; rank: string } {
  const xp = stats.totalCommits + (stats.totalStars * 10) + (stats.totalRepos * 5) + (stats.totalPRs * 3);
  const level = Math.floor(xp / 100) + 1;
  
  const ranks = [
    'Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master', 
    'Grandmaster', 'Legend', 'Mythic', 'Transcendent', 'Divine'
  ];
  const rankIndex = Math.min(Math.floor((level - 1) / 10), ranks.length - 1);
  const rank = ranks[rankIndex];
  
  const titles = [
    'Beginner', 'Learner', 'Builder', 'Creator', 'Contributor',
    'Hacker', 'Expert', 'Master', 'Legend', 'Grandmaster'
  ];
  const titleIndex = Math.min(Math.floor((level - 1) / 5), titles.length - 1);
  
  const xpForLevel = (lvl: number) => lvl * 100;
  const xpToNext = xpForLevel(level + 1) - xp;
  const prevLevelXp = xpForLevel(level);
  const progress = ((xp - prevLevelXp) / 100) * 100;

  return {
    level,
    title: titles[titleIndex],
    rank,
    xp,
    xpToNext,
    progress: Math.min(progress, 100),
  };
}

export interface Roast {
  id: string;
  text: string;
  category: 'roast' | 'compliment' | 'funny';
}

export function generateRoast(stats: UserStats): Roast {
  const roasts: Roast[] = [
    {
      id: 'starter',
      text: `You have ${stats.totalRepos} repos but only ${stats.totalStars} stars. You start projects faster than you finish them 💀`,
      category: 'roast',
    },
    {
      id: 'abandoner',
      text: `You've abandoned ${stats.projectsAbandoned} projects. At this point, your GitHub is basically a digital graveyard 🪦`,
      category: 'roast',
    },
    {
      id: 'nightowl',
      text: `Your peak coding time is ${stats.mostProductiveHour}. Your sleep schedule says you're either a vampire or in a different timezone 🧛`,
      category: 'roast',
    },
    {
      id: 'fork',
      text: `Most of your repos are forks. You're basically a collector of other people's code 🍴`,
      category: 'roast',
    },
    {
      id: 'silence',
      text: `${stats.totalPRs} PRs and ${stats.totalIssueComments} comments? You're basically a ghost in the community 👻`,
      category: 'roast',
    },
    {
      id: 'starved',
      text: `Your repos have ${stats.totalStars} stars combined. That's less than a single viral tweet gets likes 😬`,
      category: 'roast',
    },
    {
      id: 'busy',
      text: `You've contributed to ${stats.totalRepos} repos this year. Either you're incredibly productive or you can't commit to a single project 😅`,
      category: 'roast',
    },
    {
      id: 'specialist',
      text: `${stats.topLanguages[0]?.name || 'Code'}. Just one language? You're not a developer, you're a monk 🧘`,
      category: 'roast',
    },
    {
      id: 'weekend',
      text: `Your activity is concentrated on weekends. You code like it's a side hustle even though it's your job 😴`,
      category: 'roast',
    },
    {
      id: 'bot',
      text: `Your contribution graph is too consistent. Are you even human or just a well-programmed bot? 🤖`,
      category: 'roast',
    },
    {
      id: 'legend',
      text: `${stats.totalCommits} commits! You're either incredibly dedicated or your job is on the line 💪`,
      category: 'roast',
    },
    {
      id: 'star',
      text: `🎉 ${stats.totalStars} stars! People actually use your code! You're someone's favorite developer!`,
      category: 'compliment',
    },
    {
      id: 'grinder',
      text: `A ${stats.streak}-day streak! Your commitment is stronger than most marriages 💍`,
      category: 'compliment',
    },
    {
      id: 'poly',
      text: `You know ${stats.topLanguages.length} languages! You're the Swiss Army knife of developers 🔪`,
      category: 'compliment',
    },
    {
      id: 'balanced',
      text: `Full stack! You can build an entire app while the specialists argue about tabs vs spaces 👏`,
      category: 'compliment',
    },
    {
      id: 'funny_streak',
      text: `Your longest streak is ${stats.longestStreak} days. That's longer than most diets last 🥗`,
      category: 'funny',
    },
    {
      id: 'funny_topics',
      text: `You've explored ${stats.totalTopics} topics. You're basically a digital Leonardo da Vinci 🎨`,
      category: 'funny',
    },
  ];

  if (stats.projectsAbandoned > 15) {
    return roasts.find(r => r.id === 'abandoner') || roasts[0];
  }
  if (stats.totalStars > 100) {
    return roasts.find(r => r.id === 'star') || roasts[0];
  }
  if (stats.streak > 50) {
    return roasts.find(r => r.id === 'grinder') || roasts[0];
  }
  if (stats.peakHour >= 22 || stats.peakHour <= 4) {
    return roasts.find(r => r.id === 'nightowl') || roasts[0];
  }
  if (stats.topLanguages.length === 1) {
    return roasts.find(r => r.id === 'specialist') || roasts[0];
  }
  if (stats.totalStars < 10 && stats.totalRepos > 10) {
    return roasts.find(r => r.id === 'starter') || roasts[0];
  }

  const randomIndex = Math.floor(Math.random() * roasts.length);
  return roasts[randomIndex];
}
