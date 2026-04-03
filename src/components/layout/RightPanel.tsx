'use client';

import { motion } from 'framer-motion';
import { X, Phone, Video, Users, Shield, Bell, BellOff, Trash2, UserMinus, Bot } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { users, currentUser } from '@/data/users';
import Avatar from '@/components/common/Avatar';
import { formatLastSeen } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function RightPanel() {
  const { activeChatId, chats, setShowRightPanel, startCall } = useApp();
  const activeChat = chats.find(c => c.id === activeChatId);
  if (!activeChat) return null;

  const isGroup = activeChat.type === 'group';
  const isAI = activeChat.type === 'ai';
  const otherUserId = activeChat.participants.find(p => p !== currentUser.id);
  const otherUser = users.find(u => u.id === otherUserId);

  const groupMembers = isGroup
    ? activeChat.participants.map(id => users.find(u => u.id === id) || (id === currentUser.id ? currentUser : null)).filter(Boolean)
    : [];

  const displayName = isGroup
    ? (activeChat as any).name
    : isAI ? 'Nexus AI' : otherUser?.name;

  const displayAvatar = isGroup
    ? (activeChat as any).avatar
    : isAI ? undefined : otherUser?.avatar;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="flex flex-col w-72 h-full border-l border-border bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h3 className="font-semibold text-sm">{isGroup ? 'Group Info' : isAI ? 'AI Info' : 'Contact Info'}</h3>
        <button onClick={() => setShowRightPanel(false)} className="w-7 h-7 rounded-full bg-accent flex items-center justify-center hover:bg-accent/70">
          <X size={14} />
        </button>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center gap-3 px-6 py-6 border-b border-border">
        {isAI ? (
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl">
            <Bot size={40} className="text-white" />
          </div>
        ) : (
          <Avatar src={displayAvatar} name={displayName || ''} size="xl" showStatus={!isGroup} status={otherUser?.status} />
        )}
        <div className="text-center">
          <h2 className="font-bold text-lg">{displayName}</h2>
          {!isGroup && !isAI && otherUser && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatLastSeen(otherUser.lastSeen, otherUser.status)}
            </p>
          )}
          {isGroup && (
            <p className="text-sm text-muted-foreground mt-0.5">{activeChat.participants.length} members</p>
          )}
          {isAI && (
            <p className="text-xs text-green-500 font-medium mt-0.5">● Always Online</p>
          )}
        </div>

        {/* Bio */}
        {!isGroup && (
          <p className="text-sm text-muted-foreground text-center">
            {isAI ? '🤖 Your intelligent AI assistant. Ask me anything!' : otherUser?.bio}
          </p>
        )}
        {isGroup && (activeChat as any).description && (
          <p className="text-sm text-muted-foreground text-center">{(activeChat as any).description}</p>
        )}

        {/* Action Buttons */}
        {!isAI && !isGroup && (
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => otherUserId && startCall(otherUserId, 'audio')}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center hover:bg-green-500/20 transition-colors">
                <Phone size={18} className="text-green-600" />
              </div>
              <span className="text-xs text-muted-foreground">Audio</span>
            </button>
            <button
              onClick={() => otherUserId && startCall(otherUserId, 'video')}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                <Video size={18} className="text-blue-600" />
              </div>
              <span className="text-xs text-muted-foreground">Video</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Shield size={18} className="text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Block</span>
            </button>
          </div>
        )}
      </div>

      {/* Group Members */}
      {isGroup && groupMembers.length > 0 && (
        <div className="px-4 py-4 border-b border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users size={12} /> Members
          </h4>
          <div className="space-y-2">
            {groupMembers.map((member) => {
              if (!member) return null;
              const isMe = member.id === currentUser.id;
              const isAdmin = (activeChat as any).admins?.includes(member.id);
              return (
                <div key={member.id} className="flex items-center gap-2.5 py-1">
                  <Avatar src={member.avatar} name={member.name} size="sm" showStatus status={member.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{isMe ? 'You' : member.name}</p>
                    {isAdmin && <p className="text-xs text-primary">Admin</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-4 space-y-1">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-colors text-sm">
          <Bell size={16} className="text-muted-foreground" />
          <span>Mute notifications</span>
        </button>
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-colors text-sm text-destructive">
          <Trash2 size={16} />
          <span>Clear chat</span>
        </button>
        {!isAI && (
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-accent/50 transition-colors text-sm text-destructive">
            {isGroup ? <UserMinus size={16} /> : <Shield size={16} />}
            <span>{isGroup ? 'Leave group' : 'Block contact'}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
