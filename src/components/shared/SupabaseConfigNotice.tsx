import { Database, Info } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export function SupabaseConfigNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-950"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 text-xs sm:text-sm">
        <Database className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <p className="flex-1">
          <span className="font-semibold">Konfigurasi Supabase belum terhubung:</span> Salin{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">.env.example</code>{' '}
          menjadi{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">.env.local</code>{' '}
          dan isi{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
            VITE_SUPABASE_URL
          </code>{' '}
          serta{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
            VITE_SUPABASE_PUBLISHABLE_KEY
          </code>
          .
        </p>
        <Info className="hidden sm:block h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
      </div>
    </div>
  );
}
