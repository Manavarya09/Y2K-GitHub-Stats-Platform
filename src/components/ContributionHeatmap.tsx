'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';

interface ContributionHeatmapProps {
  contributionHistory: Array<{
    date: string;
    contributionCount: number;
    color: string;
  }>;
}

export function ContributionHeatmap({ contributionHistory }: ContributionHeatmapProps) {
  const weeks: Array<Array<{ date: string; count: number; color: string }>> = [];
  let currentWeek: Array<{ date: string; count: number; color: string }> = [];

  contributionHistory.forEach((day, index) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();
    
    if (index === 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', count: 0, color: 'transparent' });
      }
    }
    
    currentWeek.push({
      date: day.date,
      count: day.contributionCount,
      color: day.contributionCount > 0 ? getColor(day.contributionCount) : 'transparent',
    });
    
    if (dayOfWeek === 6 || index === contributionHistory.length - 1) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0, color: 'transparent' });
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const totalContributions = contributionHistory.reduce((sum, day) => sum + day.contributionCount, 0);
  const daysWithContributions = contributionHistory.filter(day => day.contributionCount > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <GlassPanel glowColor="green" className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-orbitron text-xl font-bold text-white">📅 Contribution Heatmap</h3>
          <div className="flex gap-4 text-sm">
            <span className="font-mono text-gray-400">
              {totalContributions.toLocaleString()} contributions
            </span>
            <span className="font-mono text-gray-400">
              {daysWithContributions} active days
            </span>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: weekIndex * 0.01 + dayIndex * 0.005 }}
                    className="w-3 h-3 rounded-sm transition-all hover:scale-150 cursor-pointer"
                    style={{
                      backgroundColor: day.color,
                      border: day.color === 'transparent' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}
                    title={day.date ? `${day.date}: ${day.count} contributions` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 font-mono">
          <span>Less</span>
          <div className="flex gap-1">
            {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map((color, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

function getColor(count: number): string {
  if (count === 0) return 'transparent';
  if (count === 1) return '#0e4429';
  if (count <= 3) return '#006d32';
  if (count <= 6) return '#26a641';
  return '#39d353';
}
