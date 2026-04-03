'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Volume2 } from 'lucide-react';
import { Call } from '@/types';
import { users } from '@/data/users';
import { currentUser } from '@/data/users';
import Avatar from '@/components/common/Avatar';
import { useEffect, useState } from 'react';

interface CallScreenProps {
  call: Call;
  onEnd: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function CallScreen({ call, onEnd, onAccept, onReject }: CallScreenProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  const otherId = call.participants.find(p => p !== currentUser.id);
  const otherUser = users.find(u => u.id === otherId);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (call.status === 'active') {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [call.status]);

  const statusText = {
    incoming: 'Incoming call...',
    outgoing: 'Calling...',
    active: formatDuration(duration),
    ended: 'Call ended',
    missed: 'Missed call',
    rejected: 'Call rejected',
  }[call.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {call.type === 'video' && call.status === 'active' && (
          // Mock video background
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center opacity-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://picsum.photos/seed/${otherId}/800/600`}
              alt=""
              className="w-full h-full object-cover opacity-30 blur-sm"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Self video (picture-in-picture) */}
      {call.type === 'video' && call.status === 'active' && !isVideoOff && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10"
        >
          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center">
            <Avatar src={currentUser.avatar} name={currentUser.name} size="lg" />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm px-8">
        {/* User info */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={call.status === 'incoming' ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="relative"
          >
            <div className={`${call.status === 'incoming' ? 'animate-pulse-ring' : ''} rounded-full`}>
              <Avatar
                src={otherUser?.avatar}
                name={otherUser?.name || '?'}
                size="xl"
                className="ring-4 ring-white/20"
              />
            </div>
          </motion.div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{otherUser?.name || 'Unknown'}</h2>
            <p className="text-white/70 mt-1 flex items-center gap-2 justify-center">
              {call.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
              {statusText}
            </p>
          </div>
        </div>

        {/* Call Controls */}
        {call.status === 'incoming' ? (
          /* Incoming call buttons */
          <div className="flex items-center gap-10 mt-4">
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onReject}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-xl"
              >
                <PhoneOff size={26} className="text-white" />
              </motion.button>
              <span className="text-white/70 text-xs">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onAccept}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-xl animate-pulse"
              >
                {call.type === 'video' ? <Video size={26} className="text-white" /> : <Phone size={26} className="text-white" />}
              </motion.button>
              <span className="text-white/70 text-xs">Accept</span>
            </div>
          </div>
        ) : (
          /* Active/Outgoing controls */
          <div className="flex flex-col items-center gap-6 w-full mt-4">
            {/* Secondary controls */}
            {call.status === 'active' && (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-white text-slate-900' : 'bg-white/20 text-white'}`}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <span className="text-white/60 text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
                </div>
                {call.type === 'video' && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => setIsVideoOff(!isVideoOff)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-white text-slate-900' : 'bg-white/20 text-white'}`}
                    >
                      {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                    <span className="text-white/60 text-xs">Camera</span>
                  </div>
                )}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setIsSpeaker(!isSpeaker)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSpeaker ? 'bg-white text-slate-900' : 'bg-white/20 text-white'}`}
                  >
                    <Volume2 size={20} />
                  </button>
                  <span className="text-white/60 text-xs">Speaker</span>
                </div>
              </div>
            )}

            {/* End call */}
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEnd}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-xl"
              >
                <PhoneOff size={26} className="text-white" />
              </motion.button>
              <span className="text-white/70 text-xs">End call</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
