import type { TicketState, TicketType } from './constants';

/** A ticket as filled into the create/edit ticket form. */
export interface TicketModel {
  /** Name of the team the ticket belongs to (selected in the form). */
  teamName: string;
  /** Title of the epic to link, or undefined for "No epic". */
  epicTitle?: string;
  type: TicketType;
  title: string;
  body: string;
  /** Only settable when editing an existing ticket. */
  state?: TicketState;
}
