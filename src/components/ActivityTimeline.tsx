'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';

interface MonthlyContribution {
  month: string;
  count: number;
}

interface ActivityTimelineProps {
  monthlyContributions: MonthlyContribution[];
}

export function ActivityTimeline({ monthlyContributions }: ActivityTimelineProps) {
  const maxCount = Math.max(...monthlyContributions.map(m => m.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <GlassPanel glowColor="blue" className="p-6">
        <h3 className="font-orbitron text-xl font-bold text-white mb-6">📈 Monthly Activity</h3>

        <div className="flex items-end justify-between gap-2 h-32">
          {monthlyContributions.map((month, index) => {
            const height = (month.count / maxCount) * 100;
            const isPeak = month.count === maxCount;
            
            return (
              <motion.div
                key={month.month}
                className="flex-1 flex flex-col items-center gap-2"
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className="flex-1 w-full flex items-end">
                  <motion.div
                    className="w-full rounded-t-lg relative overflow-hidden"
                    style={{
                      height: `${height}%`,
                      background: isPeak 
                        ? 'linear-gradient(180deg, var(--neon-cyan), var(--neon-magenta))'
                        : 'linear-gradient(180deg, var(--neon-cyan) 0%, rgba(0,255,255,0.3) 100%)',
                      boxShadow: isPeak ? '0 0 20px var(--neon-cyan)' : 'none',
                    }}
                    whileHover={{ scale: 1.05 }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {isPeak && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[var(--neon-cyan)] text-xs font-mono">
                        🔥
                      </div>
                    )}
                  </motion.div>
                </div>
                <span className={`font-mono text-[10px] ${isPeak ? 'text-[var(--neon-cyan)] font-bold' : 'text-gray-500'}`}>
                  {month.month}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[rgba(255,255,255,0.1)]">
          <div className="text-center">
            <div className="font-orbitron text-lg font-bold text-[var(--neon-cyan)]">
              {monthlyContributions.reduce((sum, m) => sum + m.count, 0).toLocaleString()}
            </div>
            <div className="font-mono text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="font-orbitron text-lg font-bold text-[var(--neon-magenta)]">
              {Math.round(monthlyContributions.reduce((sum, m) => sum + m.count, 0) / monthlyContributions.length).toLocaleString()}
            </div>
            <div className="font-mono text-xs text-gray-500">Avg/Month</div>
          </div>
          <div className="text-center">
            <div className="font-orbitron text-lg font-bold text-[var(--neon-yellow)]">
              {Math.max(...monthlyContributions.map(m => m.count)).toLocaleString()}
            </div>
            <div className="font-mono text-xs text-gray-500">Peak Month</div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
