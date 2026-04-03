'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Monitor, Bell, BellOff, Shield, ChevronRight, LogOut, User, Palette, MessageCircle, Info, Camera } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { currentUser } from '@/data/users';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import ProfileEditor from './ProfileEditor';

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
      checked ? 'bg-primary' : 'bg-muted'
    )}
  >
    <span className={cn(
      'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
      checked ? 'translate-x-6' : 'translate-x-1'
    )} />
  </button>
);

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">{title}</h3>
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border mx-4">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  subtitle,
  iconClass,
  right,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  iconClass?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ backgroundColor: 'hsl(var(--accent) / 0.5)' }}
      onClick={onClick}
      className={cn('flex items-center gap-3 px-4 py-3.5 transition-colors', onClick && 'cursor-pointer')}
    >
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', iconClass || 'bg-primary/10')}>
        <Icon size={16} className={iconClass ? 'text-white' : 'text-primary'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {right || (onClick && <ChevronRight size={16} className="text-muted-foreground" />)}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, setIsAuthView, setAuthView, logout, user, isEditingProfile, setIsEditingProfile } = useApp();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background relative overflow-x-hidden">
      {/* Profile Editor Overlay */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            key="profile-editor"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="absolute inset-0 z-50 bg-background"
          >
            <ProfileEditor onClose={() => setIsEditingProfile(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="mx-4 mb-6 p-4 bg-card border border-border rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={user?.avatar} name={user?.name || user?.email || 'User'} size="lg" />
            <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              <Camera size={10} className="text-white" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{user?.name || user?.email}</h2>
            <p className="text-sm text-muted-foreground truncate">@{user?.username || 'user'}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.bio || 'No bio yet'}</p>
          </div>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <ChevronRight size={16} className="text-primary" />
          </button>
        </div>
      </div>

      {/* Theme */}
      <SettingsSection title="Appearance">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={16} className="text-primary" />
            <span className="text-sm font-medium">Theme</span>
          </div>
          <div className="flex gap-2">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all text-sm',
                  theme === value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <SettingsRow
          icon={MessageCircle}
          label="Font Size"
          subtitle={settings.chat.fontSize.charAt(0).toUpperCase() + settings.chat.fontSize.slice(1)}
          iconClass="bg-blue-500"
          onClick={() => {}}
        />
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications">
        <SettingsRow
          icon={Bell}
          label="Message notifications"
          iconClass="bg-orange-500"
          right={
            <ToggleSwitch
              checked={settings.notifications.messages}
              onChange={(v) => updateSettings({ notifications: { ...settings.notifications, messages: v } })}
            />
          }
        />
        <SettingsRow
          icon={Bell}
          label="Call notifications"
          iconClass="bg-green-500"
          right={
            <ToggleSwitch
              checked={settings.notifications.calls}
              onChange={(v) => updateSettings({ notifications: { ...settings.notifications, calls: v } })}
            />
          }
        />
        <SettingsRow
          icon={Bell}
          label="Story notifications"
          iconClass="bg-pink-500"
          right={
            <ToggleSwitch
              checked={settings.notifications.stories}
              onChange={(v) => updateSettings({ notifications: { ...settings.notifications, stories: v } })}
            />
          }
        />
        <SettingsRow
          icon={BellOff}
          label="Sound"
          iconClass="bg-purple-500"
          right={
            <ToggleSwitch
              checked={settings.notifications.sounds}
              onChange={(v) => updateSettings({ notifications: { ...settings.notifications, sounds: v } })}
            />
          }
        />
      </SettingsSection>

      {/* Privacy */}
      <SettingsSection title="Privacy">
        <SettingsRow
          icon={Shield}
          label="Read receipts"
          subtitle="Let others know when you've read their messages"
          iconClass="bg-teal-500"
          right={
            <ToggleSwitch
              checked={settings.privacy.readReceipts}
              onChange={(v) => updateSettings({ privacy: { ...settings.privacy, readReceipts: v } })}
            />
          }
        />
        <SettingsRow
          icon={Shield}
          label="Last seen"
          subtitle={settings.privacy.lastSeen.charAt(0).toUpperCase() + settings.privacy.lastSeen.slice(1)}
          iconClass="bg-cyan-500"
          onClick={() => {}}
        />
        <SettingsRow
          icon={User}
          label="Profile photo"
          subtitle={settings.privacy.profilePhoto.charAt(0).toUpperCase() + settings.privacy.profilePhoto.slice(1)}
          iconClass="bg-indigo-500"
          onClick={() => {}}
        />
      </SettingsSection>

      {/* Chat */}
      <SettingsSection title="Chat">
        <SettingsRow
          icon={MessageCircle}
          label="Enter to send"
          iconClass="bg-emerald-500"
          right={
            <ToggleSwitch
              checked={settings.chat.enterToSend}
              onChange={(v) => updateSettings({ chat: { ...settings.chat, enterToSend: v } })}
            />
          }
        />
        <SettingsRow
          icon={MessageCircle}
          label="Media auto-download"
          iconClass="bg-sky-500"
          right={
            <ToggleSwitch
              checked={settings.chat.mediaAutoDownload}
              onChange={(v) => updateSettings({ chat: { ...settings.chat, mediaAutoDownload: v } })}
            />
          }
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <SettingsRow icon={Info} label="App Version" subtitle="v1.0.0 (Build 100)" iconClass="bg-slate-500" />
      </SettingsSection>

      <div className="h-32" />
    </div>
  );
}
