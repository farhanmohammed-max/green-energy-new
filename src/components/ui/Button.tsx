import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-forest-900 text-white hover:bg-forest-800 active:bg-forest-950 shadow-sm border border-forest-900',
  secondary:
    'bg-leaf-600 text-white hover:bg-leaf-500 active:bg-forest-700 shadow-sm border border-leaf-600',
  accent:
    'bg-solar-500 text-forest-950 hover:bg-solar-400 active:bg-solar-500 font-semibold shadow-sm border border-solar-500',
  outline:
    'bg-white text-forest-900 border border-forest-900/20 hover:bg-leaf-50 hover:border-forest-900/40',
  ghost: 'bg-transparent text-forest-900 hover:bg-forest-900/5 border border-transparent',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm border border-rose-600',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
