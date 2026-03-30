'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutsProps {
  enabled?: boolean;
}

export function KeyboardShortcuts({ enabled = true }: KeyboardShortcutsProps) {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [lastSearch, setLastSearch] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = window.localStorage.getItem('gitwrapped_search_history');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const navigateTo = useCallback((username: string) => {
    if (username) {
      router.push(`/${username}`);
    }
  }, [router]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // ? - Show help
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      setShowHelp(prev => !prev);
      return;
    }

    // / - Focus search (go to home)
    if (e.key === '/') {
      e.preventDefault();
      router.push('/');
      return;
    }

    // r - Refresh
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      window.location.reload();
      return;
    }

    // h - Home
    if (e.key === 'h') {
      e.preventDefault();
      router.push('/');
      return;
    }

    // 1-9 - Quick stats sections (future use)
    if (e.key >= '1' && e.key <= '9') {
      // Could scroll to sections
    }
  }, [router]);

  // Save search to history
  useEffect(() => {
    const handleSearch = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail = typeof event.detail === 'string' ? event.detail : null;
      if (!detail) return;

      setLastSearch(prev => {
        const newHistory = [detail, ...prev.filter(s => s !== detail)].slice(0, 5);
        localStorage.setItem('gitwrapped_search_history', JSON.stringify(newHistory));
        return newHistory;
      });
    };

    window.addEventListener('gitwrapped_search', handleSearch as EventListener);
    return () => window.removeEventListener('gitwrapped_search', handleSearch as EventListener);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="glass-panel p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-orbitron text-xl font-bold text-white">⌨️ Keyboard Shortcuts</h3>
          <button
            onClick={() => setShowHelp(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {[
            { key: '/', description: 'Go to search (home)' },
            { key: 'h', description: 'Go to home page' },
            { key: 'r', description: 'Refresh current page' },
            { key: '?', description: 'Show/hide shortcuts' },
          ].map((shortcut) => (
            <div key={shortcut.key} className="flex justify-between items-center">
              <kbd className="px-2 py-1 bg-gray-800 rounded font-mono text-sm">
                {shortcut.key}
              </kbd>
              <span className="font-mono text-sm text-gray-400">{shortcut.description}</span>
            </div>
          ))}
        </div>

        {/* Search History */}
        {lastSearch.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="font-mono text-sm text-gray-400 mb-2">Recent Searches:</h4>
            <div className="space-y-1">
              {lastSearch.map((search, i) => (
                <button
                  key={i}
                  onClick={() => navigateTo(search)}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-800 rounded font-mono text-sm text-[var(--neon-cyan)]"
                >
                  @{search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
