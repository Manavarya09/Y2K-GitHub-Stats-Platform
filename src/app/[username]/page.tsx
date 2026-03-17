'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProfileCard } from '@/components/ProfileCard';
import { StatsDashboard } from '@/components/StatsDashboard';
import { PersonalitySection } from '@/components/PersonalitySection';
import { GitHubWrapped } from '@/components/GitHubWrapped';
import { DeepInsights } from '@/components/DeepInsights';
import { ReadmeGenerator } from '@/components/ReadmeGenerator';
import { ResultsNav } from '@/components/ResultsNav';
import { GlassPanel } from '@/components/GlassPanel';
import { ContributionHeatmap } from '@/components/ContributionHeatmap';
import { AchievementsSection } from '@/components/AchievementsSection';
import { RoastCard } from '@/components/RoastCard';
import { TopReposSection } from '@/components/TopReposSection';
import { LanguageChart } from '@/components/LanguageChart';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { CodingPatternViz } from '@/components/CodingPatternViz';

interface UserData {
  user: {
    login: string;
    avatarUrl: string;
    name: string;
    bio: string;
    company: string;
    location: string;
    websiteUrl: string;
    followers: { totalCount: number };
    following: { totalCount: number };
    topRepositories: {
      nodes: Array<{
        name: string;
        description: string;
        stargazerCount: number;
        forkCount: number;
        primaryLanguage: { name: string; color: string } | null;
      }>;
    };
  };
  stats: {
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
    topLanguages: Array<{ name: string; color: string; count: number; bytes: number }>;
    contributionHistory: Array<{ date: string; contributionCount: number; color: string }>;
    monthlyContributions: Array<{ month: string; count: number }>;
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
  };
  personality: {
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
  };
  level: {
    level: number;
    title: string;
    rank: string;
    xp: number;
    xpToNext: number;
    progress: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlocked: boolean;
    progress?: number;
    maxProgress?: number;
  }>;
  roast: {
    id: string;
    text: string;
    category: 'roast' | 'compliment' | 'funny';
  };
}

export default function ResultsPage() {
  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roast, setRoast] = useState<UserData['roast'] | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const [userRes, personalityRes] = await Promise.all([
          fetch(`/api/user?username=${username}`),
          fetch(`/api/personality?username=${username}`),
        ]);

        if (!userRes.ok) {
          if (userRes.status === 404) {
            throw new Error('User not found');
          }
          throw new Error('Failed to fetch user data');
        }

        const userData = await userRes.json();
        const personalityData = await personalityRes.json();

        const xp = userData.stats.totalCommits + (userData.stats.totalStars * 10) + (userData.stats.totalRepos * 5) + (userData.stats.totalPRs * 3);
        const level = Math.floor(xp / 100) + 1;
        const ranks = ['Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master', 'Grandmaster', 'Legend', 'Mythic', 'Transcendent', 'Divine'];
        const rankIndex = Math.min(Math.floor((level - 1) / 10), ranks.length - 1);
        const rank = ranks[rankIndex];
        const titles = ['Beginner', 'Learner', 'Builder', 'Creator', 'Contributor', 'Hacker', 'Expert', 'Master', 'Legend', 'Grandmaster'];
        const titleIndex = Math.min(Math.floor((level - 1) / 5), titles.length - 1);
        const xpForLevel = (lvl: number) => lvl * 100;
        const xpToNext = xpForLevel(level + 1) - xp;
        const prevLevelXp = xpForLevel(level);
        const progress = Math.min(((xp - prevLevelXp) / 100) * 100, 100);

        const achievements = generateAchievements(userData.stats);

        const roasts = generateRoasts(userData.stats);
        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

        setData({
          ...userData,
          personality: personalityData.personality,
          level: {
            level,
            title: titles[titleIndex],
            rank,
            xp,
            xpToNext,
            progress,
          },
          achievements,
        });
        setRoast(randomRoast);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 star-field opacity-50" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 text-center"
        >
          <GlassPanel glowColor="cyan" className="p-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-6 border-4 border-t-transparent rounded-full"
              style={{ borderColor: 'var(--neon-cyan)', borderTopColor: 'transparent' }}
            />
            <div className="font-orbitron text-xl text-[var(--neon-cyan)]">
              Analyzing @{username}...
            </div>
            <div className="font-mono text-sm text-gray-400 mt-2">
              Computing personality matrix & achievements
            </div>
            <div className="w-64 h-2 bg-gray-800 rounded-full mt-4 overflow-hidden">
              <motion.div
                className="h-full gradient-animate"
                style={{ background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta))' }}
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 star-field opacity-50" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-md"
        >
          <GlassPanel glowColor="magenta" className="p-8">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="font-orbitron text-2xl font-bold text-[var(--neon-magenta)] mb-2">
              Oops!
            </h2>
            <p className="font-mono text-gray-400 mb-6">{error}</p>
            <a
              href="/"
              className="inline-block chrome-button px-6 py-3 font-orbitron text-sm uppercase tracking-wider text-[var(--neon-cyan)]"
            >
              ← Try Again
            </a>
          </GlassPanel>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const handleNewRoast = () => {
    const roasts = generateRoasts(data.stats);
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    setRoast(randomRoast);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      <div className="fixed inset-0 star-field opacity-30" />
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(var(--neon-cyan) 1px, transparent 1px),
            linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      <ResultsNav username={username} />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block pixel-badge mb-4">✨ ANALYSIS COMPLETE</div>
          <h1 className="font-orbitron text-4xl md:text-5xl font-black">
            <span className="text-[var(--neon-cyan)]">@</span>
            <span className="text-white">{username}</span>
          </h1>
          <p className="font-mono text-gray-400 mt-2">
            Rank: <span className="text-[var(--neon-yellow)]">{data.level.rank}</span> • 
            Level {data.level.level} {data.personality.icon}
          </p>
        </motion.div>

        {/* Profile Card */}
        <div className="mb-8">
          <ProfileCard
            avatar={data.user.avatarUrl}
            username={data.user.login}
            name={data.user.name}
            bio={data.user.bio}
            followers={data.user.followers.totalCount}
            following={data.user.following.totalCount}
          />
        </div>

        {/* Stats Dashboard */}
        <div className="mb-8">
          <h2 className="font-orbitron text-2xl font-bold text-white mb-4 flex items-center gap-2">
            📊 <span className="text-[var(--neon-cyan)]">Stats Dashboard</span>
          </h2>
          <StatsDashboard stats={data.stats} />
        </div>

        {/* Dev Personality */}
        <div className="mb-8">
          <PersonalitySection personality={data.personality} level={data.level} />
        </div>

        {/* GitHub Wrapped */}
        <div className="mb-8">
          <GitHubWrapped stats={data.stats} />
        </div>

        {/* Contribution Heatmap */}
        <div className="mb-8">
          <ContributionHeatmap contributionHistory={data.stats.contributionHistory} />
        </div>

        {/* Two column layout for charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Language Distribution */}
          <LanguageChart languages={data.stats.topLanguages} />
          
          {/* Activity Timeline */}
          <ActivityTimeline monthlyContributions={data.stats.monthlyContributions} />
        </div>

        {/* Coding Pattern */}
        <div className="mb-8">
          <CodingPatternViz 
            commitDistribution={data.stats.commitDistribution}
            peakHour={data.stats.peakHour}
            peakDay={data.stats.peakDay}
            codingPattern={data.stats.codingPattern}
          />
        </div>

        {/* Top Repositories */}
        {data.user.topRepositories?.nodes?.length > 0 && (
          <div className="mb-8">
            <TopReposSection topRepos={data.user.topRepositories.nodes} />
          </div>
        )}

        {/* Deep Insights */}
        <div className="mb-8">
          <DeepInsights stats={data.stats} />
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <AchievementsSection achievements={data.achievements} />
        </div>

        {/* Roast Card */}
        {roast && (
          <div className="mb-8">
            <RoastCard roast={roast} onNewRoast={handleNewRoast} />
          </div>
        )}

        {/* README Generator */}
        <div className="mb-8">
          <ReadmeGenerator
            username={username}
            stats={data.stats}
            personality={data.personality}
          />
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-8 border-t border-[rgba(255,255,255,0.1)]"
        >
          <p className="font-mono text-sm text-gray-500">
            Made with 💖 using Next.js & GitHub GraphQL API
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

function generateAchievements(stats: any) {
  const achievements = [
    {
      id: 'first_commit',
      name: 'Hello World',
      description: 'Made your first commit',
      icon: '👶',
      rarity: 'common' as const,
      unlocked: stats.totalCommits > 0,
    },
    {
      id: 'century',
      name: 'Century Club',
      description: '100 commits',
      icon: '💯',
      rarity: 'common' as const,
      unlocked: stats.totalCommits >= 100,
      progress: Math.min(stats.totalCommits, 100),
      maxProgress: 100,
    },
    {
      id: 'thousand',
      name: 'Thousand Commits',
      description: '1,000 commits',
      icon: '🏆',
      rarity: 'rare' as const,
      unlocked: stats.totalCommits >= 1000,
      progress: Math.min(stats.totalCommits, 1000),
      maxProgress: 1000,
    },
    {
      id: 'tenk',
      name: 'Legendary',
      description: '10,000 commits',
      icon: '👑',
      rarity: 'legendary' as const,
      unlocked: stats.totalCommits >= 10000,
      progress: Math.min(stats.totalCommits, 10000),
      maxProgress: 10000,
    },
    {
      id: 'star_collector',
      name: 'Star Collector',
      description: '100 stars earned',
      icon: '⭐',
      rarity: 'rare' as const,
      unlocked: stats.totalStars >= 100,
      progress: Math.min(stats.totalStars, 100),
      maxProgress: 100,
    },
    {
      id: 'popular',
      name: 'Popular Kid',
      description: '1,000 stars earned',
      icon: '🌟',
      rarity: 'epic' as const,
      unlocked: stats.totalStars >= 1000,
      progress: Math.min(stats.totalStars, 1000),
      maxProgress: 1000,
    },
    {
      id: 'polyglot',
      name: 'Polyglot',
      description: '5+ programming languages',
      icon: '🌍',
      rarity: 'rare' as const,
      unlocked: stats.topLanguages.length >= 5,
      progress: Math.min(stats.topLanguages.length, 5),
      maxProgress: 5,
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Code between 10PM-4AM',
      icon: '🦉',
      rarity: 'common' as const,
      unlocked: stats.peakHour >= 22 || stats.peakHour <= 4,
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: '30+ day streak',
      icon: '🔥',
      rarity: 'rare' as const,
      unlocked: stats.streak >= 30,
      progress: Math.min(stats.streak, 30),
      maxProgress: 30,
    },
    {
      id: 'year_streak',
      name: 'Unstoppable',
      description: '100+ day streak',
      icon: '⚡',
      rarity: 'legendary' as const,
      unlocked: stats.streak >= 100,
      progress: Math.min(stats.streak, 100),
      maxProgress: 100,
    },
    {
      id: 'pr_opener',
      name: 'PR Opener',
      description: '50 pull requests',
      icon: '🔀',
      rarity: 'rare' as const,
      unlocked: stats.totalPRs >= 50,
      progress: Math.min(stats.totalPRs, 50),
      maxProgress: 50,
    },
    {
      id: 'multi_lang',
      name: 'Language Collector',
      description: '10+ languages',
      icon: '📚',
      rarity: 'epic' as const,
      unlocked: stats.topLanguages.length >= 10,
      progress: Math.min(stats.topLanguages.length, 10),
      maxProgress: 10,
    },
  ];

  return achievements;
}

function generateRoasts(stats: any) {
  return [
    {
      id: 'starter',
      text: `You have ${stats.totalRepos} repos but only ${stats.totalStars} stars. You start projects faster than you finish them 💀`,
      category: 'roast' as const,
    },
    {
      id: 'abandoner',
      text: `You've abandoned ${stats.projectsAbandoned} projects. At this point, your GitHub is basically a digital graveyard 🪦`,
      category: 'roast' as const,
    },
    {
      id: 'nightowl',
      text: `Your peak coding time is ${stats.mostProductiveHour}. Your sleep schedule says you're either a vampire or in a different timezone 🧛`,
      category: 'roast' as const,
    },
    {
      id: 'fork',
      text: `Most of your repos are forks. You're basically a collector of other people's code 🍴`,
      category: 'roast' as const,
    },
    {
      id: 'silence',
      text: `${stats.totalPRs} PRs and ${stats.totalIssueComments} comments? You're basically a ghost in the community 👻`,
      category: 'roast' as const,
    },
    {
      id: 'starved',
      text: `Your repos have ${stats.totalStars} stars combined. That's less than a single viral tweet gets likes 😬`,
      category: 'roast' as const,
    },
    {
      id: 'legend',
      text: `${stats.totalCommits} commits! You're either incredibly dedicated or your job is on the line 💪`,
      category: 'roast' as const,
    },
    {
      id: 'star',
      text: `🎉 ${stats.totalStars} stars! People actually use your code! You're someone's favorite developer!`,
      category: 'compliment' as const,
    },
    {
      id: 'grinder',
      text: `A ${stats.streak}-day streak! Your commitment is stronger than most marriages 💍`,
      category: 'compliment' as const,
    },
    {
      id: 'poly',
      text: `You know ${stats.topLanguages.length} languages! You're the Swiss Army knife of developers 🔪`,
      category: 'compliment' as const,
    },
    {
      id: 'funny_streak',
      text: `Your longest streak is ${stats.longestStreak} days. That's longer than most diets last 🥗`,
      category: 'funny' as const,
    },
  ];
}
