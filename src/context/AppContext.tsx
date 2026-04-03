'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Chat, Message, User, Call, NavTab, Settings } from '@/types';
import { chats as initialChats } from '@/data/chats';
import { allMessages } from '@/data/messages';
import { generateId } from '@/utils/format';
import { getContextualReplies } from '@/data/smartReplies';
import { SmartReply } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AppContextType {
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
  isInitialLoading: boolean;

  chats: Chat[];
  messages: Record<string, Message[]>;
  sendMessage: (chatId: string, content: string, type?: Message['type']) => void;
  markAsRead: (chatId: string) => void;

  smartReplies: SmartReply[];
  refreshSmartReplies: (chatId: string) => void;

  activeCall: Call | null;
  setActiveCall: (call: Call | null) => void;
  incomingCall: Call | null;
  setIncomingCall: (call: Call | null) => void;
  startCall: (userId: string, type: 'audio' | 'video') => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;

  isAiTyping: boolean;

  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;

  showAddContact: boolean;
  setShowAddContact: (v: boolean) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  user: User | null;
  lastUsedEmail: string;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOAuth: (provider: 'google') => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<{ success: boolean; requireVerification?: boolean; error?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'system',
  notifications: { messages: true, calls: true, stories: true, sounds: true, vibration: true },
  privacy: { lastSeen: 'everyone', profilePhoto: 'everyone', about: 'everyone', readReceipts: true },
  chat: { enterToSend: true, mediaAutoDownload: true, fontSize: 'medium' },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [activeTab, setActiveTab] = useState<NavTab>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isAuthView, setIsAuthView] = useState(true);
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Flag to prevent multiple fetches or stale updates
    let isFetching = false;

    const fetchUser = async (sessionUser: any) => {
      if (!sessionUser || isLoggingOut || isFetching) return;
      isFetching = true;
      console.log('[Auth] fetchUser: START', sessionUser.id, 'isLoggingOut:', isLoggingOut);
      
      try {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .single();
        
        if (userProfile) {
          console.log('[Auth] fetchUser: Profile found');
          setUser({
            id: userProfile.id,
            name: userProfile.username || userProfile.email,
            username: userProfile.username,
            email: userProfile.email,
            avatar: userProfile.avatar_url,
            status: 'online',
            lastSeen: new Date().toISOString(),
            bio: '',
            phone: userProfile.phone_number || ''
          });
          setIsAuthView(false);
          setIsLoggingOut(false);
          setIsInitialLoading(false);
        } else {
          console.log('[Auth] fetchUser: Profile NOT found, starting timeout');
          if (isLoggingOut) return;
          
          if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = setTimeout(async () => {
            console.log('[Auth] Timeout Check: START');
            // Final safety check: if we started logging out during the wait, stop everything
            if (isLoggingOut) {
               console.log('[Auth] Timeout Check: ABORTED (isLoggingOut)');
               return;
            }

            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
               console.log('[Auth] Timeout Check: ABORTED (No session)');
               return;
            }

            const { data: retryProfile } = await supabase.from('users').select('*').eq('id', sessionUser.id).single();
            if (retryProfile) {
              console.log('[Auth] Timeout Check: Profile found on retry');
              setUser({
                id: retryProfile.id,
                name: retryProfile.username || retryProfile.email,
                username: retryProfile.username,
                email: retryProfile.email,
                avatar: retryProfile.avatar_url,
                status: 'online',
                lastSeen: new Date().toISOString(),
                bio: '',
                phone: ''
              });
              setIsAuthView(false);
              setIsInitialLoading(false);
            } else {
              console.log('[Auth] Timeout Check: Final fallback to onboarding');
              if (isLoggingOut) return;
              setAuthView('onboarding');
              setIsInitialLoading(false);
            }
          }, 1500);
        }
      } catch (err) {
        console.error('[Auth] fetchUser Error:', err);
        setIsInitialLoading(false);
      } finally {
        isFetching = false;
      }
    };

    const initializeAuth = async () => {
      console.log('[Auth] initializeAuth: START');
      if (isLoggingOut) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('[Auth] initializeAuth: Session found');
        await fetchUser(session.user);
      } else {
        console.log('[Auth] initializeAuth: NO session');
        setIsAuthView(true);
        setIsInitialLoading(false);
      }
    };

    if (!isLoggingOut) {
      initializeAuth();
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] onAuthStateChange Event:', event, 'User:', session?.user?.id);
      
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
        if (!isLoggingOut) await fetchUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] SIGNED_OUT event received');
        if (authTimeoutRef.current) {
          clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = null;
        }
        setIsLoggingOut(false);
        setUser(null);
        setIsAuthView(true);
        setAuthView('login');
      }
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
      if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
    };
  }, [supabase, isLoggingOut]);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const loginWithOAuth = async (provider: 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const register = async (email: string, pass: string, name: string) => {
    setLastUsedEmail(email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { username: name } }
    });
    
    if (error) return { success: false, error: error.message };

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { success: false, error: 'User already exists' };
    }

    if (data.session) {
      setAuthView('onboarding');
    } else {
      setAuthView('verify');
    }
    return { success: true };
  };

  const verifyEmail = async (email: string, otp: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) return { success: false, error: error.message };
    setIsAuthView(false);
    return { success: true };
  };

  const logout = async () => {
    try {
      console.log('[Auth] Starting logout sequence...');
      // 1. Clear any pending auth timers
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
      
      // 2. Lock UI from any further auth transitions
      setIsLoggingOut(true);
      
      // 3. Immediately update UI state for responsiveness
      setUser(null);
      setIsAuthView(true);
      setAuthView('login');
      setActiveChatId(null);
      
      // 4. Clear cookies and server-side session
      await supabase.auth.signOut();
      console.log('[Auth] Logout successful');
    } catch (err) {
      console.error('Logout error:', err);
      window.location.reload();
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase.from('users').update({
       username: updates.username || updates.name,
    }).eq('id', user.id);

    if (!error) {
       setUser(prev => prev ? { ...prev, ...updates } : null);
    }
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

    setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), newMsg] }));

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(m => m.id === newMsg.id ? { ...m, status: 'sent' as const } : m),
      }));
    }, 500);

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(m => m.id === newMsg.id ? { ...m, status: 'delivered' as const } : m),
      }));
    }, 1200);

    setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMessage: newMsg, updatedAt: newMsg.timestamp } : c));
  }, [chats, user]);

  const markAsRead = useCallback((chatId: string) => {
    if (!user) return;
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
    setMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).map(m => m.senderId !== user.id && m.status !== 'seen' ? { ...m, status: 'seen' as const } : m),
    }));
  }, [user]);

  const startCall = useCallback((userId: string, type: 'audio' | 'video') => {
    if (!user) return;
    const call: Call = {
      id: generateId(), type, status: 'outgoing', participants: [user.id, userId], startedAt: new Date().toISOString()
    };
    setActiveCall(call);
    setTimeout(() => setActiveCall(prev => prev ? { ...prev, status: 'active' } : null), 2000);
  }, [user]);

  const acceptCall = useCallback(() => {
    if (incomingCall) {
      setActiveCall({ ...incomingCall, status: 'active', startedAt: new Date().toISOString() });
      setIncomingCall(null);
    }
  }, [incomingCall]);

  const rejectCall = useCallback(() => setIncomingCall(null), []);
  const endCall = useCallback(() => setActiveCall(null), []);
  const updateSettings = useCallback((partial: Partial<Settings>) => setSettings(prev => ({ ...prev, ...partial })), []);

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab, activeChatId, setActiveChatId, showRightPanel, setShowRightPanel,
      isAuthView, setIsAuthView, authView, setAuthView, isInitialLoading, chats, messages, sendMessage, markAsRead,
      smartReplies: currentSmartReplies, refreshSmartReplies, activeCall, setActiveCall, incomingCall, setIncomingCall,
      startCall, acceptCall, rejectCall, endCall, isAiTyping, settings, updateSettings, showAddContact, setShowAddContact,
      searchQuery, setSearchQuery, user, lastUsedEmail, login, loginWithOAuth, register, verifyEmail, logout, updateProfile
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
