import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import { sanitizeSearchTerm } from '@/lib/utils';
import type {
  ContactMessage,
  ContactMessageInsertPayload,
  ContactMessageStatus,
} from '@/types/database';

export const contactMessageKeys = {
  all: ['contact_messages'] as const,
  adminList: (params: AdminContactFilterParams) =>
    [...contactMessageKeys.all, 'admin', params] as const,
};

/**
 * Publik hanya mengirim 5 kolom sesuai GRANT INSERT. Tidak menggunakan .select().
 */
export async function createContactMessage(payload: ContactMessageInsertPayload): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await supabase.from('contact_messages').insert({
    customer_name: payload.customer_name,
    customer_email: payload.customer_email,
    customer_phone: payload.customer_phone?.trim() ? payload.customer_phone.trim() : null,
    subject: payload.subject,
    message: payload.message,
  });
  if (error) throw error;
}

export interface AdminContactFilterParams {
  search?: string;
  status?: ContactMessageStatus | 'all';
  page: number;
  pageSize: number;
}

export async function fetchAdminContactMessages(
  params: AdminContactFilterParams,
): Promise<{ items: ContactMessage[]; total: number }> {
  assertSupabaseConfigured();

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from('contact_messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params.search?.trim()) {
    const term = sanitizeSearchTerm(params.search);
    if (term) {
      query = query.or(
        `customer_name.ilike.%${term}%,customer_email.ilike.%${term}%,subject.ilike.%${term}%`,
      );
    }
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    items: (data ?? []) as ContactMessage[],
    total: count ?? 0,
  };
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus,
): Promise<ContactMessage> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ContactMessage;
}

export async function deleteContactMessage(id: string): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
}

export function useCreateContactMessage() {
  return useMutation({
    mutationFn: createContactMessage,
  });
}

export function useAdminContactMessages(params: AdminContactFilterParams) {
  return useQuery({
    queryKey: contactMessageKeys.adminList(params),
    queryFn: () => fetchAdminContactMessages(params),
  });
}

export function useUpdateContactMessageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessageStatus }) =>
      updateContactMessageStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: contactMessageKeys.all });
      void qc.invalidateQueries({ queryKey: ['bookings', 'dashboard'] });
    },
  });
}

export function useDeleteContactMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: contactMessageKeys.all });
      void qc.invalidateQueries({ queryKey: ['bookings', 'dashboard'] });
    },
  });
}
