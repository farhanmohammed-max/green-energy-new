import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import { sanitizeSearchTerm } from '@/lib/utils';
import type { BookingWithService, CustomerSummary, Profile } from '@/types/database';

export const customerKeys = {
  all: ['customers'] as const,
  list: (params: { search?: string; page: number; pageSize: number }) =>
    [...customerKeys.all, 'list', params] as const,
  bookings: (userId: string) => [...customerKeys.all, 'bookings', userId] as const,
};

export async function fetchAdminCustomers(params: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<{ items: CustomerSummary[]; total: number }> {
  assertSupabaseConfigured();

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.search?.trim()) {
    const term = sanitizeSearchTerm(params.search);
    if (term) {
      query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
    }
  }

  const { data: profilesData, error, count } = await query;
  if (error) throw error;

  const profiles = (profilesData ?? []) as Profile[];

  // Hitung jumlah pemesanan per user_id
  const userIds = profiles.map((p) => p.id);
  const countMap = new Map<string, number>();

  if (userIds.length > 0) {
    const { data: bookingRows } = await supabase
      .from('bookings')
      .select('user_id')
      .in('user_id', userIds);

    for (const row of (bookingRows ?? []) as { user_id: string | null }[]) {
      if (row.user_id) {
        countMap.set(row.user_id, (countMap.get(row.user_id) ?? 0) + 1);
      }
    }
  }

  return {
    items: profiles.map((profile) => ({
      ...profile,
      booking_count: countMap.get(profile.id) ?? 0,
    })),
    total: count ?? 0,
  };
}

export async function fetchCustomerBookingsByAdmin(userId: string): Promise<BookingWithService[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(id, name, slug)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as BookingWithService[];
}

/**
 * Hanya memperbarui full_name dan phone sesuai column-level GRANT pada public.profiles.
 * Role tidak pernah boleh diubah melalui API profil biasa.
 */
export async function updateOwnProfile(
  userId: string,
  payload: { full_name: string; phone: string | null },
): Promise<Profile> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: payload.full_name,
      phone: payload.phone?.trim() ? payload.phone.trim() : null,
    })
    .eq('id', userId)
    .select('id, full_name, email, phone, role, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as Profile;
}

export function useAdminCustomers(params: { search?: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => fetchAdminCustomers(params),
  });
}

export function useCustomerBookingsByAdmin(userId: string | null) {
  return useQuery({
    queryKey: customerKeys.bookings(userId ?? ''),
    queryFn: () => fetchCustomerBookingsByAdmin(userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useUpdateOwnProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: { full_name: string; phone: string | null };
    }) => updateOwnProfile(userId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}
