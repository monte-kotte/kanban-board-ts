import { test } from '../fixtures/test-fixtures';
import { TeamBuilder, TicketBuilder, UserBuilder } from '../../common/builders';

test.describe('Ticket comments', () => {
  test('an empty comment cannot be submitted', async ({
    authSteps,
    teamSteps,
    ticketSteps,
    boardPage,
    ticketPage,
  }) => {
    const user = new UserBuilder().build();
    const team = new TeamBuilder().build();
    const ticket = TicketBuilder.bug(team.name).build();

    await test.step('Sign up, log in, create a team and a ticket', async () => {
      await authSteps.signUpAndLogin(user);
      await teamSteps.createTeam(team);
      await ticketSteps.createTicket(ticket);
    });

    await test.step('Open the ticket and submit a whitespace-only comment', async () => {
      await boardPage.openTicket(ticket.title);
      await ticketPage.expectOpen();
      await ticketPage.expectNoComments();
      await ticketPage.addComment('   ');
    });

    await test.step('No comment was added', async () => {
      await ticketPage.expectNoComments();
    });
  });
});
