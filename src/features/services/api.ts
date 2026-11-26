import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assertSupabaseConfigured, STORAGE_BUCKET, supabase } from '@/lib/supabase';
import { sanitizeSearchTerm } from '@/lib/utils';
import type { ServiceWithCategory } from '@/types/database';

export const serviceKeys = {
  all: ['services'] as const,
  publicList: (filters?: { categoryId?: string; search?: string; featuredOnly?: boolean }) =>
    [...serviceKeys.all, 'public', filters ?? {}] as const,
  detail: (slug: string) => [...serviceKeys.all, 'detail', slug] as const,
  admin: () => [...serviceKeys.all, 'admin'] as const,
};

const SERVICE_SELECT =
  '*, service_categories(id, name, slug, is_active)';

export async function fetchActiveServices(filters?: {
  categoryId?: string;
  search?: string;
  featuredOnly?: boolean;
}): Promise<ServiceWithCategory[]> {
  assertSupabaseConfigured();
  let query = supabase
    .from('services')
    .select(SERVICE_SELECT)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (filters?.featuredOnly) {
    query = query.eq('is_featured', true);
  }
  if (filters?.categoryId && filters.categoryId !== 'all') {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters?.search?.trim()) {
    const term = sanitizeSearchTerm(filters.search);
    if (term) {
      query = query.or(`name.ilike.%${term}%,short_description.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ServiceWithCategory[];
}

export async function fetchActiveServiceBySlug(slug: string): Promise<ServiceWithCategory | null> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data as ServiceWithCategory | null;
}

export async function fetchAdminServices(): Promise<ServiceWithCategory[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ServiceWithCategory[];
}

export interface ServiceMutationPayload {
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  benefits: string[];
  image_url: string | null;
  price_from: number | null;
  price_note: string;
  estimated_duration: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export async function createService(payload: ServiceMutationPayload): Promise<ServiceWithCategory> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('services')
    .insert(payload)
    .select(SERVICE_SELECT)
    .single();
  if (error) throw error;
  return data as ServiceWithCategory;
}

export async function updateService(
  id: string,
  payload: Partial<ServiceMutationPayload>,
): Promise<ServiceWithCategory> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('services')
    .update(payload)
    .eq('id', id)
    .select(SERVICE_SELECT)
    .single();
  if (error) throw error;
  return data as ServiceWithCategory;
}

export async function deleteService(id: string): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadServiceImage(file: File): Promise<string> {
  assertSupabaseConfigured();

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Format gambar harus JPG, PNG, atau WebP.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Ukuran gambar maksimal 5 MB.');
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const filePath = `services/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export function useActiveServices(filters?: {
  categoryId?: string;
  search?: string;
  featuredOnly?: boolean;
}) {
  return useQuery({
    queryKey: serviceKeys.publicList(filters),
    queryFn: () => fetchActiveServices(filters),
  });
}

export function useActiveServiceBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: serviceKeys.detail(slug ?? ''),
    queryFn: () => fetchActiveServiceBySlug(slug ?? ''),
    enabled: Boolean(slug),
  });
}

export function useAdminServices() {
  return useQuery({
    queryKey: serviceKeys.admin(),
    queryFn: fetchAdminServices,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: serviceKeys.all });
      void qc.invalidateQueries({ queryKey: ['bookings', 'dashboard'] });
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ServiceMutationPayload> }) =>
      updateService(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: serviceKeys.all });
      void qc.invalidateQueries({ queryKey: ['bookings', 'dashboard'] });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: serviceKeys.all });
      void qc.invalidateQueries({ queryKey: ['bookings', 'dashboard'] });
    },
  });
}
