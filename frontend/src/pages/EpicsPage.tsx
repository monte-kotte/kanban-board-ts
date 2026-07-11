import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTeams } from '../api/teams';
import { useCreateEpic, useDeleteEpic, useEpics, useUpdateEpic } from '../api/epics';
import { ApiError } from '../api/client';
import type { Epic } from '../api/types';

export function EpicsPage() {
  const { data: teams } = useTeams();
  const [searchParams, setSearchParams] = useSearchParams();
  const teamId = searchParams.get('team') ?? '';

  const { data: epics, isLoading } = useEpics(teamId || undefined);
  const createEpic = useCreateEpic();
  const updateEpic = useUpdateEpic();
  const deleteEpic = useDeleteEpic();

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  function handleTeamChange(id: string) {
    setSearchParams(id ? { team: id } : {});
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createEpic.mutateAsync({
        teamId,
        title: newTitle,
        description: newDescription || undefined,
      });
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create epic');
    }
  }

  function startEdit(epic: Epic) {
    setEditingId(epic.id);
    setEditingTitle(epic.title);
    setEditingDescription(epic.description ?? '');
    setError(null);
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    try {
      await updateEpic.mutateAsync({
        id,
        title: editingTitle,
        description: editingDescription || undefined,
      });
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update epic');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this epic? This cannot be undone.')) return;
    setError(null);
    try {
      await deleteEpic.mutateAsync(id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete epic');
    }
  }

  return (
    <div className="page">
      <h1>Epics</h1>

      <label>
        Team
        <select value={teamId} onChange={(e) => handleTeamChange(e.target.value)}>
          <option value="">Select a team</option>
          {teams?.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>

      {!teamId ? (
        <p className="empty-state">Select a team to manage its epics.</p>
      ) : (
        <>
          <form className="stacked-form" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Epic title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <button type="submit" disabled={createEpic.isPending}>
              Create epic
            </button>
          </form>

          {error && <p className="form-error">{error}</p>}

          {isLoading ? (
            <p>Loading epics...</p>
          ) : epics && epics.length > 0 ? (
            <ul className="entity-list">
              {epics.map((epic) => (
                <li key={epic.id}>
                  {editingId === epic.id ? (
                    <div className="stacked-form">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                      />
                      <textarea
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                      />
                      <div>
                        <button type="button" onClick={() => handleSaveEdit(epic.id)}>
                          Save
                        </button>
                        <button type="button" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>{epic.title}</strong>
                        {epic.description && <p>{epic.description}</p>}
                      </div>
                      <div>
                        <button type="button" onClick={() => startEdit(epic)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(epic.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No epics yet for this team.</p>
          )}
        </>
      )}
    </div>
  );
}
