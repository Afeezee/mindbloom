import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-[140px] w-full rounded-[1.5rem] border border-bloom-plum/15 bg-white px-4 py-3 text-sm text-bloom-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-bloom-plum/50 focus:ring-2 focus:ring-bloom-plum/20',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
