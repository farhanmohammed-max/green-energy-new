import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  generateBookingCode,
  getJakartaYearMonth,
  sanitizeSearchTerm,
} from '@/lib/utils';
import type {
  BookingInsertPayload,
  BookingStatus,
  BookingWithService,
  CustomerBooking,
  PreferredTime,
} from '@/types/database';

export const bookingKeys = {
  all: ['bookings'] as const,
  myList: (userId: string) => [...bookingKeys.all, 'mine', userId] as const,
  adminList: (params: AdminBookingFilterParams) => [...bookingKeys.all, 'admin', params] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
  dashboard: () => [...bookingKeys.all, 'dashboard'] as const,
};

export interface CreateBookingInput {
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_location: string;
  preferred_date: string | null;
  preferred_time: PreferredTime | null;
  customer_message: string | null;
  user_id: string | null;
}

/**
 * Membuat pemesanan baru secara aman untuk anon maupun authenticated user.
 * - Kode pemesanan dihasilkan sebelum INSERT dengan crypto.randomUUID().
 * - Hanya mengirim 10 kolom yang memiliki GRANT INSERT pada SUPABASE_SCHEMA.sql.
 * - TIDAK memanggil .select() agar pengunjung anon tidak terkena error RLS SELECT.
 * - Jika terjadi konflik kode unik (23505), buat kode baru dan ulangi sekali.
 */
export async function createBooking(input: CreateBookingInput): Promise<{ bookingCode: string }> {
  assertSupabaseConfigured();

  const attemptInsert = async (bookingCode: string) => {
    const payload: BookingInsertPayload = {
      booking_code: bookingCode,
      user_id: input.user_id,
      service_id: input.service_id,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone,
      project_location: input.project_location,
      preferred_date: input.preferred_date || null,
      preferred_time: input.preferred_time || null,
      customer_message: input.customer_message?.trim() ? input.customer_message.trim() : null,
    };

    const { error } = await supabase.from('bookings').insert(payload);
    return error;
  };

  let bookingCode = generateBookingCode();
  let error = await attemptInsert(bookingCode);

  if (error && error.code === '23505') {
    bookingCode = generateBookingCode();
    error = await attemptInsert(bookingCode);
  }

  if (error) {
    throw error;
  }

  return { bookingCode };
}

/**
 * Mengambil riwayat pemesanan milik pelanggan yang sedang login.
 * Secara eksplisit TIDAK mengambil kolom `admin_notes`.
 */
export async function fetchMyBookings(userId: string): Promise<CustomerBooking[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, booking_code, service_id, customer_name, customer_email, customer_phone, project_location, preferred_date, preferred_time, customer_message, status, agreed_date, estimated_cost, created_at, updated_at, services(id, name, slug)',
    )
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as CustomerBooking[];
}

export interface AdminBookingFilterParams {
  search?: string;
  status?: BookingStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  archiveFilter?: 'active' | 'archived' | 'all';
  page: number;
  pageSize: number;
}

export interface PaginatedBookingsResult {
  items: BookingWithService[];
  total: number;
}

export async function fetchAdminBookings(
  params: AdminBookingFilterParams,
): Promise<PaginatedBookingsResult> {
  assertSupabaseConfigured();

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from('bookings')
    .select('*, services(id, name, slug)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.archiveFilter === 'archived') {
    query = query.not('archived_at', 'is', null);
  } else if (params.archiveFilter !== 'all') {
    query = query.is('archived_at', null);
  }

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params.dateFrom) {
    query = query.gte('created_at', `${params.dateFrom}T00:00:00+07:00`);
  }
  if (params.dateTo) {
    query = query.lte('created_at', `${params.dateTo}T23:59:59+07:00`);
  }

  if (params.search?.trim()) {
    const term = sanitizeSearchTerm(params.search);
    if (term) {
      query = query.or(
        `booking_code.ilike.%${term}%,customer_name.ilike.%${term}%,customer_email.ilike.%${term}%,customer_phone.ilike.%${term}%`,
      );
    }
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    items: (data ?? []) as unknown as BookingWithService[],
    total: count ?? 0,
  };
}

export async function fetchAdminBookingById(id: string): Promise<BookingWithService | null> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(id, name, slug)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as BookingWithService | null;
}

export interface AdminBookingUpdatePayload {
  status?: BookingStatus;
  agreed_date?: string | null;
  estimated_cost?: number | null;
  admin_notes?: string | null;
  archived_at?: string | null;
}

export async function updateAdminBooking(
  id: string,
  payload: AdminBookingUpdatePayload,
): Promise<BookingWithService> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('bookings')
    .update(payload)
    .eq('id', id)
    .select('*, services(id, name, slug)')
    .single();
  if (error) throw error;
  return data as unknown as BookingWithService;
}

export async function deleteAdminBooking(id: string): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw error;
}

export interface DashboardSummaryData {
  total: number;
  byStatus: Record<BookingStatus, number>;
  recentBookings: BookingWithService[];
  monthlyTrend: { label: string; count: number }[];
  unreadMessagesCount: number;
  activeServicesCount: number;
  publishedTestimonialsCount: number;
}

export async function fetchDashboardSummary(): Promise<DashboardSummaryData> {
  assertSupabaseConfigured();

  const [bookingsRes, recentRes, messagesRes, servicesRes, testimonialsRes] = await Promise.all([
    supabase.from('bookings').select('id, status, created_at').is('archived_at', null),
    supabase
      .from('bookings')
      .select('*, services(id, name, slug)')
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new'),
    supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('testimonials')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true),
  ]);

  if (bookingsRes.error) throw bookingsRes.error;
  if (recentRes.error) throw recentRes.error;
  if (messagesRes.error) throw messagesRes.error;
  if (servicesRes.error) throw servicesRes.error;
  if (testimonialsRes.error) throw testimonialsRes.error;

  const rows = (bookingsRes.data ?? []) as { id: string; status: BookingStatus; created_at: string }[];

  const byStatus: Record<BookingStatus, number> = {
    pending: 0,
    contacted: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  };

  for (const row of rows) {
    if (row.status in byStatus) {
      byStatus[row.status] += 1;
    }
  }

  // Hitung tren 6 bulan terakhir berdasarkan data nyata dari database mengikuti zona waktu Asia/Jakarta
  const currentJakartaYM = getJakartaYearMonth(new Date()) ?? '2026-01';
  const [baseYear, baseMonth] = currentJakartaYM.split('-').map(Number);
  const monthBuckets: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    // Gunakan tanggal 15 UTC tengah hari agar tidak bergeser hari/bulan saat diformat ke Asia/Jakarta
    const d = new Date(Date.UTC(baseYear, baseMonth - 1 - i, 15, 12, 0, 0));
    const key = getJakartaYearMonth(d) ?? '';
    const label = new Intl.DateTimeFormat('id-ID', {
      month: 'short',
      year: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(d);
    monthBuckets.push({ key, label, count: 0 });
  }

  const bucketMap = new Map(monthBuckets.map((b) => [b.key, b]));
  for (const row of rows) {
    const key = getJakartaYearMonth(row.created_at);
    if (key) {
      const bucket = bucketMap.get(key);
      if (bucket) {
        bucket.count += 1;
      }
    }
  }

  return {
    total: rows.length,
    byStatus,
    recentBookings: (recentRes.data ?? []) as unknown as BookingWithService[],
    monthlyTrend: monthBuckets.map(({ label, count }) => ({ label, count })),
    unreadMessagesCount: messagesRes.count ?? 0,
    activeServicesCount: servicesRes.count ?? 0,
    publishedTestimonialsCount: testimonialsRes.count ?? 0,
  };
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useMyBookings(userId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.myList(userId ?? ''),
    queryFn: () => fetchMyBookings(userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useAdminBookings(params: AdminBookingFilterParams) {
  return useQuery({
    queryKey: bookingKeys.adminList(params),
    queryFn: () => fetchAdminBookings(params),
  });
}

export function useAdminBookingById(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => fetchAdminBookingById(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useUpdateAdminBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminBookingUpdatePayload }) =>
      updateAdminBooking(id, payload),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: bookingKeys.all });
      void qc.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAdminBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminBooking,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: bookingKeys.dashboard(),
    queryFn: fetchDashboardSummary,
  });
}
