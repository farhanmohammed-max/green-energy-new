import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { ServiceCategory } from '@/types/database';

export const categoryKeys = {
  all: ['service_categories'] as const,
  active: () => [...categoryKeys.all, 'active'] as const,
  admin: () => [...categoryKeys.all, 'admin'] as const,
};

export async function fetchActiveCategories(): Promise<ServiceCategory[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ServiceCategory[];
}

export async function fetchAdminCategories(): Promise<ServiceCategory[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ServiceCategory[];
}

export interface CategoryMutationPayload {
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export async function createCategory(payload: CategoryMutationPayload): Promise<ServiceCategory> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('service_categories')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as ServiceCategory;
}

export async function updateCategory(
  id: string,
  payload: Partial<CategoryMutationPayload>,
): Promise<ServiceCategory> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('service_categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as ServiceCategory;
}

export async function deleteCategory(id: string): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await supabase.from('service_categories').delete().eq('id', id);
  if (error) throw error;
}

export function useActiveCategories() {
  return useQuery({
    queryKey: categoryKeys.active(),
    queryFn: fetchActiveCategories,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: categoryKeys.admin(),
    queryFn: fetchAdminCategories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryMutationPayload> }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
