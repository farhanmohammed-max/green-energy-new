import { Leaf, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  inverted?: boolean;
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ inverted = false, compact = false, className }: BrandLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <div
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-xl shadow-sm',
          inverted ? 'bg-white/15 ring-1 ring-white/20' : 'bg-forest-900',
        )}
        aria-hidden="true"
      >
        <Leaf className="h-5 w-5 text-leaf-100" />
        <Sun className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 text-solar-500 fill-solar-500" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <span
            className={cn(
              'block font-display text-base font-extrabold tracking-tight',
              inverted ? 'text-white' : 'text-forest-900',
            )}
          >
            GREEN ENERGY
          </span>
          <span
            className={cn(
              'block text-[11px] font-medium',
              inverted ? 'text-leaf-100/80' : 'text-muted',
            )}
          >
            Hemat Energi untuk Masa Depan
          </span>
        </div>
      )}
    </div>
  );
}
