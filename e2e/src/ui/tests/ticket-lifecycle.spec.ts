import { test } from '../fixtures/test-fixtures';
import { TeamBuilder, TicketBuilder, UserBuilder } from '../../common/builders';

/**
 * End-to-end happy path spanning the core domain:
 * sign up -> log in -> create a team -> create a ticket on the board ->
 * open the ticket and comment on it.
 *
 * Uses freshly-built, unique data so it is safe to run repeatedly against a
 * shared database and in parallel with other specs.
 */
test.describe('Ticket lifecycle', () => {
  test('a new user can sign up, create a team, add a ticket, and comment on it', async ({
    authSteps,
    teamSteps,
    ticketSteps,
    boardPage,
    ticketPage,
  }) => {
    const user = new UserBuilder().build();
    const team = new TeamBuilder().build();
    const ticket = new TicketBuilder().withTeam(team.name).withType('bug').build();

    await test.step('Sign up and log in', async () => {
      await authSteps.signUpAndLogin(user);
    });

    await test.step('Create a team', async () => {
      await teamSteps.createTeam(team);
    });

    await test.step('Create a ticket and confirm it lands in the "New" column', async () => {
      await ticketSteps.createTicket(ticket);
      await boardPage.expectCardInColumn('new', ticket.title);
    });

    await test.step('Open the ticket and add a comment', async () => {
      await boardPage.openTicket(ticket.title);
      await ticketPage.expectOpen();
      await ticketPage.expectNoComments();
      await ticketPage.addComment('Reproduced on the latest build — investigating.');
      await ticketPage.expectComment('Reproduced on the latest build — investigating.');
    });
  });
});
