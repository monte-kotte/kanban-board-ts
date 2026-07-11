import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTeams } from '../api/teams';
import { useEpics } from '../api/epics';
import {
  useCreateTicket,
  useDeleteTicket,
  useTicket,
  useUpdateTicket,
} from '../api/tickets';
import { useComments, useCreateComment } from '../api/comments';
import { ApiError } from '../api/client';
import { TICKET_STATES, TICKET_STATE_LABELS, TICKET_TYPES } from '../api/types';
import type { TicketState, TicketType } from '../api/types';

export function TicketPage({ onClose }: { onClose?: () => void } = {}) {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: teams } = useTeams();
  const { data: existingTicket, isLoading: isLoadingTicket } = useTicket(id);
  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();

  const [teamId, setTeamId] = useState(searchParams.get('team') ?? '');
  const [epicId, setEpicId] = useState('');
  const [type, setType] = useState<TicketType>('feature');
  const [state, setState] = useState<TicketState>('new');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: epics } = useEpics(teamId || undefined);
  const { data: comments } = useComments(id);
  const createComment = useCreateComment(id ?? '');
  const [commentBody, setCommentBody] = useState('');

  useEffect(() => {
    if (existingTicket) {
      setTeamId(existingTicket.teamId);
      setEpicId(existingTicket.epicId ?? '');
      setType(existingTicket.type);
      setState(existingTicket.state);
      setTitle(existingTicket.title);
      setBody(existingTicket.body);
    }
  }, [existingTicket]);

  function handleTeamChange(newTeamId: string) {
    if (newTeamId !== teamId) {
      setEpicId('');
    }
    setTeamId(newTeamId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (isEditMode && id) {
        await updateTicket.mutateAsync({
          id,
          data: { teamId, epicId: epicId || null, type, state, title, body },
        });
        if (onClose) {
          onClose();
        } else {
          navigate(`/?team=${teamId}`);
        }
        return;
      } else {
        await createTicket.mutateAsync({
          teamId,
          epicId: epicId || undefined,
          type,
          title,
          body,
        });
        navigate(`/?team=${teamId}`);
        return;
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save ticket');
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return;
    try {
      await deleteTicket.mutateAsync(id);
      if (onClose) {
        onClose();
      } else {
        navigate(`/?team=${teamId}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete ticket');
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    await createComment.mutateAsync(commentBody);
    setCommentBody('');
  }

  if (isEditMode && isLoadingTicket) {
    return <p>Loading ticket...</p>;
  }

  const isSaving = createTicket.isPending || updateTicket.isPending;

  return (
    <div className="page ticket-page">
      {!onClose && (
        <Link to={teamId ? `/?team=${teamId}` : '/'} className="button-link back-link">
          &larr; Back to board
        </Link>
      )}
      <h1>{isEditMode ? 'Edit ticket' : 'New ticket'}</h1>

      {isEditMode && existingTicket && (
        <div className="ticket-meta">
          <span>ID: {existingTicket.id}</span>
          <span>Created by: {existingTicket.createdBy.email}</span>
          <span>Created: {new Date(existingTicket.createdAt).toLocaleString()}</span>
          <span>Modified: {new Date(existingTicket.updatedAt).toLocaleString()}</span>
        </div>
      )}

      <form className="stacked-form" onSubmit={handleSubmit}>
        <label>
          Team
          <select value={teamId} onChange={(e) => handleTeamChange(e.target.value)} required>
            <option value="">Select a team</option>
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Epic
          <select value={epicId} onChange={(e) => setEpicId(e.target.value)}>
            <option value="">No epic</option>
            {epics?.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as TicketType)} required>
            {TICKET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        {isEditMode && (
          <label>
            State
            <select value={state} onChange={(e) => setState(e.target.value as TicketState)}>
              {TICKET_STATES.map((s) => (
                <option key={s} value={s}>
                  {TICKET_STATE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Body
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={isSaving || !teamId}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          {isEditMode && (
            <>
              <button
                type="button"
                onClick={() => (onClose ? onClose() : navigate(`/?team=${teamId}`))}
              >
                Close
              </button>
              <button type="button" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}
        </div>
      </form>

      {isEditMode && (
        <section className="comments-section">
          <h2>Comments</h2>
          <ul className="comment-list">
            {comments?.map((comment) => (
              <li key={comment.id}>
                <div className="comment-meta">
                  <strong>{comment.author.email}</strong>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p>{comment.body}</p>
              </li>
            ))}
            {comments?.length === 0 && <p className="empty-state">No comments yet.</p>}
          </ul>

          <form className="inline-form" onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder="Add a comment"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <button type="submit" disabled={createComment.isPending}>
              Comment
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
