'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementsSectionProps {
  achievements: Achievement[];
}

const rarityColors = {
  common: '#888888',
  rare: '#00ffff',
  epic: '#ff00ff',
  legendary: '#ffff00',
};

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <GlassPanel glowColor="yellow" className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-orbitron text-xl font-bold text-white">🏆 Achievements</h3>
          <span className="font-mono text-sm text-gray-400">
            {unlockedCount} / {totalCount} unlocked
          </span>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all cursor-pointer
                  ${achievement.unlocked 
                    ? 'hover:scale-110' 
                    : 'opacity-30 grayscale'
                  }`}
                style={{
                  background: achievement.unlocked 
                    ? `linear-gradient(135deg, ${rarityColors[achievement.rarity]}30, ${rarityColors[achievement.rarity]}10)`
                    : 'rgba(0,0,0,0.3)',
                  border: `2px solid ${achievement.unlocked ? rarityColors[achievement.rarity] : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: achievement.unlocked ? `0 0 15px ${rarityColors[achievement.rarity]}40` : 'none',
                }}
              >
                <span className={achievement.unlocked ? '' : 'opacity-50'}>
                  {achievement.icon}
                </span>
              </div>

              {/* Progress bar for achievements with progress */}
              {achievement.progress !== undefined && achievement.maxProgress && !achievement.unlocked && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                      backgroundColor: rarityColors[achievement.rarity],
                    }}
                  />
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                <div className="font-mono text-xs font-bold" style={{ color: rarityColors[achievement.rarity] }}>
                  {achievement.name}
                </div>
                <div className="font-mono text-[10px] text-gray-400">{achievement.description}</div>
                {achievement.progress !== undefined && !achievement.unlocked && (
                  <div className="font-mono text-[10px] text-gray-500 mt-1">
                    {achievement.progress} / {achievement.maxProgress}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
