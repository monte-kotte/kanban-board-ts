import { test } from '../fixtures/test-fixtures';
import { TeamBuilder, TicketBuilder, UserBuilder } from '../../common/builders';

test.describe('Ticket editing', () => {
  test('closing the edit form without saving discards changes', async ({
    authSteps,
    teamSteps,
    ticketSteps,
    boardPage,
    ticketPage,
  }) => {
    const user = new UserBuilder().build();
    const team = new TeamBuilder().build();
    const ticket = TicketBuilder.feature(team.name).build();
    const unsavedTitle = 'An unsaved title change';

    await test.step('Sign up, log in, create a team and a ticket', async () => {
      await authSteps.signUpAndLogin(user);
      await teamSteps.createTeam(team);
      await ticketSteps.createTicket(ticket);
    });

    await test.step('Open the ticket, change its title, and close without saving', async () => {
      await boardPage.openTicket(ticket.title);
      await ticketPage.expectOpen();
      await ticketPage.setTitle(unsavedTitle);
      await ticketPage.close();
    });

    await test.step('The board still shows the original title', async () => {
      await boardPage.expectCardVisible(ticket.title);
      await boardPage.expectCardHidden(unsavedTitle);
    });
  });
});
