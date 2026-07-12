import { test } from '../fixtures/test-fixtures';
import { TeamBuilder, TicketBuilder, UserBuilder } from '../../common/builders';
import { TICKET_TYPE } from '../../common/models';

test.describe('Board filters', () => {
  test('filtering by ticket type shows only matching cards', async ({
    authSteps,
    teamSteps,
    ticketSteps,
    boardPage,
  }) => {
    const user = new UserBuilder().build();
    const team = new TeamBuilder().build();
    const bugTicket = TicketBuilder.bug(team.name).build();
    const featureTicket = TicketBuilder.feature(team.name).build();

    await test.step('Sign up, log in, create a team with a bug and a feature ticket', async () => {
      await authSteps.signUpAndLogin(user);
      await teamSteps.createTeam(team);
      await ticketSteps.createTicket(bugTicket);
      await ticketSteps.createTicket(featureTicket);
    });

    await test.step('Filter the board by type "bug"', async () => {
      await boardPage.open();
      await boardPage.selectTeam(team.name);
      await boardPage.filterByType(TICKET_TYPE.BUG);
    });

    await test.step('Only the bug ticket remains visible', async () => {
      await boardPage.expectCardVisible(bugTicket.title);
      await boardPage.expectCardHidden(featureTicket.title);
    });
  });
});
