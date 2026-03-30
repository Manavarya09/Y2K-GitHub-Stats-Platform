'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';
import { ChromeButton } from './ChromeButton';

interface CompareProps {
  currentStats: {
    totalCommits: number;
    totalStars: number;
    totalRepos: number;
    totalPRs: number;
    totalIssues: number;
    streak: number;
  };
  currentUsername: string;
}

export function CompareSection({ currentStats, currentUsername }: CompareProps) {
  const [compareUsername, setCompareUsername] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<{ user?: { login: string }; stats?: CompareProps['currentStats'] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!compareUsername.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/user?username=${compareUsername.trim()}`);
      if (!res.ok) throw new Error('User not found');
      const data = await res.json();
      setComparisonData(data);
      setIsComparing(true);
    } catch {
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { name: 'Commits', current: currentStats.totalCommits, other: comparisonData?.stats?.totalCommits || 0 },
    { name: 'Stars', current: currentStats.totalStars, other: comparisonData?.stats?.totalStars || 0 },
    { name: 'Repos', current: currentStats.totalRepos, other: comparisonData?.stats?.totalRepos || 0 },
    { name: 'PRs', current: currentStats.totalPRs, other: comparisonData?.stats?.totalPRs || 0 },
    { name: 'Issues', current: currentStats.totalIssues, other: comparisonData?.stats?.totalIssues || 0 },
    { name: 'Streak', current: currentStats.streak, other: comparisonData?.stats?.streak || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassPanel glowColor="pink" className="p-6">
        <h3 className="font-orbitron text-xl font-bold text-white mb-6">
          ⚔️ Compare with Friend
        </h3>

        {!isComparing ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={compareUsername}
                onChange={(e) => setCompareUsername(e.target.value)}
                placeholder="Enter GitHub username..."
                className="flex-1 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-lg py-3 px-4 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[var(--neon-pink)]"
              />
              <ChromeButton onClick={handleCompare} glowColor="pink" disabled={loading}>
                {loading ? 'Loading...' : 'Compare'}
              </ChromeButton>
            </div>
            {error && <p className="text-red-400 font-mono text-sm">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <ChromeButton 
                onClick={() => { setIsComparing(false); setComparisonData(null); setCompareUsername(''); }} 
                glowColor="cyan"
                className="text-xs py-2"
              >
                ← Back
              </ChromeButton>
            </div>

            {/* Comparison header */}
            <div className="grid grid-cols-3 text-center mb-4">
              <div>
                <div className="font-orbitron text-lg text-[var(--neon-cyan)]">{currentUsername}</div>
              </div>
              <div className="font-orbitron text-gray-500">VS</div>
              <div>
                <div className="font-orbitron text-lg text-[var(--neon-magenta)]">
                  {comparisonData?.user?.login}
                </div>
              </div>
            </div>

            {/* Comparison bars */}
            <div className="space-y-3">
              {metrics.map((metric) => {
                const total = metric.current + metric.other || 1;
                const currentPercent = (metric.current / total) * 100;
                const otherPercent = (metric.other / total) * 100;
                const isCurrentWinner = metric.current > metric.other;

                return (
                  <div key={metric.name}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[var(--neon-cyan)]">{metric.current.toLocaleString()}</span>
                      <span className="text-gray-500">{metric.name}</span>
                      <span className="text-[var(--neon-magenta)]">{metric.other.toLocaleString()}</span>
                    </div>
                    <div className="h-6 bg-gray-800 rounded-full overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentPercent}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full flex items-center justify-end pr-2 ${isCurrentWinner ? 'bg-[var(--neon-cyan)]' : 'bg-gray-600'}`}
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${otherPercent}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full flex items-center pl-2 ${!isCurrentWinner ? 'bg-[var(--neon-magenta)]' : 'bg-gray-600'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Winner announcement */}
            <div className="text-center mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
              {(() => {
                const currentScore = metrics.filter(m => m.current > m.other).length;
                const otherScore = metrics.filter(m => m.other > m.current).length;
                
                if (currentScore > otherScore) {
                  return (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[var(--neon-cyan)] font-orbitron text-xl"
                    >
                      🏆 {currentUsername} Wins!
                    </motion.div>
                  );
                } else if (otherScore > currentScore) {
                  return (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[var(--neon-magenta)] font-orbitron text-xl"
                    >
                      🏆 {comparisonData?.user?.login} Wins!
                    </motion.div>
                  );
                }
                return (
                  <div className="text-gray-400 font-orbitron text-xl">
                    ⚖️ It&apos;s a Tie!
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </GlassPanel>
    </motion.div>
  );
}
