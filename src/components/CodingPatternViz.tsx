'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';

interface CodingPatternProps {
  commitDistribution: number[];
  peakHour: number;
  peakDay: string;
  codingPattern: 'morning' | 'afternoon' | 'evening' | 'night';
}

const timeLabels = ['Night\n10PM-5AM', 'Morning\n5AM-12PM', 'Afternoon\n12PM-5PM', 'Evening\n5PM-10PM'];
const patternColors = {
  morning: 'var(--neon-yellow)',
  afternoon: 'var(--neon-cyan)',
  evening: 'var(--neon-pink)',
  night: 'var(--neon-magenta)',
};

export function CodingPatternViz({ commitDistribution, peakHour, peakDay, codingPattern }: CodingPatternProps) {
  const maxDist = Math.max(...commitDistribution, 1);
  const patternLabel = {
    morning: '🌅 Morning Coder',
    afternoon: '☀️ Afternoon Hero',
    evening: '🌆 Evening Warrior',
    night: '🌙 Night Owl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <GlassPanel glowColor="cyan" className="p-6">
        <h3 className="font-orbitron text-xl font-bold text-white mb-6">⏰ Coding Pattern</h3>

        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div 
              className="inline-block px-6 py-3 rounded-xl font-orbitron text-xl font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${patternColors[codingPattern]}30, ${patternColors[codingPattern]}10)`,
                border: `2px solid ${patternColors[codingPattern]}`,
                color: patternColors[codingPattern],
                boxShadow: `0 0 30px ${patternColors[codingPattern]}40`,
              }}
            >
              {patternLabel[codingPattern]}
            </div>
          </motion.div>
        </div>

        {/* Time distribution */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {commitDistribution.map((count, index) => (
            <div key={index} className="text-center">
              <motion.div
                className="h-24 rounded-lg flex items-end justify-center mb-2"
                style={{
                  background: `linear-gradient(180deg, ${patternColors[index === 3 ? 'night' : Object.keys(patternColors)[index] as keyof typeof patternColors]}30, transparent)`,
                }}
              >
                <motion.div
                  className="w-full mx-2 rounded-t-lg"
                  style={{ 
                    height: `${(count / maxDist) * 100}%`,
                    background: patternColors[index === 3 ? 'night' : Object.keys(patternColors)[index] as keyof typeof patternColors],
                    boxShadow: `0 0 15px ${patternColors[index === 3 ? 'night' : Object.keys(patternColors)[index] as keyof typeof patternColors]}`,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(count / maxDist) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </motion.div>
              <span className="font-mono text-[10px] text-gray-400 whitespace-pre-line">
                {timeLabels[index]}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
          <div className="text-center p-3 rounded-lg bg-[rgba(0,0,0,0.3)]">
            <div className="font-orbitron text-lg font-bold text-[var(--neon-cyan)]">
              {peakHour}:00
            </div>
            <div className="font-mono text-xs text-gray-500">Peak Hour</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[rgba(0,0,0,0.3)]">
            <div className="font-orbitron text-lg font-bold text-[var(--neon-magenta)]">
              {peakDay}
            </div>
            <div className="font-mono text-xs text-gray-500">Most Productive Day</div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
