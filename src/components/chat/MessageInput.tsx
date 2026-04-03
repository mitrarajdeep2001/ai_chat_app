'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Smile, Paperclip, Mic, MicOff, X, Image as ImageIcon, 
  FileText, Gift, Plus, ChevronUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartReply } from '@/types';

interface MessageInputProps {
  onSend: (content: string, type?: 'text' | 'audio' | 'image') => void;
  smartReplies?: SmartReply[];
  placeholder?: string;
  disabled?: boolean;
}

const EMOJI_LIST = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '😍', '🤔', '😭', '🙏', '✨', '💯', '🚀', '👀', '🤣', '💪', '😅', '🥰', '😎', '🤩', '👏', '💡', '🎯', '⭐', '🌟', '💥', '🎊', '🤝', '👋', '💬'];

export default function MessageInput({ onSend, smartReplies = [], placeholder = 'Type a message...', disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  useEffect(() => {
    if (isRecording) {
      recordIntervalRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
    } else {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      setRecordSeconds(0);
    }
    return () => { if (recordIntervalRef.current) clearInterval(recordIntervalRef.current); };
  }, [isRecording]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, 'text');
    setText('');
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSmartReply = (reply: SmartReply) => {
    onSend(reply.text, 'text');
    setShowEmoji(false);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      onSend('🎤 Voice message', 'audio');
    } else {
      setIsRecording(true);
    }
  };

  const formatRecordTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col border-t border-border bg-background/95 backdrop-blur">
      {/* Smart Replies */}
      <AnimatePresence>
        {smartReplies.length > 0 && !isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto scrollbar-hide"
          >
            {smartReplies.map((reply) => (
              <motion.button
                key={reply.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSmartReply(reply)}
                className="flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 text-sm text-primary font-medium transition-colors flex-shrink-0"
              >
                {reply.emoji && <span>{reply.emoji}</span>}
                {reply.text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="px-4 py-3 border-t border-border"
          >
            <div className="flex flex-wrap gap-2">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setText(prev => prev + emoji)}
                  className="text-xl hover:scale-125 transition-transform active:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttach && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="px-4 py-3 border-t border-border"
          >
            <div className="flex gap-4">
              {[
                { icon: ImageIcon, label: 'Photo', color: 'from-pink-500 to-rose-500', type: 'image' as const },
                { icon: FileText, label: 'Document', color: 'from-blue-500 to-indigo-500', type: 'text' as const },
                { icon: Gift, label: 'GIF', color: 'from-amber-500 to-orange-500', type: 'text' as const },
              ].map(({ icon: Icon, label, color, type }) => (
                <button
                  key={label}
                  onClick={() => { 
                    if (type === 'image') onSend(`📷 Photo shared`, 'image');
                    setShowAttach(false); 
                  }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center', color)}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Row */}
      <div className="flex items-end gap-2 px-4 py-3">
        {/* Left Icons */}
        <div className="flex items-center gap-1 mb-0.5">
          <button
            onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              showEmoji ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {showEmoji ? <X size={18} /> : <Smile size={18} />}
          </button>
          <button
            onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              showAttach ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {showAttach ? <X size={18} /> : <Paperclip size={18} />}
          </button>
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0">
          {isRecording ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 bg-accent rounded-2xl px-4 py-3 border border-border"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <div className="flex items-center gap-0.5 flex-1">
                {[4,8,14,10,18,12,6,16,10,5,14,9,12,8,17,11,6,13,9,5].map((h, i) => (
                  <div
                    key={i}
                    className="waveform-bar bg-primary/70"
                    style={{ 
                      height: `${h}px`,
                      animationDelay: `${i * 0.06}s`
                    }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-primary">{formatRecordTime(recordSeconds)}</span>
            </motion.div>
          ) : (
            <textarea              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full bg-accent rounded-2xl px-4 py-3 text-sm resize-none border border-border focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground leading-5"
              style={{ maxHeight: '120px' }}
            />
          )}
        </div>

        {/* Right Action: Send or Mic */}
        <div className="mb-0.5">
          {text.trim() ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md hover:shadow-lg transition-shadow"
            >
              <Send size={16} className="-translate-x-0.5 translate-y-0.5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRecordToggle}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md',
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
