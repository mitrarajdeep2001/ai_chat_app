'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { users } from '@/data/users';
import { User } from '@/types';
import { MessageCircle, Bot, Users } from 'lucide-react';

export default function ChatPanel() {
  const {
    activeChatId,
    setActiveChatId,
    chats,
    messages,
    sendMessage,
    markAsRead,
    smartReplies,
    refreshSmartReplies,
    isAiTyping,
  } = useApp();

  const activeChat = chats.find(c => c.id === activeChatId);
  const chatMessages = activeChatId ? (messages[activeChatId] || []) : [];

  const usersMap: Record<string, User> = Object.fromEntries(
    users.map(u => [u.id, u])
  );

  useEffect(() => {
    if (activeChatId) {
      markAsRead(activeChatId);
      refreshSmartReplies(activeChatId);
    }
  }, [activeChatId, markAsRead, refreshSmartReplies]);

  if (!activeChat) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-6 bg-accent/20 p-8 h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6 text-center max-w-xs"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl">
              <MessageCircle size={44} className="text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center border-4 border-background">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to NexusChat</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Select a conversation from the sidebar to start messaging, or tap the{' '}
              <span className="text-primary font-medium">compose</span> button to create a new one.
            </p>
          </div>
          <div className="flex gap-3">
            {[
              { icon: MessageCircle, label: 'Chat', color: 'from-blue-500 to-indigo-500' },
              { icon: Bot, label: 'AI', color: 'from-violet-500 to-purple-600' },
              { icon: Users, label: 'Groups', color: 'from-pink-500 to-rose-500' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSend = (content: string, type?: 'text' | 'audio' | 'image') => {
    sendMessage(activeChat.id, content, type);
    setTimeout(() => refreshSmartReplies(activeChat.id), 100);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeChatId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col flex-1 h-full overflow-hidden"
      >
        <ChatHeader
          chat={activeChat}
          onBack={() => setActiveChatId(null)}
        />
        <div
          className="flex-1 overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        >
          <MessageList
            messages={chatMessages}
            chat={activeChat}
            users={usersMap}
            isAiTyping={isAiTyping && activeChat.type === 'ai'}
          />
        </div>
        <MessageInput
          onSend={handleSend}
          smartReplies={smartReplies}
          placeholder={activeChat.type === 'ai' ? 'Ask Nexus AI anything...' : 'Type a message...'}
        />
      </motion.div>
    </AnimatePresence>
  );
}
