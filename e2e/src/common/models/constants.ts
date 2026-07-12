/** Domain constants mirrored from the frontend (`frontend/src/api/types.ts`). */

export type TicketType = 'bug' | 'feature' | 'fix';

export type TicketState =
  | 'new'
  | 'ready_for_implementation'
  | 'in_progress'
  | 'ready_for_acceptance'
  | 'done';

export const TICKET_TYPES: readonly TicketType[] = ['bug', 'feature', 'fix'];

export const TICKET_STATES: readonly TicketState[] = [
  'new',
  'ready_for_implementation',
  'in_progress',
  'ready_for_acceptance',
  'done',
];

/** Human-readable column headings shown on the board, keyed by state. */
export const TICKET_STATE_LABELS: Record<TicketState, string> = {
  new: 'New',
  ready_for_implementation: 'Ready for implementation',
  in_progress: 'In progress',
  ready_for_acceptance: 'Ready for acceptance',
  done: 'Done',
};
