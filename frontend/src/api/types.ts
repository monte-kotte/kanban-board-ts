export type TicketType = 'bug' | 'feature' | 'fix';

export type TicketState =
  | 'new'
  | 'ready_for_implementation'
  | 'in_progress'
  | 'ready_for_acceptance'
  | 'done';

export const TICKET_STATES: TicketState[] = [
  'new',
  'ready_for_implementation',
  'in_progress',
  'ready_for_acceptance',
  'done',
];

export const TICKET_STATE_LABELS: Record<TicketState, string> = {
  new: 'New',
  ready_for_implementation: 'Ready for implementation',
  in_progress: 'In progress',
  ready_for_acceptance: 'Ready for acceptance',
  done: 'Done',
};

export const TICKET_TYPES: TicketType[] = ['bug', 'feature', 'fix'];

export interface User {
  id: string;
  email: string;
}

export interface Team {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Epic {
  id: string;
  teamId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  teamId: string;
  epicId: string | null;
  epic: { id: string; title: string } | null;
  type: TicketType;
  state: TicketState;
  title: string;
  body: string;
  createdById: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  author: User;
  body: string;
  createdAt: string;
}
