import { useState } from 'react';
import { useCreateTeam, useDeleteTeam, useTeams, useUpdateTeam } from '../api/teams';
import { ApiError } from '../api/client';
import type { Team } from '../api/types';

export function TeamsPage() {
  const { data: teams, isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createTeam.mutateAsync({ name: newName });
      setNewName('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create team');
    }
  }

  function startEdit(team: Team) {
    setEditingId(team.id);
    setEditingName(team.name);
    setError(null);
  }

  async function handleRename(id: string) {
    setError(null);
    try {
      await updateTeam.mutateAsync({ id, name: editingName });
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to rename team');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this team? This cannot be undone.')) return;
    setError(null);
    try {
      await deleteTeam.mutateAsync(id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete team');
    }
  }

  return (
    <div className="page">
      <h1>Teams</h1>

      <form className="inline-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New team name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit" disabled={createTeam.isPending}>
          Create team
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {isLoading ? (
        <p>Loading teams...</p>
      ) : teams && teams.length > 0 ? (
        <ul className="entity-list">
          {teams.map((team) => (
            <li key={team.id}>
              {editingId === team.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                  <button type="button" onClick={() => handleRename(team.id)}>
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>{team.name}</span>
                  <button type="button" onClick={() => startEdit(team)}>
                    Rename
                  </button>
                  <button type="button" onClick={() => handleDelete(team.id)}>
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No teams yet. Create one above.</p>
      )}
    </div>
  );
}
