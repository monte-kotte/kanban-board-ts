import { test as base } from '@playwright/test';
import {
  BoardPage,
  LayoutPage,
  LoginPage,
  SignupPage,
  TeamsPage,
  TicketPage,
} from '../pages';
import { AuthSteps, TeamSteps, TicketSteps } from '../steps';

/** Page objects and step objects injected into every test. */
interface Fixtures {
  loginPage: LoginPage;
  signupPage: SignupPage;
  layoutPage: LayoutPage;
  teamsPage: TeamsPage;
  boardPage: BoardPage;
  ticketPage: TicketPage;
  authSteps: AuthSteps;
  teamSteps: TeamSteps;
  ticketSteps: TicketSteps;
}

export const test = base.extend<Fixtures>({
  // --- Page objects ---
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  layoutPage: async ({ page }, use) => use(new LayoutPage(page)),
  teamsPage: async ({ page }, use) => use(new TeamsPage(page)),
  boardPage: async ({ page }, use) => use(new BoardPage(page)),
  ticketPage: async ({ page }, use) => use(new TicketPage(page)),

  // --- Step objects (composed from the page objects above) ---
  authSteps: async ({ signupPage, loginPage, layoutPage }, use) =>
    use(new AuthSteps(signupPage, loginPage, layoutPage)),
  teamSteps: async ({ teamsPage, layoutPage }, use) =>
    use(new TeamSteps(teamsPage, layoutPage)),
  ticketSteps: async ({ boardPage, ticketPage }, use) =>
    use(new TicketSteps(boardPage, ticketPage)),
});

export { expect } from '@playwright/test';
