import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getKRAs, createKRA, updateKRA, deleteKRA, CreateKRAInput } from '@/services/kraService';
import { KRA } from '@/types';

export function useKRAs(employeeId?: string, cycleId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['kras', employeeId, cycleId],
    queryFn: () => getKRAs(employeeId, cycleId),
  });

  return {
    kras: data || [],
    isLoading,
    error,
  };
}

export function useCreateKRA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (kraData: CreateKRAInput) => createKRA(kraData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kras'] });
    },
  });
}

export function useUpdateKRA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, kraData }: { id: string; kraData: Partial<CreateKRAInput> }) =>
      updateKRA(id, kraData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kras'] });
    },
  });
}

export function useDeleteKRA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteKRA(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kras'] });
    },
  });
}