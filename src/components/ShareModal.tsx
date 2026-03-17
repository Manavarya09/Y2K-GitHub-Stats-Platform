'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './GlassPanel';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  stats: {
    totalRepos: number;
    totalStars: number;
    totalCommits: number;
  };
}

export function ShareModal({ isOpen, onClose, username, stats }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      icon: '🐦',
      label: 'Twitter/X',
      color: '#1DA1F2',
      action: () => {
        const text = encodeURIComponent(
          `🎮 My GitWrapped Stats for @${username}\n\n📚 ${stats.totalRepos} repos\n⭐ ${stats.totalStars} stars\n🎯 ${stats.totalCommits} commits\n\nGenerate yours at gitwrapped.vercel.app`
        );
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
      }
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      color: '#0A66C2',
      action: () => {
        const text = encodeURIComponent(
          `Check out my GitHub stats! 🎮\n\n📚 ${stats.totalRepos} repositories\n⭐ ${stats.totalStars} stars\n🎯 ${stats.totalCommits} commits\n\nGenerated with GitWrapped.exe`
        );
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://gitwrapped.vercel.app')}`, '_blank');
      }
    },
    {
      icon: '📱',
      label: 'Copy Link',
      color: '#00ffff',
      action: async () => {
        await navigator.clipboard.writeText(`https://gitwrapped.vercel.app/${username}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 m-auto z-50 max-w-md h-fit p-6"
          >
            <GlassPanel glowColor="cyan" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-orbitron text-xl font-bold text-white">📤 Share Your Stats</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-3">
                {shareOptions.map((option) => (
                  <motion.button
                    key={option.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={option.action}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-mono" style={{ color: option.color }}>{option.label}</span>
                    {option.label === 'Copy Link' && copied && (
                      <span className="ml-auto text-green-400 text-sm">✓ Copied!</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
