'use client';

import { motion } from 'framer-motion';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import { users, currentUser } from '@/data/users';
import { useApp } from '@/context/AppContext';
import { formatTime } from '@/utils/format';

const callHistory = [
  { id: 'c1', userId: 'user-1', type: 'video' as const, direction: 'outgoing', status: 'ended', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), duration: 342 },
  { id: 'c2', userId: 'user-2', type: 'audio' as const, direction: 'incoming', status: 'ended', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), duration: 128 },
  { id: 'c3', userId: 'user-3', type: 'audio' as const, direction: 'incoming', status: 'missed', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), duration: 0 },
  { id: 'c4', userId: 'user-5', type: 'video' as const, direction: 'outgoing', status: 'ended', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), duration: 1824 },
  { id: 'c5', userId: 'user-6', type: 'audio' as const, direction: 'incoming', status: 'ended', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), duration: 56 },
  { id: 'c6', userId: 'user-4', type: 'audio' as const, direction: 'outgoing', status: 'rejected', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), duration: 0 },
  { id: 'c7', userId: 'user-1', type: 'video' as const, direction: 'incoming', status: 'missed', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), duration: 0 },
];

function formatDuration(seconds: number) {
  if (seconds === 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function CallsPage() {
  const { startCall } = useApp();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold">Calls</h1>
      </div>

      {/* New Call Section */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contacts</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {users.slice(0, 5).map((user) => (
            <div key={user.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="relative">
                <Avatar src={user.avatar} name={user.name} size="md" showStatus status={user.status} />
              </div>
              <span className="text-xs text-muted-foreground">{user.name.split(' ')[0]}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => startCall(user.id, 'audio')}
                  className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                >
                  <Phone size={12} className="text-green-600" />
                </button>
                <button
                  onClick={() => startCall(user.id, 'video')}
                  className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                >
                  <Video size={12} className="text-blue-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call History */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent</h3>
        </div>
        <div className="divide-y divide-border/50">
          {callHistory.map((call, i) => {
            const user = users.find(u => u.id === call.userId);
            if (!user) return null;
            const isMissed = call.status === 'missed';
            const isRejected = call.status === 'rejected';

            const DirectionIcon = isMissed || isRejected
              ? PhoneMissed
              : call.direction === 'incoming' ? PhoneIncoming : PhoneOutgoing;

            return (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/40 transition-colors cursor-pointer"
              >
                <Avatar src={user.avatar} name={user.name} size="md" showStatus status={user.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <DirectionIcon
                      size={12}
                      className={isMissed || isRejected ? 'text-red-500' : 'text-green-500'}
                    />
                    <span className={`text-xs ${isMissed || isRejected ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {isMissed ? 'Missed' : isRejected ? 'Rejected' : call.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
                      {formatDuration(call.duration) && ` · ${formatDuration(call.duration)}`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground">{formatTime(call.timestamp)}</span>
                  <button
                    onClick={() => startCall(user.id, call.type)}
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    {call.type === 'video' ? <Video size={14} className="text-primary" /> : <Phone size={14} className="text-primary" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
