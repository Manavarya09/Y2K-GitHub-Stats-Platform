'use client';

import { motion } from 'framer-motion';

interface StreakCalendarProps {
  contributionHistory: Array<{
    date: string;
    contributionCount: number;
  }>;
  currentStreak: number;
  longestStreak: number;
}

export function StreakCalendar({ contributionHistory, currentStreak, longestStreak }: StreakCalendarProps) {
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const getContribution = (date: string) => {
    const day = contributionHistory.find(d => d.date === date);
    return day?.contributionCount || 0;
  };

  const getColor = (count: number) => {
    if (count === 0) return '#161b22';
    if (count <= 2) return '#0e4429';
    if (count <= 5) return '#006d32';
    if (count <= 10) return '#26a641';
    return '#39d353';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-orbitron text-lg font-bold text-white">🔥 Streak Calendar</h3>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="font-orbitron text-xl text-[var(--neon-cyan)]">{currentStreak}</div>
            <div className="font-mono text-xs text-gray-500">Current</div>
          </div>
          <div className="text-center">
            <div className="font-orbitron text-xl text-[var(--neon-magenta)]">{longestStreak}</div>
            <div className="font-mono text-xs text-gray-500">Longest</div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {last30Days.map((date, i) => {
          const count = getContribution(date);
          const isToday = date === today.toISOString().split('T')[0];
          
          return (
            <motion.div
              key={date}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className="relative group"
            >
              <div
                className={`w-6 h-6 rounded-sm ${isToday ? 'ring-2 ring-white' : ''}`}
                style={{ backgroundColor: getColor(count) }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black rounded text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {date}: {count} contributions
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-end gap-1 mt-2 text-xs text-gray-500">
        <span>Less</span>
        {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map((color, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span>More</span>
      </div>
    </motion.div>
  );
}
