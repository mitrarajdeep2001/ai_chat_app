'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, MessageCircle, Edit } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import ChatListItem from '@/components/chat/ChatListItem';
import StoriesBar from '@/features/stories/StoriesBar';
import { stories } from '@/data/stories';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { chats, activeChatId, setActiveChatId, markAsRead, searchQuery, setSearchQuery, setShowAddContact } = useApp();

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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <MessageCircle size={16} className="text-white" />
          </div>
          <h1 className="font-bold text-lg gradient-text">NexusChat</h1>
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
