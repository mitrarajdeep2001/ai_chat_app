'use client';

import { motion } from 'framer-motion';
import { Chat } from '@/types';
import { formatTime, truncate, formatLastSeen } from '@/utils/format';
import { cn } from '@/lib/utils';
import Avatar from '@/components/common/Avatar';
import { currentUser, users } from '@/data/users';
import { Pin, Bell, BellOff, Bot } from 'lucide-react';
import ReadReceipt from '@/components/common/ReadReceipt';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
  const otherUserId = chat.participants.find(p => p !== currentUser.id);
  const otherUser = users.find(u => u.id === otherUserId);
  const isGroup = chat.type === 'group';
  const isAI = chat.type === 'ai';

  const displayName = isGroup
    ? (chat as any).name
    : isAI
    ? 'Nexus AI'
    : otherUser?.name || 'Unknown';

  const displayAvatar = isGroup
    ? (chat as any).avatar
    : isAI
    ? 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus&backgroundColor=b6e3f4'
    : otherUser?.avatar;

  const status = isAI ? 'online' : isGroup ? undefined : otherUser?.status;
  const lastSeen = otherUser?.lastSeen;

  const lastMsgContent = chat.lastMessage
    ? chat.lastMessage.type === 'image'
      ? '📷 Photo'
      : chat.lastMessage.type === 'audio'
      ? '🎤 Voice message'
      : truncate(chat.lastMessage.content, 45)
    : '';

  const isMyLastMsg = chat.lastMessage?.senderId === currentUser.id;

  return (
    <motion.div
      whileHover={{ backgroundColor: 'hsl(var(--accent) / 0.6)' }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors relative',
        isActive
          ? 'bg-primary/10 border-r-2 border-r-primary'
          : 'hover:bg-accent/50'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {isAI ? (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
            <Bot size={22} className="text-white" />
          </div>
        ) : (
          <Avatar
            src={displayAvatar}
            name={displayName}
            size="md"
            showStatus={!isGroup && !!status}
            status={status}
          />
        )}
        {isAI && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn(
              'font-semibold truncate text-sm',
              isActive ? 'text-primary' : 'text-foreground'
            )}>
              {displayName}
            </span>
            {chat.isPinned && <Pin size={11} className="text-muted-foreground flex-shrink-0" />}
            {chat.isMuted && <BellOff size={11} className="text-muted-foreground flex-shrink-0" />}
          </div>
          {chat.lastMessage && (
            <span className="text-[11px] text-muted-foreground flex-shrink-0">
              {formatTime(chat.lastMessage.timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {isMyLastMsg && chat.lastMessage && (
              <ReadReceipt
                status={chat.lastMessage.status}
                className="flex-shrink-0 text-muted-foreground [&_svg]:text-muted-foreground [&_path]:stroke-muted-foreground"
              />
            )}
            <p className={cn(
              'text-xs truncate',
              chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
              {isGroup && chat.lastMessage?.senderId !== currentUser.id
                ? `${users.find(u => u.id === chat.lastMessage?.senderId)?.name?.split(' ')[0] || ''}: ${lastMsgContent}`
                : lastMsgContent
              }
            </p>
          </div>

          {chat.unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center',
                chat.isMuted
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
