import { useDroppable } from '@dnd-kit/core';
import type { Ticket, TicketState } from '../../api/types';
import { TICKET_STATE_LABELS } from '../../api/types';
import { TicketCard } from './TicketCard';

export function Column({ state, tickets }: { state: TicketState; tickets: Ticket[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: state });

  return (
    <div ref={setNodeRef} className={`board-column${isOver ? ' is-over' : ''}`}>
      <h2>
        {TICKET_STATE_LABELS[state]} <span className="column-count">{tickets.length}</span>
      </h2>
      <div className="board-column-cards">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
