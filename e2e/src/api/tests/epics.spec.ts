import { test, expect } from '../fixtures/test-fixtures';
import { TeamBuilder, UserBuilder } from '../../common/builders';
import { EpicRequestBuilder, TicketRequestBuilder } from '../builders';
import { HTTP_STATUS, NON_EXISTENT_ID } from '../constants';
import type { EpicResponse, TeamResponse } from '../models';

test.describe('Epics API', () => {
  test('creates an epic under a team', async ({ authClient, teamsClient, epicsClient }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const epic = new EpicRequestBuilder(team.id).build();

    const result = await epicsClient.create(epic);

    expect(result.status).toBe(HTTP_STATUS.CREATED);
    const body = result.body as EpicResponse;
    expect(body.title).toBe(epic.title);
    expect(body.teamId).toBe(team.id);
  });

  test('creating an epic for a non-existent team returns 404', async ({ authClient, epicsClient }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const epic = new EpicRequestBuilder(NON_EXISTENT_ID).build();

    const result = await epicsClient.create(epic);

    expect(result.status).toBe(HTTP_STATUS.NOT_FOUND);
  });

  test('lists epics scoped to a team', async ({ authClient, teamsClient, epicsClient }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const teamA = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const teamB = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const epicA = (await epicsClient.create(new EpicRequestBuilder(teamA.id).build())).body as EpicResponse;
    await epicsClient.create(new EpicRequestBuilder(teamB.id).build());

    const result = await epicsClient.list(teamA.id);

    expect(result.status).toBe(HTTP_STATUS.OK);
    const epics = result.body as EpicResponse[];
    expect(epics.map((e) => e.id)).toContain(epicA.id);
    expect(epics.every((e) => e.teamId === teamA.id)).toBe(true);
  });

  test('deleting an epic that still has a ticket returns 409', async ({
    authClient,
    teamsClient,
    epicsClient,
    ticketsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const epic = (await epicsClient.create(new EpicRequestBuilder(team.id).build())).body as EpicResponse;
    await ticketsClient.create(new TicketRequestBuilder(team.id).withEpic(epic.id).build());

    const result = await epicsClient.delete(epic.id);

    expect(result.status).toBe(HTTP_STATUS.CONFLICT);
  });
});
