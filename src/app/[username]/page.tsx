'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { SkillRadar } from '@/components/SkillRadar';
import { CompareSection } from '@/components/CompareSection';
import { TimelineSection } from '@/components/TimelineSection';
import { LoadingAnimation } from '@/components/LoadingComponents';
import { ParticleBackground } from '@/components/ParticleBackground';
import { HeroBanner } from '@/components/HeroBanner';
import { BadgeGenerator } from '@/components/BadgeGenerator';
import { MobileView } from '@/components/MobileView';
import { StatsChart } from '@/components/StatsChart';
import { QuickActions } from '@/components/QuickActions';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';

interface UserData {
  user: {
    login: string;
    avatarUrl: string;
    name: string;
    bio: string;
    company: string;
    location: string;
    websiteUrl: string;
    createdAt: string;
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
          if (userRes.status === 404) throw new Error('User not found');
          throw new Error('Failed to fetch user data');
        }

        const userData = await userRes.json();
        const personalityData = await personalityRes.json();

        const xp = userData.stats.totalCommits + (userData.stats.totalStars * 10) + (userData.stats.totalRepos * 5) + (userData.stats.totalPRs * 3);
        const level = Math.floor(xp / 100) + 1;
        const ranks = ['Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master', 'Grandmaster', 'Legend', 'Mythic', 'Transcendent', 'Divine'];
        const rankIndex = Math.min(Math.floor((level - 1) / 10), ranks.length - 1);
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
          level: { level, title: titles[titleIndex], rank: ranks[rankIndex], xp, xpToNext, progress },
          achievements,
        });
        setRoast(randomRoast);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (username) fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ParticleBackground variant="cyber" />
        <LoadingAnimation />
        <KeyboardShortcuts />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <ParticleBackground variant="stars" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center max-w-md">
          <GlassPanel glowColor="magenta" className="p-8">
            <div className="text-8xl mb-4">😵</div>
            <h2 className="font-orbitron text-3xl font-bold text-[var(--neon-magenta)] mb-2">Oops!</h2>
            <p className="font-mono text-gray-400 mb-6">{error}</p>
            <Link href="/" className="inline-block chrome-button px-8 py-4 font-orbitron text-sm uppercase tracking-wider text-[var(--neon-cyan)]">
              ← Try Again
            </Link>
          </GlassPanel>
        </motion.div>
        <KeyboardShortcuts />
      </div>
    );
  }

  if (!data) return null;

  const handleNewRoast = () => {
    const roasts = generateRoasts(data.stats);
    setRoast(roasts[Math.floor(Math.random() * roasts.length)]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      <ParticleBackground variant="cyber" />
      <div className="absolute inset-0 opacity-5 z-0" style={{ backgroundImage: `linear-gradient(var(--neon-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      
      <ResultsNav username={username} />
      <QuickActions username={username} />
      <KeyboardShortcuts />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24">
        {/* Hero Banner */}
        <HeroBanner 
          username={username} 
          avatar={data.user.avatarUrl}
          stats={data.stats}
          personality={data.personality}
          level={data.level}
        />

        {/* Stats Chart */}
        <div className="mb-8">
          <StatsChart stats={data.stats} />
        </div>

        {/* Stats Dashboard */}
        <div className="mb-8">
          <h2 className="font-orbitron text-2xl font-bold text-white mb-4 flex items-center gap-2">
            📊 <span className="text-[var(--neon-cyan)]">Stats Dashboard</span>
          </h2>
          <StatsDashboard stats={data.stats} />
        </div>

        {/* Skill Radar */}
        <div className="mb-8">
          <SkillRadar stats={data.stats} />
        </div>

        {/* Dev Personality */}
        <div className="mb-8">
          <PersonalitySection personality={data.personality} level={data.level} />
        </div>

        {/* GitHub Wrapped */}
        <div className="mb-8">
          <GitHubWrapped stats={data.stats} />
        </div>

        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <ContributionHeatmap contributionHistory={data.stats.contributionHistory} />
          <CodingPatternViz commitDistribution={data.stats.commitDistribution} peakHour={data.stats.peakHour} peakDay={data.stats.peakDay} codingPattern={data.stats.codingPattern} />
        </div>

        {/* Language & Activity */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <LanguageChart languages={data.stats.topLanguages} />
          <ActivityTimeline monthlyContributions={data.stats.monthlyContributions} />
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <TimelineSection repoCreated={data.user.createdAt} />
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

        {/* Compare Section */}
        <div className="mb-8">
          <CompareSection currentStats={data.stats} currentUsername={username} />
        </div>

        {/* Roast Card */}
        {roast && (
          <div className="mb-8">
            <RoastCard roast={roast} onNewRoast={handleNewRoast} />
          </div>
        )}

        {/* Badge Generator */}
        <div className="mb-8">
          <BadgeGenerator username={username} stats={data.stats} personality={data.personality} level={data.level} />
        </div>

        {/* README Generator */}
        <div className="mb-8">
          <ReadmeGenerator username={username} stats={data.stats} personality={data.personality} />
        </div>

        {/* Mobile View */}
        <div className="mb-8">
          <MobileView username={username} avatar={data.user.avatarUrl} stats={data.stats} personality={data.personality} />
        </div>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center py-8 border-t border-[rgba(255,255,255,0.1)]">
          <p className="font-mono text-sm text-gray-500">Made with 💖 using Next.js & GitHub GraphQL API</p>
        </motion.footer>
      </div>
    </div>
  );
}

function generateAchievements(stats: UserData['stats']) {
  return [
    { id: 'first_commit', name: 'Hello World', description: 'First commit', icon: '👶', rarity: 'common' as const, unlocked: stats.totalCommits > 0 },
    { id: 'century', name: 'Century Club', description: '100 commits', icon: '💯', rarity: 'common' as const, unlocked: stats.totalCommits >= 100, progress: Math.min(stats.totalCommits, 100), maxProgress: 100 },
    { id: 'thousand', name: 'Thousand Commits', description: '1,000 commits', icon: '🏆', rarity: 'rare' as const, unlocked: stats.totalCommits >= 1000, progress: Math.min(stats.totalCommits, 1000), maxProgress: 1000 },
    { id: 'tenk', name: 'Legendary', description: '10,000 commits', icon: '👑', rarity: 'legendary' as const, unlocked: stats.totalCommits >= 10000, progress: Math.min(stats.totalCommits, 10000), maxProgress: 10000 },
    { id: 'star_collector', name: 'Star Collector', description: '100 stars', icon: '⭐', rarity: 'rare' as const, unlocked: stats.totalStars >= 100, progress: Math.min(stats.totalStars, 100), maxProgress: 100 },
    { id: 'popular', name: 'Popular Kid', description: '1,000 stars', icon: '🌟', rarity: 'epic' as const, unlocked: stats.totalStars >= 1000, progress: Math.min(stats.totalStars, 1000), maxProgress: 1000 },
    { id: 'polyglot', name: 'Polyglot', description: '5+ languages', icon: '🌍', rarity: 'rare' as const, unlocked: stats.topLanguages.length >= 5, progress: Math.min(stats.topLanguages.length, 5), maxProgress: 5 },
    { id: 'night_owl', name: 'Night Owl', description: 'Code 10PM-4AM', icon: '🦉', rarity: 'common' as const, unlocked: stats.peakHour >= 22 || stats.peakHour <= 4 },
    { id: 'streak_master', name: 'Streak Master', description: '30+ day streak', icon: '🔥', rarity: 'rare' as const, unlocked: stats.streak >= 30, progress: Math.min(stats.streak, 30), maxProgress: 30 },
    { id: 'pr_opener', name: 'PR Opener', description: '50 PRs', icon: '🔀', rarity: 'rare' as const, unlocked: stats.totalPRs >= 50, progress: Math.min(stats.totalPRs, 50), maxProgress: 50 },
  ];
}

function generateRoasts(stats: UserData['stats']) {
  return [
    { id: 'starter', text: `You have ${stats.totalRepos} repos but only ${stats.totalStars} stars. You start projects faster than you finish them 💀`, category: 'roast' as const },
    { id: 'abandoner', text: `You've abandoned ${stats.projectsAbandoned} projects. Your GitHub is a digital graveyard 🪦`, category: 'roast' as const },
    { id: 'nightowl', text: `Your peak is ${stats.mostProductiveHour}. You're either a vampire or in another timezone 🧛`, category: 'roast' as const },
    { id: 'legend', text: `${stats.totalCommits} commits! Either incredibly dedicated or your job is on the line 💪`, category: 'roast' as const },
    { id: 'star', text: `🎉 ${stats.totalStars} stars! People actually use your code! You're someone's favorite dev!`, category: 'compliment' as const },
    { id: 'grinder', text: `A ${stats.streak}-day streak! Your commitment is stronger than most marriages 💍`, category: 'compliment' as const },
  ];
}
