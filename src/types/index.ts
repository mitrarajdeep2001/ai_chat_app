// ============================================================
// Core Types
// ============================================================

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen';
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'gif' | 'ai';
export type ChatType = 'direct' | 'group' | 'ai';
export type CallType = 'audio' | 'video';
export type CallStatus = 'incoming' | 'outgoing' | 'active' | 'ended' | 'missed' | 'rejected';

// ============================================================
// User Types
// ============================================================

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: UserStatus;
  lastSeen: string;
  bio: string;
  phone: string;
  email: string;
  isVerified?: boolean;
}

export interface CurrentUser extends User {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  readReceipts: boolean;
  lastSeenPrivacy: 'everyone' | 'contacts' | 'nobody';
}

// ============================================================
// Message Types
// ============================================================

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: string;
  replyTo?: string;
  reactions?: Reaction[];
  attachments?: Attachment[];
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface Reaction {
  emoji: string;
  userId: string;
  count: number;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name: string;
  size?: number;
  duration?: number;
  thumbnail?: string;
}

// ============================================================
// Chat Types
// ============================================================

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  description?: string;
  avatar?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupChat extends Chat {
  type: 'group';
  name: string;
  description: string;
  avatar: string;
  admins: string[];
  inviteLink?: string;
}

// ============================================================
// Story Types
// ============================================================

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  duration: number;
  viewedBy: string[];
  createdAt: string;
  expiresAt: string;
}

export interface StoryGroup {
  user: User;
  stories: Story[];
  hasUnviewed: boolean;
}

// ============================================================
// Call Types
// ============================================================

export interface Call {
  id: string;
  type: CallType;
  status: CallStatus;
  participants: string[];
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  isGroupCall?: boolean;
}

// ============================================================
// Smart Reply Types
// ============================================================

export interface SmartReply {
  id: string;
  text: string;
  emoji?: string;
}

// ============================================================
// Notification Types
// ============================================================

export interface Notification {
  id: string;
  type: 'message' | 'call' | 'story' | 'contact';
  title: string;
  body: string;
  avatar?: string;
  timestamp: string;
  read: boolean;
  chatId?: string;
}

// ============================================================
// Settings Types
// ============================================================

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    messages: boolean;
    calls: boolean;
    stories: boolean;
    sounds: boolean;
    vibration: boolean;
  };
  privacy: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    about: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
  };
  chat: {
    enterToSend: boolean;
    mediaAutoDownload: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

// ============================================================
// Navigation Types
// ============================================================

export type NavTab = 'chats' | 'calls' | 'stories' | 'settings';
export type ActiveView = 'chat' | 'calls' | 'stories' | 'settings' | 'auth' | 'onboarding' | 'addContact';
