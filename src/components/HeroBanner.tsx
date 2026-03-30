'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface HeroBannerProps {
  username: string;
  avatar: string;
  stats: {
    totalCommits: number;
    totalStars: number;
    totalRepos: number;
    streak: number;
  };
  personality: {
    type: string;
    icon: string;
    color: string;
  };
  level: {
    level: number;
    rank: string;
  };
}

export function HeroBanner({ username, avatar, stats, personality, level }: HeroBannerProps) {
  const particles = useMemo(() => {
    const hash = (value: string) => {
      let h = 0;
      for (let i = 0; i < value.length; i++) {
        h = (h << 5) - h + value.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h);
    };

    return Array.from({ length: 20 }, (_, i) => {
      const base = `${username}-${personality.type}-${i}`;
      const h = hash(base);
      const left = (hash(`${base}-l`) % 10000) / 100;
      const top = (hash(`${base}-t`) % 10000) / 100;
      const duration = 3 + (hash(`${base}-d`) % 2000) / 1000;
      const delay = (h % 2000) / 1000;

      return { left, top, duration, delay };
    });
  }, [personality.type, username]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8 overflow-hidden rounded-2xl"
    >
      {/* Animated background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${personality.color}20 0%, var(--bg-dark) 50%, ${personality.color}10 100%)`,
        }}
      >
        {/* Animated grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(${personality.color} 1px, transparent 1px),
              linear-gradient(90deg, ${personality.color} 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
        
        {/* Floating particles */}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: personality.color,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar with glow */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1 }}
            className="relative"
          >
            <div 
              className="w-28 h-28 rounded-2xl p-1"
              style={{
                background: `linear-gradient(135deg, ${personality.color}, ${personality.color}80)`,
                boxShadow: `0 0 40px ${personality.color}50`,
              }}
            >
              <img
                src={avatar}
                alt={username}
                className="w-full h-full rounded-xl object-cover"
              />
            </div>
            {/* Level badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-3 -right-3 px-3 py-1 rounded-full text-xs font-orbitron font-bold"
              style={{
                background: personality.color,
                color: '#000',
                boxShadow: `0 0 15px ${personality.color}`,
              }}
            >
              LVL {level.level}
            </motion.div>
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className="font-orbitron text-4xl font-black text-white">
                  @{username}
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-mono"
                  style={{ 
                    backgroundColor: `${personality.color}30`,
                    border: `1px solid ${personality.color}`,
                    color: personality.color 
                  }}
                >
                  {personality.icon} {personality.type}
                </span>
              </div>
              
              <p className="font-mono text-gray-400 mb-4">
                {level.rank} • Level {level.level} Developer
              </p>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center md:justify-start gap-6"
            >
              {[
                { label: 'Commits', value: stats.totalCommits, icon: '🎯', color: personality.color },
                { label: 'Stars', value: stats.totalStars, icon: '⭐', color: '#ffff00' },
                { label: 'Repos', value: stats.totalRepos, icon: '📚', color: '#ff00ff' },
                { label: 'Streak', value: stats.streak, icon: '🔥', color: '#ff6b6b' },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div className="font-orbitron text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="font-mono text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(30px, 30px); }
        }
      `}</style>
    </motion.div>
  );
}
