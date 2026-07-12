import { test, expect } from '../fixtures/test-fixtures';
import { TeamBuilder, UserBuilder } from '../../common/builders';
import { EpicRequestBuilder, TicketRequestBuilder } from '../builders';
import { HTTP_STATUS } from '../constants';
import type { EpicResponse, TeamResponse, TicketResponse } from '../models';

test.describe('Referential integrity', () => {
  test('deletions are blocked while referenced, then succeed in dependency order', async ({
    authClient,
    teamsClient,
    epicsClient,
    ticketsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const epic = (await epicsClient.create(new EpicRequestBuilder(team.id).build())).body as EpicResponse;
    const ticket = (
      await ticketsClient.create(new TicketRequestBuilder(team.id).withEpic(epic.id).build())
    ).body as TicketResponse;

    await test.step('epic cannot be deleted while it has a ticket', async () => {
      expect((await epicsClient.delete(epic.id)).status).toBe(HTTP_STATUS.CONFLICT);
    });

    await test.step('team cannot be deleted while it has an epic and a ticket', async () => {
      expect((await teamsClient.delete(team.id)).status).toBe(HTTP_STATUS.CONFLICT);
    });

    await test.step('deleting in dependency order succeeds', async () => {
      expect((await ticketsClient.delete(ticket.id)).status).toBe(HTTP_STATUS.NO_CONTENT);
      expect((await epicsClient.delete(epic.id)).status).toBe(HTTP_STATUS.NO_CONTENT);
      expect((await teamsClient.delete(team.id)).status).toBe(HTTP_STATUS.NO_CONTENT);
    });
  });
});
