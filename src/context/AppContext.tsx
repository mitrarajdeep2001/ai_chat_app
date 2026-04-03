'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Chat, Message, User, Call, NavTab, Settings } from '@/types';
import { chats as initialChats } from '@/data/chats';
import { allMessages } from '@/data/messages';
import { generateId } from '@/utils/format';
import { getContextualReplies } from '@/data/smartReplies';
import { SmartReply } from '@/types';

interface AppContextType {
  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
  isAuthView: boolean;
  setIsAuthView: (v: boolean) => void;
  authView: 'login' | 'register' | 'onboarding' | 'verify';
  setAuthView: (v: 'login' | 'register' | 'onboarding' | 'verify') => void;

  // Chats
  chats: Chat[];
  messages: Record<string, Message[]>;
  sendMessage: (chatId: string, content: string, type?: Message['type']) => void;
  markAsRead: (chatId: string) => void;

  // Smart Replies
  smartReplies: SmartReply[];
  refreshSmartReplies: (chatId: string) => void;

  // Calls
  activeCall: Call | null;
  setActiveCall: (call: Call | null) => void;
  incomingCall: Call | null;
  setIncomingCall: (call: Call | null) => void;
  startCall: (userId: string, type: 'audio' | 'video') => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;

  // AI Typing
  isAiTyping: boolean;

  // Settings
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;

  // Add Contact modal
  showAddContact: boolean;
  setShowAddContact: (v: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Auth
  user: User | null;
  lastUsedEmail: string;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, name: string) => Promise<{ success: boolean; requireVerification?: boolean; error?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'system',
  notifications: {
    messages: true,
    calls: true,
    stories: true,
    sounds: true,
    vibration: true,
  },
  privacy: {
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    readReceipts: true,
  },
  chat: {
    enterToSend: true,
    mediaAutoDownload: true,
    fontSize: 'medium',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavTab>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isAuthView, setIsAuthView] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register' | 'onboarding' | 'verify'>('login');
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [messages, setMessages] = useState<Record<string, Message[]>>(allMessages);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [showAddContact, setShowAddContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSmartReplies, setCurrentSmartReplies] = useState<SmartReply[]>([]);
  const [lastUsedEmail, setLastUsedEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);

  // Check auth on mount (Stubbed)
  useEffect(() => {
    // For now, we stay in auth view until the user "logs in"
    setIsAuthView(true);
  }, []);

  const login = async (email: string, pass: string) => {
    // Mock login logic
    const mockUser: User = {
      id: 'mock-user-id',
      name: email.split('@')[0],
      username: email.split('@')[0],
      avatar: '',
      email: email,
      status: 'online',
      lastSeen: new Date().toISOString(),
      bio: 'Mock user bio',
      phone: ''
    };
    
    setUser(mockUser);
    setIsAuthView(false);
    return { success: true };
  };

  const register = async (email: string, pass: string, name: string) => {
    // Mock register logic
    setLastUsedEmail(email);
    setAuthView('onboarding');
    return { success: true };
  };

  const verifyEmail = async (email: string, otp: string) => {
    // Mock verify logic
    setIsAuthView(false);
    return { success: true };
  };

  const logout = async () => {
    // Mock logout logic
    setUser(null);
    setIsAuthView(true);
    setAuthView('login');
  };

  const updateProfile = async (updates: Partial<User>) => {
    // Mock update logic
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const refreshSmartReplies = useCallback((chatId: string) => {
    const chatMessages = messages[chatId] || [];
    const lastMessage = chatMessages[chatMessages.length - 1];
    if (lastMessage) {
      setCurrentSmartReplies(getContextualReplies(lastMessage.content));
    }
  }, [messages]);

  const sendMessage = useCallback((chatId: string, content: string, type: Message['type'] = 'text') => {
    if (!user) return;
    
    const newMsg: Message = {
      id: generateId(),
      chatId,
      senderId: user.id,
      content,
      type,
      status: 'sending',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    // Simulate sent → delivered status
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(m =>
          m.id === newMsg.id ? { ...m, status: 'sent' as const } : m
        ),
      }));
    }, 500);

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(m =>
          m.id === newMsg.id ? { ...m, status: 'delivered' as const } : m
        ),
      }));
    }, 1200);

    // Update chat last message
    setChats(prev => prev.map(c =>
      c.id === chatId ? { ...c, lastMessage: newMsg, updatedAt: newMsg.timestamp } : c
    ));

    // AI auto-response
    const chat = chats.find(c => c.id === chatId);
    if (chat?.type === 'ai') {
      setIsAiTyping(true);
      setTimeout(() => {
        const aiReplies = [
          'That\'s a great question! Let me think about that...\n\nBased on my analysis, there are several key aspects to consider. The most important thing is to approach this systematically and break it down into manageable pieces. 🧠',
          'Absolutely! Here\'s what I\'d recommend:\n\n1. **Start with the basics** - Make sure you have a solid foundation\n2. **Iterate quickly** - Don\'t overthink, just build and learn\n3. **Measure results** - Track what matters\n\nWould you like me to elaborate on any of these points? 💡',
          'Great point! I\'ve processed your request and here\'s my take:\n\nThe key insight here is that **simplicity often wins**. Complexity adds maintenance burden and makes it harder to debug. Focus on clean, readable solutions.\n\nIs there anything specific you\'d like me to dive deeper into? 🎯',
          'I understand what you\'re looking for! Here\'s a concise answer:\n\nThe most effective approach combines proven patterns with modern best practices. Think of it as building blocks — each piece should be composable and testable on its own.\n\nLet me know if you want code examples! 🚀',
        ];
        const reply: Message = {
          id: generateId(),
          chatId,
          senderId: 'ai-assistant',
          content: aiReplies[Math.floor(Math.random() * aiReplies.length)],
          type: 'ai',
          status: 'delivered',
          timestamp: new Date().toISOString(),
        };
        setIsAiTyping(false);
        setMessages(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), reply],
        }));
        setChats(prev => prev.map(c =>
          c.id === chatId ? { ...c, lastMessage: reply, updatedAt: reply.timestamp, unreadCount: c.unreadCount + 1 } : c
        ));
      }, 2000 + Math.random() * 1500);
    }
  }, [chats, user]);

  const markAsRead = useCallback((chatId: string) => {
    if (!user) return;
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
    setMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map(m =>
        m.senderId !== user.id && m.status !== 'seen'
          ? { ...m, status: 'seen' as const }
          : m
      ),
    }));
  }, [user]);

  const startCall = useCallback((userId: string, type: 'audio' | 'video') => {
    if (!user) return;
    const call: Call = {
      id: generateId(),
      type,
      status: 'outgoing',
      participants: [user.id, userId],
      startedAt: new Date().toISOString(),
    };
    setActiveCall(call);
    // Simulate call connecting
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'active' } : null);
    }, 2000);
  }, [user]);

  const acceptCall = useCallback(() => {
    if (incomingCall) {
      setActiveCall({ ...incomingCall, status: 'active', startedAt: new Date().toISOString() });
      setIncomingCall(null);
    }
  }, [incomingCall]);

  const rejectCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  const endCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  // Demo: trigger incoming call after 8 seconds
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      if (!activeCall) {
        setIncomingCall({
          id: generateId(),
          type: 'video',
          status: 'incoming',
          participants: ['user-1', user.id],
        });
        // Auto-dismiss after 15 seconds
        setTimeout(() => setIncomingCall(null), 15000);
      }
    }, 8000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeCall]);

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      activeChatId, setActiveChatId,
      showRightPanel, setShowRightPanel,
      isAuthView, setIsAuthView,
      authView, setAuthView,
      chats, messages,
      sendMessage, markAsRead,
      smartReplies: currentSmartReplies,
      refreshSmartReplies,
      activeCall, setActiveCall,
      incomingCall, setIncomingCall,
      startCall, acceptCall, rejectCall, endCall,
      isAiTyping,
      settings, updateSettings,
      showAddContact, setShowAddContact,
      searchQuery, setSearchQuery,
      user, lastUsedEmail, login, register, verifyEmail, logout, updateProfile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
