/** App routes, mirrored from `frontend/src/App.tsx`. */
export const ROUTES = {
  signup: '/signup',
  login: '/login',
  board: '/',
  teams: '/teams',
  epics: '/epics',
  newTicket: '/tickets/new',
  ticket: (id: string) => `/tickets/${id}`,
} as const;
