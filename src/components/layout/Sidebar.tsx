'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MessageCircle, Edit, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Avatar from '@/components/common/Avatar';
import ChatListItem from '@/components/chat/ChatListItem';
import StoriesBar from '@/features/stories/StoriesBar';
import { stories } from '@/data/stories';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { chats, activeChatId, setActiveChatId, markAsRead, searchQuery, setSearchQuery, setShowAddContact, user, logout, setActiveTab } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if ((chat as any).name?.toLowerCase().includes(q)) return true;
    if (chat.lastMessage?.content.toLowerCase().includes(q)) return true;
    return false;
  });

  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const unpinnedChats = filteredChats.filter(c => !c.isPinned && !c.isArchived);

  const handleChatClick = (chatId: string) => {
    setActiveChatId(chatId);
    markAsRead(chatId);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <motion.button
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
                  initial={{ opacity: 0, scale: 0.9, y: 10, x: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 15, x: 5 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10, x: -10 }}
                  className="absolute top-full left-0 w-48 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden py-1.5 focus:outline-none z-50"
                >
                  <div className="px-4 py-2 border-b border-border/50 mb-1">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.name || user?.email}</p>
                    <p className="text-[10px] text-muted-foreground truncate">@{user?.username || 'user'}</p>
                  </div>
                  
                  <button
                    onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
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
          <div className="flex flex-col">
            <h1 className="font-bold text-base leading-tight gradient-text">NexusChat</h1>
            {user && <span className="text-[10px] font-medium text-muted-foreground">Logged in</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddContact(true)}
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
            title="New chat"
          >
            <Edit size={15} />
          </motion.button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-accent/60 border border-border text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Stories bar */}
      {!searchQuery && (
        <div className="border-b border-border">
          <StoriesBar stories={stories} />
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned */}
        {pinnedChats.length > 0 && (
          <>
            <div className="px-4 py-2 flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pinned</span>
            </div>
            {pinnedChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onClick={() => handleChatClick(chat.id)}
              />
            ))}
            <div className="h-px bg-border mx-4 my-1" />
          </>
        )}

        {/* All chats */}
        {unpinnedChats.length > 0 && (
          <>
            {pinnedChats.length > 0 && (
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Chats</span>
              </div>
            )}
            {unpinnedChats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onClick={() => handleChatClick(chat.id)}
              />
            ))}
          </>
        )}

        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <Search size={32} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
}
