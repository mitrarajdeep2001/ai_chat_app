'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Video, MoreVertical, Search, Info, Bell, BellOff, Trash2, Bot, Users } from 'lucide-react';
import { Chat, User } from '@/types';
import Avatar from '@/components/common/Avatar';
import { currentUser, users } from '@/data/users';
import { formatLastSeen } from '@/utils/format';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { useState } from 'react';

interface ChatHeaderProps {
  chat: Chat;
  onBack?: () => void;
  onShowInfo?: () => void;
}

export default function ChatHeader({ chat, onBack, onShowInfo }: ChatHeaderProps) {
  const { startCall, setShowRightPanel, showRightPanel } = useApp();
  const [showMenu, setShowMenu] = useState(false);

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
    ? undefined
    : otherUser?.avatar;

  const subtitle = isAI
    ? 'AI Assistant · Always online'
    : isGroup
    ? `${chat.participants.length} members`
    : otherUser
    ? formatLastSeen(otherUser.lastSeen, otherUser.status)
    : '';

  const isOnline = isAI ? true : !isGroup && otherUser?.status === 'online';

  const menuItems = [
    { icon: Search, label: 'Search in chat' },
    { icon: Info, label: 'View info' },
    { icon: Bell, label: 'Mute notifications' },
    { icon: Trash2, label: 'Clear chat', className: 'text-destructive' },
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur z-10">
      {/* Back button (mobile) */}
      <button
        onClick={onBack}
        className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors -ml-1"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Avatar + Name */}
      <button
        onClick={() => setShowRightPanel(!showRightPanel)}
        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
      >
        {isAI ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
            <Bot size={20} className="text-white" />
          </div>
        ) : isGroup ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-primary" />
          </div>
        ) : (
          <Avatar
            src={displayAvatar}
            name={displayName}
            size="sm"
            showStatus={!isGroup}
            status={otherUser?.status}
          />
        )}

        <div className="min-w-0">
          <h2 className="font-semibold text-sm text-foreground truncate">{displayName}</h2>
          <p className={cn(
            'text-xs truncate',
            isOnline ? 'text-green-500' : 'text-muted-foreground'
          )}>
            {subtitle}
          </p>
        </div>
      </button>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {!isAI && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startCall(otherUserId || '', 'audio')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Phone size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startCall(otherUserId || '', 'video')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Video size={18} />
            </motion.button>
          </>
        )}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <MoreVertical size={18} />
          </motion.button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-10 w-52 bg-popover border border-border rounded-xl shadow-modal z-20 overflow-hidden"
              >
                {menuItems.map(({ icon: Icon, label, className }) => (
                  <button
                    key={label}
                    onClick={() => setShowMenu(false)}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-accent transition-colors',
                      className || 'text-foreground'
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
