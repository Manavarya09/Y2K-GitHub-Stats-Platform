'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';

interface TopRepo {
  name: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
}

interface TopReposSectionProps {
  topRepos: TopRepo[];
}

export function TopReposSection({ topRepos }: TopReposSectionProps) {
  if (!topRepos || topRepos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <GlassPanel glowColor="cyan" className="p-6">
        <h3 className="font-orbitron text-xl font-bold text-white mb-6">⭐ Top Repositories</h3>

        <div className="space-y-3">
          {topRepos.map((repo, index) => (
            <motion.a
              key={repo.name}
              href={`https://github.com/${repo.name}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="block p-4 rounded-lg bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,255,255,0.1)] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[var(--neon-cyan)]">
                      #{index + 1}
                    </span>
                    <span className="font-orbitron font-bold text-white truncate group-hover:text-[var(--neon-cyan)] transition-colors">
                      {repo.name}
                    </span>
                  </div>
                  {repo.description && (
                    <p className="font-mono text-xs text-gray-400 mt-1 truncate">
                      {repo.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-[var(--neon-yellow)]">⭐</span>
                    <span className="font-mono text-gray-300">{repo.stargazerCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-400">🍴</span>
                    <span className="font-mono text-gray-400">{repo.forkCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {repo.primaryLanguage && (
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: repo.primaryLanguage.color }}
                  />
                  <span className="font-mono text-xs text-gray-400">
                    {repo.primaryLanguage.name}
                  </span>
                </div>
              )}
            </motion.a>
          ))}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
