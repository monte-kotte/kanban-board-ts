import { useDraggable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import type { Ticket } from '../../api/types';

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 10,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`ticket-card${isDragging ? ' dragging' : ''}`}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <span className={`ticket-type ticket-type-${ticket.type}`}>{ticket.type}</span>
      <p className="ticket-title">{ticket.title}</p>
      {ticket.epic && <span className="ticket-epic">{ticket.epic.title}</span>}
    </div>
  );
}
