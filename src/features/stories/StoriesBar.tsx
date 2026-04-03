'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { StoryGroup } from '@/types';
import { users as allUsers } from '@/data/users';
import { currentUser } from '@/data/users';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/format';

interface StoriesBarProps {
  stories: StoryGroup[];
}

interface StoryViewerProps {
  group: StoryGroup;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

function StoryViewer({ group, onClose, onNext, onPrev }: StoryViewerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const story = group.stories[currentIdx];
  const progress = ((currentIdx + 1) / group.stories.length) * 100;

  const [progressValue, setProgressValue] = useState(0);

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressValue(p => {
        if (p >= 100) {
          if (currentIdx < group.stories.length - 1) {
            setCurrentIdx(i => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return p + (100 / (story.duration * 10));
      });
    }, 100);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      {/* Story image */}
      <div className="relative w-full max-w-sm h-full max-h-[700px] rounded-none md:rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={story.mediaUrl}
          alt=""
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: i < currentIdx ? '100%' : '0%' }}
                animate={{
                  width: i < currentIdx ? '100%' : i === currentIdx ? `${progressValue}%` : '0%'
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={group.user.avatar} name={group.user.name} size="sm" />
            <div>
              <p className="text-white text-sm font-semibold">{group.user.name}</p>
              <p className="text-white/70 text-xs">{formatTime(story.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-8 left-4 right-4">
            <p className="text-white text-sm text-center font-medium drop-shadow-lg">{story.caption}</p>
          </div>
        )}

        {/* Tap areas */}
        <button
          className="absolute left-0 top-0 w-1/3 h-full"
          onClick={() => {
            if (currentIdx > 0) { setCurrentIdx(i => i - 1); setProgressValue(0); }
            else onPrev?.();
          }}
        />
        <button
          className="absolute right-0 top-0 w-1/3 h-full"
          onClick={() => {
            if (currentIdx < group.stories.length - 1) { setCurrentIdx(i => i + 1); setProgressValue(0); }
            else onNext?.();
          }}
        />
      </div>

      {/* Navigation arrows */}
      <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors hidden md:flex">
        <ChevronLeft size={20} />
      </button>
      <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors hidden md:flex">
        <ChevronRight size={20} />
      </button>
    </motion.div>
  );
}

export function StoriesBar({ stories }: StoriesBarProps) {
  const [viewingGroup, setViewingGroup] = useState<number | null>(null);

  return (
    <>
      <div className="flex gap-3 px-4 py-4 overflow-x-auto scrollbar-hide">
        {/* Add story */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="relative w-14 h-14 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
              <Plus size={10} className="text-white" />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Add</span>
        </div>

        {/* Story items */}
        {stories.slice(1).map((group, idx) => (
          <motion.div
            key={group.user.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewingGroup(idx + 1)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <div className={cn(
              group.hasUnviewed ? 'story-ring' : 'story-ring-seen',
              'p-0.5'
            )}>
              <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-background w-12 h-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={group.user.avatar} alt={group.user.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground max-w-[56px] truncate">
              {group.user.name.split(' ')[0]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingGroup !== null && (
          <StoryViewer
            group={stories[viewingGroup]}
            onClose={() => setViewingGroup(null)}
            onNext={() => {
              if (viewingGroup < stories.length - 1) setViewingGroup(viewingGroup + 1);
              else setViewingGroup(null);
            }}
            onPrev={() => {
              if (viewingGroup > 1) setViewingGroup(viewingGroup - 1);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default StoriesBar;
