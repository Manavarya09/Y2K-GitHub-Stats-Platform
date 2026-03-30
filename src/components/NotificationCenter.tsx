'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  message: string;
  type: 'success' | 'info' | 'warning';
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (message: string, type: NotificationProps['type']) => {
    setNotifications(prev => [...prev, { message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.message !== message));
    }, 4000);
  };

  useEffect(() => {
    // Show welcome notification
    const timer = setTimeout(() => {
      addNotification('Welcome to GitWrapped! 🎮', 'success');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification, i) => (
          <motion.div
            key={i}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className={`px-4 py-3 rounded-lg font-mono text-sm ${
              notification.type === 'success' ? 'bg-green-900/80 border border-green-500' :
              notification.type === 'warning' ? 'bg-yellow-900/80 border border-yellow-500' :
              'bg-blue-900/80 border border-blue-500'
            }`}
          >
            {notification.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useNotification() {
  const addNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    // This would integrate with the NotificationCenter
    console.log(`[${type}] ${message}`);
  };

  return { addNotification };
}
