'use client';

import { motion } from 'framer-motion';

type GlowColor = 'cyan' | 'magenta' | 'yellow' | 'pink' | 'blue' | 'green';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
}

export function GlassPanel({ children, className = '', glowColor = 'cyan' }: GlassPanelProps) {
  const glowColors: Record<string, string> = {
    cyan: 'var(--neon-cyan)',
    magenta: 'var(--neon-magenta)',
    yellow: 'var(--neon-yellow)',
    pink: 'var(--neon-pink)',
    blue: 'var(--neon-blue)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-panel relative overflow-hidden ${className}`}
      style={{
        boxShadow: `0 0 20px ${glowColors[glowColor]}20, inset 0 0 30px ${glowColors[glowColor]}10`,
        borderColor: `${glowColors[glowColor]}30`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${glowColors[glowColor]}10 0%, transparent 50%, ${glowColors[glowColor]}05 100%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
