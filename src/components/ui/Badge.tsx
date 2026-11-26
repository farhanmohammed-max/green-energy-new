import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
}

const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-leaf-100 text-forest-900 border-leaf-600/20',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-rose-50 text-rose-800 border-rose-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  accent: 'bg-solar-100 text-forest-950 border-solar-500/40',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
