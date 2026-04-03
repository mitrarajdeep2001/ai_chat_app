'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Chat, User } from '@/types';
import MessageBubble, { DateDivider } from './MessageBubble';
import TypingIndicator from '@/components/common/TypingIndicator';
import { currentUser } from '@/data/users';
import { cn } from '@/lib/utils';
import { formatDateDivider } from '@/utils/format';
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  chat: Chat;
  users: Record<string, User>;
  isAiTyping?: boolean;
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = '';
  
  for (const msg of messages) {
    const dateLabel = formatDateDivider(msg.timestamp);
    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      groups.push({ date: dateLabel, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

export default function MessageList({ messages, chat, users, isAiTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const dateGroups = groupMessagesByDate(messages);
  const isGroup = chat.type === 'group';

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-0 scroll-smooth">
      {/* Chat Start Banner */}
      <div className="flex flex-col items-center gap-2 px-8 py-6 mb-2">
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center mb-1',
          chat.type === 'ai' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20'
        )}>
          {chat.type === 'ai' ? (
            <Bot className="text-white" size={28} />
          ) : (
            <span className="text-2xl">💬</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {chat.type === 'ai'
            ? 'This is Nexus AI — your intelligent assistant. Ask anything!'
            : chat.type === 'group'
            ? `This is the beginning of ${(chat as any).name || 'this group'}`
            : 'This is the beginning of your conversation'}
        </p>
      </div>

      {/* Message groups */}
      {dateGroups.map(({ date, messages: groupMsgs }) => (
        <div key={date}>
          <DateDivider date={date} />
          {groupMsgs.map((message, idx) => {
            const sender = users[message.senderId];
            const prevMsg = groupMsgs[idx - 1];
            const nextMsg = groupMsgs[idx + 1];
            const isFirstInGroup = !prevMsg || prevMsg.senderId !== message.senderId;
            const isLastInGroup = !nextMsg || nextMsg.senderId !== message.senderId;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                sender={sender}
                showAvatar={isGroup && message.senderId !== currentUser.id}
                isGroup={isGroup}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
              />
            );
          })}
        </div>
      ))}

      {/* AI Typing Indicator */}
      <AnimatePresence>
        {isAiTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-end gap-2 px-4 mb-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bubble-ai">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}
