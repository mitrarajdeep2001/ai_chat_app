'use client';

import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/format';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  status?: string;
}

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const statusSizeMap = {
  xs: 'w-2 h-2 -bottom-0 -right-0',
  sm: 'w-2.5 h-2.5 bottom-0 right-0',
  md: 'w-3 h-3 bottom-0 right-0',
  lg: 'w-3.5 h-3.5 bottom-0.5 right-0.5',
  xl: 'w-4 h-4 bottom-1 right-1',
};

const statusColorMap: Record<string, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400',
};

export default function Avatar({ src, name, size = 'md', className, showStatus, status }: AvatarProps) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div className={cn('rounded-full overflow-hidden flex items-center justify-center', sizeMap[size])}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center font-semibold text-white',
            'bg-gradient-to-br from-violet-500 to-indigo-600'
          )}>
            {getInitials(name)}
          </div>
        )}
      </div>
      {showStatus && status && (
        <span className={cn(
          'absolute border-2 border-background rounded-full',
          statusSizeMap[size],
          statusColorMap[status] || 'bg-gray-400'
        )} />
      )}
    </div>
  );
}
