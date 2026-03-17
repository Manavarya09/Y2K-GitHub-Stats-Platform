'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';
import React from 'react';

interface LanguageStat {
  name: string;
  color: string;
  count: number;
  bytes: number;
}

interface LanguageChartProps {
  languages: LanguageStat[];
  title?: string;
}

export function LanguageChart({ languages, title = 'Language Distribution' }: LanguageChartProps) {
  const total = languages.reduce((sum, l) => sum + l.count, 0);
  
  if (languages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <GlassPanel glowColor="pink" className="p-6">
        <h3 className="font-orbitron text-xl font-bold text-white mb-6">{title}</h3>

        {/* Bar chart */}
        <div className="space-y-3">
          {languages.slice(0, 8).map((lang, index) => {
            const percentage = (lang.count / total) * 100;
            
            return (
              <motion.div
                key={lang.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="font-mono text-sm text-gray-300">{lang.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">{lang.count} repos</span>
                    <span className="font-orbitron text-sm font-bold" style={{ color: lang.color }}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: lang.color,
                      boxShadow: `0 0 10px ${lang.color}`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Circular visualization */}
        <div className="mt-8 flex justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {languages.slice(0, 8).reduce((acc, lang, index) => {
                const percentage = (lang.count / total) * 100;
                const prevPercentage = acc.offset;
                const dashArray = (percentage / 100) * 251.2;
                const dashOffset = 251.2 - (prevPercentage / 100) * 251.2;
                
                acc.elements.push(
                  <circle
                    key={lang.name}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={lang.color}
                    strokeWidth="12"
                    strokeDasharray={`${dashArray} 251.2`}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-500"
                    style={{ filter: `drop-shadow(0 0 5px ${lang.color})` }}
                  />
                );
                acc.offset += percentage;
                return acc;
              }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-orbitron text-2xl font-bold text-white">
                  {languages.length}
                </div>
                <div className="font-mono text-xs text-gray-400">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
