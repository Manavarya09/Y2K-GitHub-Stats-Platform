'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './GlassPanel';
import { ChromeButton } from './ChromeButton';
import { ParticleBackground } from './ParticleBackground';

const FEATURED_USERS = [
  { username: 'torvalds', name: 'Linus Torvalds', avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4' },
  { username: 'yyx990803', name: 'Evan You', avatar: 'https://avatars.githubusercontent.com/u/6125507?v=4' },
  { username: 'gaearon', name: 'Dan Abramov', avatar: 'https://avatars.githubusercontent.com/u/810438?v=4' },
  { username: 'taylorotwell', name: 'Taylor Otwell', avatar: 'https://avatars.githubusercontent.com/u/463230?v=4' },
  { username: 'shadcn', name: 'shadcn', avatar: 'https://avatars.githubusercontent.com/u/12459953?v=4' },
];

export function LandingPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const showParticles = true;

  const loadingMessages = [
    'Initializing neural network...',
    'Scanning repositories...',
    'Analyzing commit patterns...',
    'Computing personality matrix...',
    'Generating insights...',
    'Calibrating results...',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    
    for (const text of loadingMessages) {
      setLoadingText(text);
      await new Promise(resolve => setTimeout(resolve, 350));
    }

    router.push(`/${username.trim()}`);
  };

  const handleFeaturedClick = (userUsername: string) => {
    router.push(`/${userUsername}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Particle Background */}
      {showParticles && <ParticleBackground variant="cyber" />}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-dark)] z-0" />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-5 z-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--neon-cyan) 1px, transparent 1px),
            linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <GlassPanel glowColor="cyan" className="p-12">
                {/* Animated logo */}
                <motion.div
                  animate={{ 
                    rotateY: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    rotateY: { duration: 2, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1, repeat: Infinity }
                  }}
                  className="w-24 h-24 mx-auto mb-8"
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center text-5xl" style={{
                    background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))',
                    boxShadow: '0 0 30px var(--neon-cyan)',
                  }}>
                    🎮
                  </div>
                </motion.div>

                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="font-orbitron text-2xl text-[var(--neon-cyan)] mb-6"
                >
                  {loadingText}
                </motion.div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.1, ease: 'easeInOut' }}
                    className="h-full gradient-animate"
                    style={{ background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-magenta), var(--neon-yellow))' }}
                  />
                </div>

                {/* Loading steps */}
                <div className="space-y-2">
                  {loadingMessages.map((text, i) => (
                    <motion.div
                      key={text}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ 
                        x: 0, 
                        opacity: loadingText === text ? 1 : 0.3 
                      }}
                      transition={{ delay: i * 0.35 }}
                      className="font-mono text-sm text-left"
                      style={{ 
                        color: loadingText === text ? 'var(--neon-cyan)' : 'var(--gray-500)' 
                      }}
                    >
                      <span className="text-[var(--neon-magenta)]">▸</span> {text}
                    </motion.div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Main Title */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-block mb-6"
                >
                  <div 
                    className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-6xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,255,255,0.2), rgba(255,0,255,0.2))',
                      border: '2px solid var(--neon-cyan)',
                      boxShadow: '0 0 30px var(--neon-cyan)',
                    }}
                  >
                    🎮
                  </div>
                </motion.div>

                <h1 className="font-orbitron text-5xl md:text-7xl font-black mb-4 glitch cursor-default">
                  <span className="neon-text text-[var(--neon-cyan)]">Git</span>
                  <span className="neon-text text-[var(--neon-magenta)]">Wrapped</span>
                  <span className="text-[var(--neon-yellow)] text-3xl ml-3">.exe</span>
                </h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="font-mono text-xl text-gray-400"
                >
                  Analyze your GitHub like it&apos;s 2003 ✨
                </motion.p>
              </motion.div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-3 mb-8 flex-wrap"
              >
                {[
                  { icon: '🤖', text: 'AI Powered' },
                  { icon: '🔒', text: 'No Login' },
                  { icon: '⚡', text: 'Instant' },
                  { icon: '🎨', text: '5 Themes' },
                  { icon: '🏆', text: 'Gamified' },
                ].map((badge, i) => (
                  <motion.span
                    key={badge.text}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1, type: 'spring' }}
                    className="px-4 py-2 text-sm font-mono rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[var(--neon-cyan)] transition-colors cursor-pointer"
                  >
                    {badge.icon} {badge.text}
                  </motion.span>
                ))}
              </motion.div>

              {/* Search form */}
              <motion.form
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSubmit}
                className="mb-12"
              >
                <GlassPanel glowColor="cyan" className="p-8">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--neon-cyan)] font-mono text-xl">
                        @
                      </span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="enter username..."
                        className="w-full bg-[rgba(0,0,0,0.5)] border-2 border-[rgba(0,255,255,0.2)] rounded-xl py-5 pl-12 pr-4 font-mono text-lg text-white placeholder-gray-600 focus:outline-none focus:border-[var(--neon-cyan)] input-glow transition-all"
                        autoFocus
                      />
                    </div>
                    <ChromeButton type="submit" glowColor="cyan" className="md:w-auto w-full text-lg py-5 px-8">
                      Analyze Profile
                    </ChromeButton>
                  </div>
                </GlassPanel>
              </motion.form>

              {/* Featured Users */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mb-8"
              >
                <p className="font-mono text-sm text-gray-500 text-center mb-4">
                  Try these profiles:
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {FEATURED_USERS.map((user, i) => (
                    <motion.button
                      key={user.username}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
                      onClick={() => handleFeaturedClick(user.username)}
                      className="flex items-center gap-3 px-4 py-2 rounded-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] hover:border-[var(--neon-cyan)] transition-all group"
                    >
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-mono text-sm text-gray-300 group-hover:text-[var(--neon-cyan)] transition-colors">
                        @{user.username}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <p className="font-mono text-xs text-gray-600">
                  Powered by GitHub GraphQL API • Built with Next.js & Framer Motion
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none crt-overlay z-50 opacity-20" />
    </div>
  );
}
