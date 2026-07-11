import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Ticket, TicketState, TicketType } from './types';

export interface TicketFilters {
  type?: TicketType;
  epicId?: string;
  search?: string;
}

function buildQuery(teamId: string, filters: TicketFilters) {
  const params = new URLSearchParams({ teamId });
  if (filters.type) params.set('type', filters.type);
  if (filters.epicId) params.set('epicId', filters.epicId);
  if (filters.search) params.set('search', filters.search);
  return params.toString();
}

export function useTickets(teamId: string, filters: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', teamId, filters],
    queryFn: () => api.get<Ticket[]>(`/tickets?${buildQuery(teamId, filters)}`),
    enabled: Boolean(teamId),
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get<Ticket>(`/tickets/${id}`),
    enabled: Boolean(id),
  });
}

export interface CreateTicketInput {
  teamId: string;
  epicId?: string | null;
  type: TicketType;
  title: string;
  body: string;
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTicketInput) => api.post<Ticket>('/tickets', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export interface UpdateTicketInput {
  teamId?: string;
  epicId?: string | null;
  type?: TicketType;
  state?: TicketState;
  title?: string;
  body?: string;
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) =>
      api.patch<Ticket>(`/tickets/${id}`, data),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.setQueryData(['ticket', ticket.id], ticket);
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tickets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
}
