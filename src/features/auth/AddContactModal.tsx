'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, AtSign, Search, UserPlus, Check, Loader2, AlertCircle } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

type AddMethod = 'username' | 'phone';

export default function AddContactModal() {
  const { setShowAddContact, searchUsers, addContact, contacts } = useApp();
  const [method, setMethod] = useState<AddMethod>('username');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // Pre-populate added state from existing contacts
  useEffect(() => {
    setAddedIds(contacts.map(c => c.contactUser.id));
  }, [contacts]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [method]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) { setResults([]); return; }

    searchTimer.current = setTimeout(async () => {
      setIsSearching(true);
      const found = await searchUsers(val);
      setResults(found);
      setIsSearching(false);
    }, 400);
  };

  const handleAdd = async (targetUser: User) => {
    setLoadingIds(prev => [...prev, targetUser.id]);
    setErrorMap(prev => { const next = { ...prev }; delete next[targetUser.id]; return next; });

    const { success, error } = await addContact(targetUser);
    if (success) {
      setAddedIds(prev => [...prev, targetUser.id]);
    } else {
      setErrorMap(prev => ({ ...prev, [targetUser.id]: error || 'Failed to add.' }));
    }
    setLoadingIds(prev => prev.filter(id => id !== targetUser.id));
  };

  const methods = [
    { id: 'username' as const, icon: AtSign, label: 'Username' },
    { id: 'phone' as const, icon: Phone, label: 'Phone' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) setShowAddContact(false); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', damping: 26, stiffness: 380 }}
        className="w-full max-w-md bg-background rounded-3xl shadow-modal border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus size={16} className="text-primary" />
            </div>
            <h2 className="font-bold text-lg">Add Contact</h2>
          </div>
          <button
            onClick={() => setShowAddContact(false)}
            className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Method Tabs */}
        <div className="flex gap-2 px-6 py-4">
          {methods.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setMethod(id); setQuery(''); setResults([]); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-sm font-medium',
                method === id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 pb-2">
          <div className="relative">
            {isSearching
              ? <Loader2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin" />
              : <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            }
            <input
              ref={inputRef}
              type={method === 'phone' ? 'tel' : 'text'}
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder={method === 'phone' ? 'Enter phone number…' : 'Search by username…'}
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-accent/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="px-6 pb-6 max-h-72 overflow-y-auto mt-2">
          <AnimatePresence mode="popLayout">
            {query.length > 0 && !isSearching && results.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground"
              >
                <UserPlus size={28} className="opacity-30" />
                <p className="text-sm">No users found for "{query}"</p>
                <p className="text-xs opacity-70">Try a different username or phone number</p>
              </motion.div>
            )}

            {query.length === 0 && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  {method === 'phone' ? <Phone size={20} className="text-primary" /> : <AtSign size={20} className="text-primary" />}
                </div>
                <p className="text-sm font-medium text-foreground">Find people on the app</p>
                <p className="text-xs">
                  {method === 'phone' ? 'Enter a phone number to search' : 'Type a username to get started'}
                </p>
              </motion.div>
            )}

            {results.map(u => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border mb-2"
              >
                <Avatar src={u.avatar} name={u.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.username ? `@${u.username}` : u.phone}
                  </p>
                  {errorMap[u.id] && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                      <AlertCircle size={10} /> {errorMap[u.id]}
                    </p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.93 }}
                  disabled={loadingIds.includes(u.id) || addedIds.includes(u.id)}
                  onClick={() => handleAdd(u)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 min-w-[68px] justify-center',
                    addedIds.includes(u.id)
                      ? 'bg-green-500/10 text-green-600 border border-green-500/30 cursor-default'
                      : loadingIds.includes(u.id)
                      ? 'bg-primary/10 text-primary border border-primary/20 cursor-wait'
                      : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
                  )}
                >
                  {addedIds.includes(u.id) ? (
                    <><Check size={12} /> Added</>
                  ) : loadingIds.includes(u.id) ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <><UserPlus size={12} /> Add</>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
