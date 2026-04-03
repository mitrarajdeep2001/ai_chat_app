'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showLabel?: boolean;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  online: { color: 'bg-green-500', label: 'Online' },
  away: { color: 'bg-yellow-500', label: 'Away' },
  busy: { color: 'bg-red-500', label: 'Busy' },
  offline: { color: 'bg-gray-400', label: 'Offline' },
};

export default function StatusBadge({ status, className, showLabel = false }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.offline;
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', config.color)} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}
