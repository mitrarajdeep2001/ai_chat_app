'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Search, X, MessageCircle, Trash2, Phone } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

export default function ContactsPage() {
  const { contacts, isFetchingContacts, removeContact, setShowAddContact, setActiveTab, setActiveChatId } = useApp();
  const [query, setQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return contacts;
    const q = query.toLowerCase();
    return contacts.filter(c =>
      c.contactUser.name.toLowerCase().includes(q) ||
      c.contactUser.username.toLowerCase().includes(q) ||
      c.contactUser.phone.includes(q)
    );
  }, [contacts, query]);

  const handleRemove = async (contactId: string) => {
    setRemovingId(contactId);
    try {
      await removeContact(contactId);
    } catch {
      // error handled in context
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold">Contacts</h1>
            {contacts.length > 0 && (
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {contacts.length}
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
          >
            <UserPlus size={15} />
            <span>Add</span>
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search contacts…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-accent/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isFetchingContacts ? (
          <div className="flex flex-col gap-3 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-accent/30 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-muted rounded" />
                  <div className="h-2.5 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full px-8 text-center gap-5 pb-16"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-500/10 flex items-center justify-center shadow-inner">
              <Users size={40} className="text-primary/60" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">No contacts yet</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Add people by their username or phone number to start connecting.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddContact(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-colors"
            >
              <UserPlus size={16} />
              Add your first contact
            </motion.button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Search size={32} className="opacity-30" />
            <p className="text-sm">No contacts match "{query}"</p>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            <AnimatePresence initial={false}>
              {filtered.map(contact => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-accent/50 transition-colors group"
                >
                  <Avatar
                    src={contact.contactUser.avatar}
                    name={contact.contactUser.name}
                    size="md"
                    showStatus
                    status={contact.contactUser.status}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{contact.contactUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.contactUser.username ? `@${contact.contactUser.username}` : contact.contactUser.phone}
                    </p>
                  </div>

                  {/* Actions — visible on hover */}
                  <div className={cn(
                    'flex items-center gap-1.5 transition-opacity',
                    'opacity-0 group-hover:opacity-100'
                  )}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      title="Message"
                      onClick={() => { setActiveTab('chats'); /* TODO: open DM */ }}
                      className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <MessageCircle size={15} />
                    </motion.button>

                    {contact.contactUser.phone && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        title="Call"
                        className="w-8 h-8 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                      >
                        <Phone size={15} />
                      </motion.button>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      disabled={removingId === contact.id}
                      onClick={() => handleRemove(contact.id)}
                      title="Remove contact"
                      className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors disabled:opacity-50"
                    >
                      {removingId === contact.id
                        ? <span className="w-3.5 h-3.5 border-2 border-destructive/40 border-t-destructive rounded-full animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
