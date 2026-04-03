import { UserStatus, MessageStatus } from '@/types';

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatLastSeen(lastSeen: string, status: UserStatus): string {
  if (status === 'online') return 'Online';
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 5) return 'Last seen just now';
  if (diffMins < 60) return `Last seen ${diffMins} min ago`;
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  if (diffDays === 1) return 'Last seen yesterday';
  return `Last seen ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function getStatusColor(status: UserStatus): string {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'away': return 'bg-yellow-500';
    case 'busy': return 'bg-red-500';
    case 'offline': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
}

export function getStatusLabel(status: UserStatus): string {
  switch (status) {
    case 'online': return 'Online';
    case 'away': return 'Away';
    case 'busy': return 'Busy';
    case 'offline': return 'Offline';
    default: return 'Offline';
  }
}

export function getMessageStatusIcon(status: MessageStatus): string {
  switch (status) {
    case 'sending': return '⏳';
    case 'sent': return '✓';
    case 'delivered': return '✓✓';
    case 'seen': return '✓✓';
    default: return '✓';
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function isToday(timestamp: string): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isYesterday(timestamp: string): boolean {
  const date = new Date(timestamp);
  const yesterday = new Date(Date.now() - 86400000);
  return date.toDateString() === yesterday.toDateString();
}

export function formatDateDivider(timestamp: string): string {
  if (isToday(timestamp)) return 'Today';
  if (isYesterday(timestamp)) return 'Yesterday';
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

export function groupMessagesByDate(messages: { timestamp: string }[]): Record<string, typeof messages> {
  return messages.reduce((groups, message) => {
    const key = formatDateDivider(message.timestamp);
    if (!groups[key]) groups[key] = [];
    groups[key].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);
}
