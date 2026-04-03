import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Camera, Loader2, Save } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Avatar from '@/components/common/Avatar';

export default function ProfileEditor({ onClose }: { onClose: () => void }) {
  const { user, updateProfile, uploadAvatar } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const publicUrl = await uploadAvatar(file);
      if (publicUrl) {
        await updateProfile({ avatar: publicUrl });
      }
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      // Detailed error for debugging
      const code = err.code || err.statusCode || (err.message?.includes('403') ? '403' : '');
      const details = err.details ? ` (${err.details})` : '';
      const errMsg = `Error [${code}]: ${err.message}${details}`;
      setError(errMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    
    // Basic validation
    if (!formData.name.trim() || !formData.username.trim()) {
      setError('Name and Username are required.');
      setIsSaving(false);
      return;
    }

    try {
      await updateProfile({
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        phone: formData.phone
      });
      onClose();
    } catch (err: any) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background absolute inset-0 z-10">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-card">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">Edit Profile</h1>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={isSaving || isUploading}
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        {/* Avatar Section */}
        <div className="relative mb-8 group">
          <Avatar 
            src={user?.avatar} 
            name={formData.name || 'User'} 
            size="xl" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 disabled:bg-black/60"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {error && (
          <div className="w-full max-w-md p-3 mb-6 bg-destructive/10 text-destructive text-sm font-medium rounded-xl text-center border border-destructive/20">
            {error}
          </div>
        )}

        {/* Form Details */}
        <div className="w-full max-w-md space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground px-1">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground px-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-9 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="username"
              />
            </div>
            <p className="text-xs text-muted-foreground px-1 pt-1 opacity-80">This will be visible to everyone.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground px-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
              placeholder="Write a little bit about yourself..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted-foreground px-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
        
        <div className="h-20" />
      </div>
    </div>
  );
}
