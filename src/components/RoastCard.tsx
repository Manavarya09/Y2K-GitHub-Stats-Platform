'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';
import { ChromeButton } from './ChromeButton';

interface RoastCardProps {
  roast: {
    id: string;
    text: string;
    category: 'roast' | 'compliment' | 'funny';
  };
  onNewRoast: () => void;
}

export function RoastCard({ roast, onNewRoast }: RoastCardProps) {
  const getCategoryColor = () => {
    switch (roast.category) {
      case 'roast': return 'var(--neon-magenta)';
      case 'compliment': return 'var(--neon-cyan)';
      case 'funny': return 'var(--neon-yellow)';
    }
  };

  const getCategoryIcon = () => {
    switch (roast.category) {
      case 'roast': return '🔥';
      case 'compliment': return '✨';
      case 'funny': return '😂';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <GlassPanel 
        glowColor={roast.category === 'roast' ? 'magenta' : roast.category === 'compliment' ? 'cyan' : 'yellow'} 
        className="p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-orbitron text-xl font-bold text-white">
            {getCategoryIcon()} Roast My GitHub
          </h3>
          <ChromeButton 
            onClick={() => {
              onNewRoast();
              setShowNewButton(false);
              setTimeout(() => setShowNewButton(true), 100);
            }} 
            glowColor="magenta"
            className="text-xs py-2 px-3"
          >
            🎲 New Roast
          </ChromeButton>
        </div>

        <motion.div
          key={roast.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative p-6 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${getCategoryColor()}15, ${getCategoryColor()}05)`,
            border: `1px solid ${getCategoryColor()}40`,
          }}
        >
          <p 
            className="font-mono text-lg text-center leading-relaxed"
            style={{ color: getCategoryColor() }}
          >
            {roast.text}
          </p>
          
          {/* Decorative quotes */}
          <span className="absolute top-2 left-4 text-4xl opacity-30" style={{ color: getCategoryColor() }}>&quot;</span>
          <span className="absolute bottom-2 right-4 text-4xl opacity-30 rotate-180" style={{ color: getCategoryColor() }}>&quot;</span>
        </motion.div>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              const text = encodeURIComponent(roast.text + ' #GitWrapped');
              window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(29,161,242,0.1)] hover:bg-[rgba(29,161,242,0.2)] transition-colors text-[#1DA1F2] font-mono text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share Roast
          </button>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
