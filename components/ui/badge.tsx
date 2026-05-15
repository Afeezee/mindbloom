import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', {
  variants: {
    variant: {
      plum: 'bg-bloom-plum/12 text-bloom-plum',
      teal: 'bg-bloom-teal/12 text-bloom-teal',
      gold: 'bg-bloom-gold/25 text-bloom-ink',
      coral: 'bg-bloom-coral/16 text-[#a94639]',
      outline: 'border border-bloom-plum/20 bg-white text-slate-600',
    },
  },
  defaultVariants: {
    variant: 'plum',
  },
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
