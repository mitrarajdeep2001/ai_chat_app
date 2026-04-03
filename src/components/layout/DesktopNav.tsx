'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, CirclePlay, Settings, Plus, LogOut, User as UserIcon, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useState, useRef, useEffect } from 'react';
import { NavTab } from '@/types';
import { cn } from '@/lib/utils';
import Avatar from '@/components/common/Avatar';
import { currentUser } from '@/data/users';

const tabs: { id: NavTab; icon: React.ElementType; label: string }[] = [
  { id: 'chats', icon: MessageCircle, label: 'Chats' },
  { id: 'contacts', icon: Users, label: 'Contacts' },
  { id: 'calls', icon: Phone, label: 'Calls' },
  { id: 'stories', icon: CirclePlay, label: 'Stories' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function DesktopNav() {
  const { activeTab, setActiveTab, chats, user, logout, setIsEditingProfile } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {/* Avatar with Dropdown */}
      <div className="mt-auto relative" ref={menuRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="relative focus:outline-none"
        >
          <Avatar src={user?.avatar} name={user?.name || user?.email || 'User'} size="sm" showStatus status="online" />
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
              animate={{ opacity: 1, scale: 1, y: -20, x: 20 }}
              exit={{ opacity: 0, scale: 0.9, y: -10, x: 10 }}
              className="absolute bottom-full left-0 w-48 mb-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden py-1.5 focus:outline-none z-50"
            >
              <div className="px-4 py-2 border-b border-border/50 mb-1">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name || user?.email}</p>
                <p className="text-[10px] text-muted-foreground truncate">@{user?.username || 'user'}</p>
              </div>
              
              <button
                onClick={() => { setActiveTab('settings'); setIsEditingProfile(true); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <UserIcon size={16} />
                <span>Profile</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>

              <div className="h-px bg-border/50 my-1.5" />

              <button
                onClick={async () => { await logout(); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
