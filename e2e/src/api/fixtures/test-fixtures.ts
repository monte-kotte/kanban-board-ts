import { test as base } from '@playwright/test';
import { AuthClient, CommentsClient, EpicsClient, TeamsClient, TicketsClient } from '../clients';

/** API clients injected into every test. Playwright's `request` context automatically
 * persists cookies (e.g. the session set by login) across calls within one test. */
interface Fixtures {
  authClient: AuthClient;
  teamsClient: TeamsClient;
  epicsClient: EpicsClient;
  ticketsClient: TicketsClient;
  commentsClient: CommentsClient;
}

export const test = base.extend<Fixtures>({
  authClient: async ({ request }, use) => use(new AuthClient(request)),
  teamsClient: async ({ request }, use) => use(new TeamsClient(request)),
  epicsClient: async ({ request }, use) => use(new EpicsClient(request)),
  ticketsClient: async ({ request }, use) => use(new TicketsClient(request)),
  commentsClient: async ({ request }, use) => use(new CommentsClient(request)),
});

export { expect } from '@playwright/test';
