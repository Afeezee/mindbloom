import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div className={cn('inline-flex items-center gap-3 text-sm font-medium text-slate-600', className)} role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-bloom-plum/20 border-t-bloom-plum" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
