import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-plum/50 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-bloom-plum text-white shadow-bloom hover:-translate-y-0.5 hover:bg-[#5340aa]',
        secondary:
          'border border-bloom-plum/15 bg-white text-bloom-ink hover:bg-bloom-cream',
        outline:
          'border border-bloom-teal/30 bg-white/70 text-bloom-ink hover:border-bloom-teal/60 hover:bg-white',
        ghost: 'bg-transparent text-bloom-ink hover:bg-white/70',
      },
      size: {
        default: 'h-12 px-5 text-sm',
        sm: 'h-10 px-4 text-sm',
        lg: 'h-14 px-6 text-base',
        icon: 'h-11 w-11 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, variant, type = 'button', ...props }, ref) => {
    return <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
