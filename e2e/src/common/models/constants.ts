/** Domain constants mirrored from the frontend (`frontend/src/api/types.ts`). */

export type TicketType = 'bug' | 'feature' | 'fix';

export type TicketState =
  | 'new'
  | 'ready_for_implementation'
  | 'in_progress'
  | 'ready_for_acceptance'
  | 'done';

export const TICKET_TYPES: readonly TicketType[] = ['bug', 'feature', 'fix'];

/** Named ticket types, so specs reference `TICKET_TYPE.BUG` instead of a raw string. */
export const TICKET_TYPE = {
  BUG: 'bug',
  FEATURE: 'feature',
  FIX: 'fix',
} as const satisfies Record<string, TicketType>;

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

/** Named board-column states, so specs reference `TICKET_STATE.NEW` instead of a raw string. */
export const TICKET_STATE = {
  NEW: 'new',
  READY_FOR_IMPLEMENTATION: 'ready_for_implementation',
  IN_PROGRESS: 'in_progress',
  READY_FOR_ACCEPTANCE: 'ready_for_acceptance',
  DONE: 'done',
} as const satisfies Record<string, TicketState>;
