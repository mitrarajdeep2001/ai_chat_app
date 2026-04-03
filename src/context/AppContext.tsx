'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Chat, Message, User, Call, NavTab, Settings, Contact } from '@/types';
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
  uploadAvatar: (file: File) => Promise<string | null>;
  isEditingProfile: boolean;
  setIsEditingProfile: (v: boolean) => void;

  contacts: Contact[];
  isFetchingContacts: boolean;
  addContact: (targetUser: User) => Promise<{ success: boolean; error?: string }>;
  removeContact: (contactId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  startDirectMessage: (contactUser: User) => Promise<void>;
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isFetchingContacts, setIsFetchingContacts] = useState(false);

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
            name: userProfile.name || userProfile.username || userProfile.email,
            username: userProfile.username,
            email: userProfile.email,
            avatar: userProfile.avatar_url,
            status: 'online',
            lastSeen: new Date().toISOString(),
            bio: userProfile.bio || '',
            phone: userProfile.phone_number || ''
          });
          setIsAuthView(false);
          setIsLoggingOut(false);
          setIsInitialLoading(false);
          fetchContacts(userProfile.id);
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
                name: retryProfile.name || retryProfile.username || retryProfile.email,
                username: retryProfile.username,
                email: retryProfile.email,
                avatar: retryProfile.avatar_url,
                status: 'online',
                lastSeen: new Date().toISOString(),
                bio: retryProfile.bio || '',
                phone: retryProfile.phone_number || ''
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
    if (!user) {
      console.error('[Auth] updateProfile: No user found in context');
      throw new Error('Not authenticated. Please log in again.');
    }

    console.log('[Auth] updateProfile: Updating user', user.id, 'with fields:', updates);

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.phone !== undefined) dbUpdates.phone_number = updates.phone;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;

    // Check if there are actually updates to make
    if (Object.keys(dbUpdates).length === 0) {
      console.log('[Auth] updateProfile: No fields to update');
      return;
    }

    try {
      const { error, data } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[Auth] updateProfile Error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          updates: dbUpdates,
          userId: user.id
        });

        // Map common error codes to user-friendly messages
        if (error.code === '23505') {
          if (error.message.includes('username')) {
            throw new Error('Username is already taken. Please choose another.');
          } else if (error.message.includes('email')) {
            throw new Error('Email is already registered.');
          }
        } else if (error.code === '42501') {
          throw new Error('You do not have permission to update this profile.');
        } else if (error.message.includes('JWT')) {
          throw new Error('Your session has expired. Please log in again.');
        }

        throw new Error(`Failed to update profile: ${error.message || 'Unknown error'}`);
      }

      console.log('[Auth] updateProfile: Successfully updated user', data);
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return data;
    } catch (err: any) {
      console.error('[Auth] updateProfile Exception:', err);
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      console.error('[Storage] uploadAvatar: No user found');
      throw new Error('Not authenticated. Please log in again.');
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file (JPEG, PNG, GIF, etc.).');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be less than 5MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;
    
    console.log('[Storage] Uploading avatar:', {
      userId: user.id,
      fileName,
      fileSize: file.size,
      fileType: file.type
    });

    try {
      console.log('[Storage] uploadAvatar START:', fileName);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          cacheControl: '3600', 
          upsert: true 
        });
        
      if (uploadError) {
        console.error('[Storage] uploadAvatar Error (Raw):', uploadError);
        const error: any = new Error(uploadError.message || 'Upload failed');
        error.code = uploadError.statusCode || (uploadError as any).status || 'UNKNOWN';
        error.details = (uploadError as any).details || '';
        throw error;
      }
      
      console.log('[Storage] uploadAvatar SUCCESS', uploadData);
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return `${data.publicUrl}?t=${new Date().getTime()}`;
    } catch (err: any) {
      console.error('[Storage] uploadAvatar Exception:', {
        message: err.message,
        details: err.details,
        code: err.code
      });
      throw err;
    }
  };

  // ─── Contacts ─────────────────────────────────────────────────────────────

  const fetchContacts = useCallback(async (userId: string) => {
    setIsFetchingContacts(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          user_id,
          created_at,
          contact_user:users!contacts_contact_user_id_fkey (
            id, name, username, email, avatar_url, bio, phone_number
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Contacts] fetchContacts error:', error);
        return;
      }

      const mapped: Contact[] = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        createdAt: row.created_at,
        contactUser: {
          id: row.contact_user.id,
          name: row.contact_user.name || row.contact_user.username || row.contact_user.email,
          username: row.contact_user.username || '',
          email: row.contact_user.email || '',
          avatar: row.contact_user.avatar_url || '',
          bio: row.contact_user.bio || '',
          phone: row.contact_user.phone_number || '',
          status: 'offline' as const,
          lastSeen: new Date().toISOString(),
        },
      }));
      setContacts(mapped);
    } finally {
      setIsFetchingContacts(false);
    }
  }, [supabase]);

  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    if (!query.trim() || !user) return [];
    const q = query.trim();
    // PostgREST .or() uses * as wildcard for ilike, not %
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, email, avatar_url, bio, phone_number')
      .or(`username.ilike.*${q}*,phone_number.ilike.*${q}*,name.ilike.*${q}*`)
      .neq('id', user.id)
      .limit(10);

    if (error) console.error('[Contacts] searchUsers error:', error);

    return (data || []).map((u: any) => ({
      id: u.id,
      name: u.name || u.username || u.email,
      username: u.username || '',
      email: u.email || '',
      avatar: u.avatar_url || '',
      bio: u.bio || '',
      phone: u.phone_number || '',
      status: 'offline' as const,
      lastSeen: new Date().toISOString(),
    }));
  }, [supabase, user]);

  const addContact = useCallback(async (targetUser: User): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated.' };

    const alreadyAdded = contacts.some(c => c.contactUser.id === targetUser.id);
    if (alreadyAdded) return { success: false, error: 'This user is already in your contacts.' };

    const { data: inserted, error } = await supabase
      .from('contacts')
      .insert({ user_id: user.id, contact_user_id: targetUser.id })
      .select('id, user_id, created_at')
      .single();

    if (error) {
      console.error('[Contacts] addContact error:', error);
      return { success: false, error: `Failed to add contact: ${error.message}` };
    }

    const newContact: Contact = {
      id: inserted.id,
      userId: inserted.user_id,
      createdAt: inserted.created_at,
      contactUser: targetUser,
    };
    setContacts(prev => [newContact, ...prev]);
    return { success: true };
  }, [supabase, user, contacts]);

  const removeContact = useCallback(async (contactId: string): Promise<void> => {
    const { error } = await supabase.from('contacts').delete().eq('id', contactId);
    if (error) {
      console.error('[Contacts] removeContact error:', error);
      throw new Error('Failed to remove contact.');
    }
    setContacts(prev => prev.filter(c => c.id !== contactId));
  }, [supabase]);

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
      searchQuery, setSearchQuery, user, lastUsedEmail, login, loginWithOAuth, register, verifyEmail, logout, updateProfile, uploadAvatar,
      isEditingProfile, setIsEditingProfile,
      contacts, isFetchingContacts, addContact, removeContact, searchUsers,
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
