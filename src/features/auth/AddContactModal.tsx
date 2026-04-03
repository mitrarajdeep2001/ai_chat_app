'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Phone, AtSign, QrCode, Search, UserPlus, Check } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import { users } from '@/data/users';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

type AddMethod = 'username' | 'phone' | 'qr';

export default function AddContactModal() {
  const { setShowAddContact } = useApp();
  const [method, setMethod] = useState<AddMethod>('username');
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<string[]>([]);

  const filteredUsers = users.filter(u =>
    query.length > 0 && (
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.phone.includes(query)
    )
  );

  const handleAdd = (userId: string) => {
    setAdded(prev => [...prev, userId]);
    setTimeout(() => {
      setAdded(prev => prev.filter(id => id !== userId));
    }, 2000);
  };

  const methods: { id: AddMethod; icon: React.ElementType; label: string }[] = [
    { id: 'username', icon: AtSign, label: 'Username' },
    { id: 'phone', icon: Phone, label: 'Phone' },
    { id: 'qr', icon: QrCode, label: 'QR Code' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-background rounded-3xl shadow-modal border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
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
              onClick={() => setMethod(id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-sm',
                method === id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              )}
            >
              <Icon size={18} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {method === 'qr' ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-48 h-48 bg-accent rounded-2xl flex items-center justify-center border-2 border-dashed border-border relative overflow-hidden">
                {/* Mock QR Code */}
                <div className="grid grid-cols-8 gap-0.5 p-4">
                  {[1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,0,1,1,0,1,0,0,1,0,1,0,1,1,0,1,1,0,0,1,0,1,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,0,0,1,0,1,1,0,1,0].map((v, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-3 h-3 rounded-sm',
                        v ? 'bg-foreground' : 'bg-transparent'
                      )}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-xs">NC</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Share your QR code or scan someone's to add them instantly
              </p>
              <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Scan QR Code
              </button>
            </div>
          ) : (
            <>
              {/* Search Input */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={method === 'phone' ? 'tel' : 'text'}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={method === 'phone' ? 'Enter phone number...' : 'Search by username...'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-accent/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Results */}
              {query.length > 0 && (
                <div className="space-y-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border"
                      >
                        <Avatar src={user.avatar} name={user.name} size="sm" showStatus status={user.status} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAdd(user.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
                            added.includes(user.id)
                              ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                              : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
                          )}
                        >
                          {added.includes(user.id) ? <><Check size={12} /> Added</> : <><UserPlus size={12} /> Add</>}
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserPlus size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No users found</p>
                    </div>
                  )}
                </div>
              )}

              {query.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    {method === 'phone' ? <Phone size={20} className="text-primary" /> : <AtSign size={20} className="text-primary" />}
                  </div>
                  <p className="text-sm font-medium">Find your contacts</p>
                  <p className="text-xs text-muted-foreground">
                    {method === 'phone'
                      ? 'Enter a phone number to search'
                      : 'Type a username to get started'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
