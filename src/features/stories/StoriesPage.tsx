'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stories } from '@/data/stories';
import { StoriesBar } from '@/features/stories/StoriesBar';
import Avatar from '@/components/common/Avatar';
import { formatTime } from '@/utils/format';
import { Plus, Camera, Type } from 'lucide-react';
import { currentUser } from '@/data/users';

export default function StoriesPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold">Stories</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* My Story */}
        <div className="px-4 py-4 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Story</h3>
          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer">
              <Avatar src={currentUser.avatar} name={currentUser.name} size="md" />
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                <Plus size={10} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Add to My Story</p>
              <p className="text-xs text-muted-foreground">Share a photo, video, or text update</p>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-full bg-accent flex items-center justify-center hover:bg-accent/70 transition-colors">
                <Camera size={16} className="text-muted-foreground" />
              </button>
              <button className="w-9 h-9 rounded-full bg-accent flex items-center justify-center hover:bg-accent/70 transition-colors">
                <Type size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Updates</h3>
          <div className="space-y-2">
            {stories.slice(1).map((group, idx) => (
              <motion.div
                key={group.user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-accent/40 transition-colors cursor-pointer"
              >
                <div className={group.hasUnviewed ? 'story-ring' : 'story-ring-seen'}>
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={group.user.avatar} alt={group.user.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{group.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'} · {formatTime(group.stories[0].createdAt)}
                  </p>
                </div>
                {group.hasUnviewed && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Viewed */}
        <div className="px-4 py-2 pb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Viewed</h3>
          <div className="space-y-2">
            {stories.filter(g => !g.hasUnviewed && g.user.id !== currentUser.id).map((group, idx) => (
              <motion.div
                key={group.user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-accent/40 transition-colors cursor-pointer opacity-70"
              >
                <div className="story-ring-seen p-0.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={group.user.avatar} alt={group.user.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{group.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'} · {formatTime(group.stories[0].createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
