'use client';

import { MessageStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ReadReceiptProps {
  status: MessageStatus;
  className?: string;
}

export default function ReadReceipt({ status, className }: ReadReceiptProps) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      {status === 'sending' && (
        <svg className="w-3.5 h-3.5 text-white/70" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      )}
      {status === 'sent' && (
        <svg className="w-3.5 h-3.5 text-white/70" viewBox="0 0 16 12" fill="none">
          <path d="M1 6l4 4 9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === 'delivered' && (
        <svg className="w-4 h-3.5 text-white/70" viewBox="0 0 20 12" fill="none">
          <path d="M1 6l4 4 9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 6l4 4 9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === 'seen' && (
        <svg className="w-4 h-3.5 text-sky-300" viewBox="0 0 20 12" fill="none">
          <path d="M1 6l4 4 9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 6l4 4 9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
