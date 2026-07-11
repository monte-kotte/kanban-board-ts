import { useMemo, useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTeams } from '../api/teams';
import { useEpics } from '../api/epics';
import { useTickets, useUpdateTicket } from '../api/tickets';
import { TICKET_STATES, TICKET_TYPES } from '../api/types';
import type { Ticket, TicketState } from '../api/types';
import { Column } from '../components/board/Column';

export function BoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const teamId = searchParams.get('team') ?? '';
  const type = searchParams.get('type') ?? '';
  const epicId = searchParams.get('epic') ?? '';
  const search = searchParams.get('search') ?? '';

  const { data: teams } = useTeams();
  const { data: epics } = useEpics(teamId || undefined);
  const { data: tickets, isLoading } = useTickets(teamId, {});
  const updateTicket = useUpdateTicket();
  const queryClient = useQueryClient();

  const [dragError, setDragError] = useState<string | null>(null);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter((ticket) => {
      if (type && ticket.type !== type) return false;
      if (epicId && ticket.epicId !== epicId) return false;
      if (search && !ticket.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tickets, type, epicId, search]);

  const ticketsByState = useMemo(() => {
    const grouped: Record<TicketState, Ticket[]> = {
      new: [],
      ready_for_implementation: [],
      in_progress: [],
      ready_for_acceptance: [],
      done: [],
    };
    for (const ticket of filteredTickets) {
      grouped[ticket.state].push(ticket);
    }
    return grouped;
  }, [filteredTickets]);

  function handleDragEnd(event: DragEndEvent) {
    const ticketId = event.active.id as string;
    const newState = event.over?.id as TicketState | undefined;
    if (!newState || !tickets) return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.state === newState) return;

    setDragError(null);
    const queryKey = ['tickets', teamId, {}];
    const previous = queryClient.getQueryData<Ticket[]>(queryKey);

    queryClient.setQueryData<Ticket[]>(queryKey, (old) =>
      old?.map((t) => (t.id === ticketId ? { ...t, state: newState } : t)),
    );

    updateTicket.mutate(
      { id: ticketId, data: { state: newState } },
      {
        onError: () => {
          queryClient.setQueryData(queryKey, previous);
          setDragError('Failed to move the ticket. It has been moved back.');
        },
      },
    );
  }

  return (
    <div className="page board-page">
      <div className="board-toolbar">
        <label>
          Team
          <select value={teamId} onChange={(e) => updateParam('team', e.target.value)}>
            <option value="">Select a team</option>
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        {teamId && (
          <>
            <label>
              Type
              <select value={type} onChange={(e) => updateParam('type', e.target.value)}>
                <option value="">All types</option>
                {TICKET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Epic
              <select value={epicId} onChange={(e) => updateParam('epic', e.target.value)}>
                <option value="">All epics</option>
                {epics?.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Search
              <input
                type="text"
                placeholder="Search by title"
                value={search}
                onChange={(e) => updateParam('search', e.target.value)}
              />
            </label>

            <Link to={`/tickets/new?team=${teamId}`} className="button-link">
              + New ticket
            </Link>
          </>
        )}
      </div>

      {dragError && <p className="form-error">{dragError}</p>}

      {!teamId ? (
        <p className="empty-state">Select a team to see its board.</p>
      ) : isLoading ? (
        <p>Loading tickets...</p>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="board-columns">
            {TICKET_STATES.map((state) => (
              <Column key={state} state={state} tickets={ticketsByState[state]} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
