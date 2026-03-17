'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from './GlassPanel';

interface DevCardProps {
  username: string;
  avatar: string;
  name?: string;
  bio?: string;
  company?: string;
  location?: string;
  websiteUrl?: string;
  twitterUsername?: string;
}

export function DevCard({ username, avatar, name, bio, company, location, websiteUrl, twitterUsername }: DevCardProps) {
  const socialLinks = [
    { icon: '🐙', label: 'GitHub', url: `https://github.com/${username}` },
    { icon: '🐦', label: 'Twitter', url: twitterUsername ? `https://twitter.com/${twitterUsername}` : null },
    { icon: '🌐', label: 'Website', url: websiteUrl },
    { icon: '📍', label: location, url: location ? `https://maps.google.com/?q=${encodeURIComponent(location)}` : null },
  ].filter(link => link.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassPanel glowColor="cyan" className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={avatar}
            alt={username}
            className="w-20 h-20 rounded-xl"
          />
          <div className="flex-1">
            <h3 className="font-orbitron text-xl font-bold text-white">{name || username}</h3>
            <p className="font-mono text-[var(--neon-cyan)]">@{username}</p>
            {company && (
              <p className="font-mono text-sm text-gray-400 mt-1">🏢 {company}</p>
            )}
          </div>
        </div>

        {bio && (
          <p className="font-mono text-sm text-gray-400 mt-4">{bio}</p>
        )}

        {/* Social Links */}
        <div className="flex flex-wrap gap-2 mt-4">
          {socialLinks.map((link, i) => (
            <motion.a
              key={i}
              href={link.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[var(--neon-cyan)] transition-colors text-sm font-mono"
            >
              {link.icon}
            </motion.a>
          ))}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
