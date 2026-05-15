import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-2xl border border-bloom-plum/15 bg-white px-4 py-3 text-sm text-bloom-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-bloom-plum/50 focus:ring-2 focus:ring-bloom-plum/20',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
