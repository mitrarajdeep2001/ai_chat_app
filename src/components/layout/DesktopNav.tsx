'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Phone, CirclePlay, Settings, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NavTab } from '@/types';
import { cn } from '@/lib/utils';
import Avatar from '@/components/common/Avatar';
import { currentUser } from '@/data/users';

const tabs: { id: NavTab; icon: React.ElementType; label: string }[] = [
  { id: 'chats', icon: MessageCircle, label: 'Chats' },
  { id: 'calls', icon: Phone, label: 'Calls' },
  { id: 'stories', icon: CirclePlay, label: 'Stories' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function DesktopNav() {
  const { activeTab, setActiveTab, chats } = useApp();
  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="hidden md:flex flex-col items-center w-16 bg-sidebar border-r border-sidebar-border py-4 gap-2 h-full">
      {/* Logo */}
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-3 shadow-lg">
        <MessageCircle size={20} className="text-white" />
      </div>

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          const badge = id === 'chats' && totalUnread > 0 ? totalUnread : null;

          return (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              title={label}
              className={cn(
                'relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon size={20} />
              {badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Avatar */}
      <div className="mt-auto">
        <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" showStatus status="online" />
      </div>
    </div>
  );
}
