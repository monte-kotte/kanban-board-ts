import type { TicketState, TicketType } from '../../common/models';

export interface CreateTicketRequest {
  teamId: string;
  epicId?: string;
  type: TicketType;
  state?: TicketState;
  title: string;
  body: string;
}

export interface UpdateTicketRequest {
  teamId?: string;
  epicId?: string | null;
  type?: TicketType;
  state?: TicketState;
  title?: string;
  body?: string;
}

export interface TicketQuery {
  teamId: string;
  type?: TicketType;
  epicId?: string;
  search?: string;
}

export interface TicketResponse {
  id: string;
  teamId: string;
  epicId: string | null;
  epic: { id: string; title: string } | null;
  type: TicketType;
  state: TicketState;
  title: string;
  body: string;
  createdById: string;
  createdBy: { id: string; email: string };
  createdAt: string;
  updatedAt: string;
}
