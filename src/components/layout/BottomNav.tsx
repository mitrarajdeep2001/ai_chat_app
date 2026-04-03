'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Phone, CirclePlay, Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NavTab } from '@/types';
import { cn } from '@/lib/utils';

const tabs: { id: NavTab; icon: React.ElementType; label: string }[] = [
  { id: 'chats', icon: MessageCircle, label: 'Chats' },
  { id: 'calls', icon: Phone, label: 'Calls' },
  { id: 'stories', icon: CirclePlay, label: 'Stories' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, chats } = useApp();

  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="flex items-center justify-around px-4 py-2 border-t border-border bg-background/95 backdrop-blur safe-area-bottom">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        const badge = id === 'chats' && totalUnread > 0 ? totalUnread : null;

        return (
          <motion.button
            key={id}
            onClick={() => setActiveTab(id)}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'flex flex-col items-center gap-1 flex-1 py-2 relative transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <div className="relative">
              <Icon size={22} className={cn('transition-all', isActive && 'fill-current')} />
              {badge && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
