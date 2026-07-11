import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamsPage } from './TeamsPage';

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('TeamsPage', () => {
  let teams: Array<{ id: string; name: string; createdAt: string; updatedAt: string }>;

  beforeEach(() => {
    teams = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, options?: RequestInit) => {
        const method = options?.method ?? 'GET';
        if (method === 'GET' && url.includes('/teams')) {
          return jsonResponse(teams);
        }
        if (method === 'POST' && url.includes('/teams')) {
          const body = JSON.parse(options!.body as string);
          const newTeam = {
            id: 'team-1',
            name: body.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          teams = [...teams, newTeam];
          return jsonResponse(newTeam, 201);
        }
        return jsonResponse({ message: 'not found' }, 404);
      }),
    );
  });

  it('creates a team and shows it in the list', async () => {
    const user = userEvent.setup();
    renderWithClient(<TeamsPage />);

    expect(await screen.findByText(/no teams yet/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/new team name/i);
    await user.type(input, 'Platform Team');
    await user.click(screen.getByRole('button', { name: /create team/i }));

    await waitFor(() => {
      expect(screen.getByText('Platform Team')).toBeInTheDocument();
    });
    expect(screen.queryByText(/no teams yet/i)).not.toBeInTheDocument();
  });
});
