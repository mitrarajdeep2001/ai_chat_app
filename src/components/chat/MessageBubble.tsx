'use client';

import { motion } from 'framer-motion';
import { Message, User } from '@/types';
import { formatMessageTime, formatDateDivider } from '@/utils/format';
import { cn } from '@/lib/utils';
import Avatar from '@/components/common/Avatar';
import ReadReceipt from '@/components/common/ReadReceipt';
import { currentUser } from '@/data/users';
import { ImageIcon, FileIcon, Mic, Play, Pause } from 'lucide-react';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  sender?: User;
  showAvatar?: boolean;
  isGroup?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

function AIMessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="ai-message-content text-sm leading-relaxed">
      {lines.map((line, i) => {
        // Bold text
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Code blocks (inline)
        const withCode = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        if (line.startsWith('```')) return null;
        if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
          return <p key={i} dangerouslySetInnerHTML={{ __html: withCode }} />;
        }
        if (line.match(/^\d+\.\s/)) {
          return <p key={i} className="pl-2" dangerouslySetInnerHTML={{ __html: withCode }} />;
        }
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <p key={i} className="pl-2" dangerouslySetInnerHTML={{ __html: withCode }} />;
        }
        if (line === '') return <br key={i} />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: withCode }} />;
      })}
    </div>
  );
}

function AudioMessage({ isSent }: { isSent: boolean }) {
  const [playing, setPlaying] = useState(false);
  const bars = [3, 6, 10, 7, 14, 9, 5, 12, 8, 4, 11, 7, 9, 6, 13, 8, 5, 10, 7, 4];  
  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[200px]">
      <button
        onClick={() => setPlaying(!playing)}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95',
          isSent ? 'bg-white/20 hover:bg-white/30' : 'bg-primary/20 hover:bg-primary/30'
        )}
      >
        {playing ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
      </button>
      <div className="flex items-center gap-0.5 flex-1 h-8">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn(
              'w-1 rounded-full transition-all',
              isSent ? 'bg-white/60' : 'bg-primary/60',
              playing && i < 10 ? (isSent ? 'bg-white' : 'bg-primary') : ''
            )}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span className={cn('text-xs', isSent ? 'text-white/70' : 'text-muted-foreground')}>0:14</span>
    </div>
  );
}

export function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border whitespace-nowrap">
        {date}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function MessageBubble({
  message,
  sender,
  showAvatar = true,
  isGroup = false,
  isFirstInGroup = true,
  isLastInGroup = true,
}: MessageBubbleProps) {
  const isSent = message.senderId === currentUser.id;
  const isAI = message.type === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex items-end gap-2 px-4',
        isSent ? 'flex-row-reverse' : 'flex-row',
        !isLastInGroup && 'mb-0.5',
        isLastInGroup && 'mb-3'
      )}
    >
      {/* Avatar */}
      {!isSent && isGroup && showAvatar ? (
        <div className="w-8 h-8 flex-shrink-0">
          {isLastInGroup && sender && (
            <Avatar src={sender.avatar} name={sender.name} size="xs" />
          )}
        </div>
      ) : !isSent && !isGroup && <div className="w-0" />}

      <div className={cn('flex flex-col max-w-[75%]', isSent && 'items-end')}>
        {/* Sender name (group only) */}
        {isGroup && !isSent && isFirstInGroup && sender && (
          <span className="text-xs font-semibold text-primary mb-1 ml-1">
            {sender.name}
          </span>
        )}

        {/* Bubble */}
        <div className={cn(
          isAI ? 'bubble-ai max-w-full' : isSent ? 'bubble-sent' : 'bubble-received',
          isGroup && !isSent && !isLastInGroup && 'rounded-bl-2xl',
          isGroup && !isSent && !isFirstInGroup && 'rounded-tl-sm',
        )}>
          {/* Image */}
          {message.type === 'image' && message.attachments?.[0] && (
            <div className="mb-1.5 -mx-1 -mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.attachments[0].url}
                alt="attachment"
                className="rounded-xl w-full max-w-[280px] object-cover"
                style={{ maxHeight: '220px' }}
              />
            </div>
          )}

          {/* Audio */}
          {message.type === 'audio' && <AudioMessage isSent={isSent} />}

          {/* Text content */}
          {message.content && message.type !== 'audio' && (
            isAI ? (
              <AIMessageContent content={message.content} />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )
          )}

          {/* Footer: time + status */}
          <div className={cn(
            'flex items-center gap-1 mt-1',
            isSent || isAI ? 'justify-end' : 'justify-end'
          )}>
            <span className={cn(
              'text-[10px] leading-none',
              isSent ? 'text-white/70' : 'text-muted-foreground',
              isAI && 'text-muted-foreground'
            )}>
              {formatMessageTime(message.timestamp)}
            </span>
            {isSent && <ReadReceipt status={message.status} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
