import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Comment } from './types';

export function useComments(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['comments', ticketId],
    queryFn: () => api.get<Comment[]>(`/tickets/${ticketId}/comments`),
    enabled: Boolean(ticketId),
  });
}

export function useCreateComment(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post<Comment>(`/tickets/${ticketId}/comments`, { body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', ticketId] }),
  });
}
