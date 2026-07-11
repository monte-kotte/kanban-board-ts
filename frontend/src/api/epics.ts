import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Epic } from './types';

export function useEpics(teamId?: string) {
  return useQuery({
    queryKey: ['epics', teamId],
    queryFn: () => api.get<Epic[]>(`/epics${teamId ? `?teamId=${teamId}` : ''}`),
    enabled: teamId !== undefined,
  });
}

export function useCreateEpic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { teamId: string; title: string; description?: string }) =>
      api.post<Epic>('/epics', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['epics'] }),
  });
}

export function useUpdateEpic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; description?: string }) =>
      api.patch<Epic>(`/epics/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['epics'] }),
  });
}

export function useDeleteEpic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/epics/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['epics'] }),
  });
}
