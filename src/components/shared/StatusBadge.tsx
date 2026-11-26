import { BOOKING_STATUS_CONFIG, CONTACT_STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { BookingStatus, ContactMessageStatus } from '@/types/database';

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = BOOKING_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        config.badgeClass,
      )}
    >
      {config.label}
    </span>
  );
}

export function ContactStatusBadge({ status }: { status: ContactMessageStatus }) {
  const config = CONTACT_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        config.badgeClass,
      )}
    >
      {config.label}
    </span>
  );
}

export function ActiveStatusBadge({ isActive, activeLabel = 'Aktif', inactiveLabel = 'Nonaktif' }: {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        isActive
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-slate-100 text-slate-600 border-slate-200',
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-slate-400')}
        aria-hidden="true"
      />
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}
