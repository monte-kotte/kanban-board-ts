import { test, expect } from '../fixtures/test-fixtures';
import { TeamBuilder, UserBuilder } from '../../common/builders';
import { TicketRequestBuilder } from '../builders';
import { TICKET_STATE, TICKET_TYPE } from '../../common/models';
import { HTTP_STATUS, NON_EXISTENT_ID } from '../constants';
import type { TeamResponse, TicketResponse } from '../models';

test.describe('Tickets API', () => {
  test('creates a ticket with createdBy and epic populated on the response', async ({
    authClient,
    teamsClient,
    ticketsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const ticket = TicketRequestBuilder.bug(team.id).build();

    const result = await ticketsClient.create(ticket);

    expect(result.status).toBe(HTTP_STATUS.CREATED);
    const body = result.body as TicketResponse;
    expect(body.title).toBe(ticket.title);
    expect(body.type).toBe(TICKET_TYPE.BUG);
    expect(body.state).toBe(TICKET_STATE.NEW);
    expect(body.createdBy.email).toBeTruthy();
    expect(body.epic).toBeNull();
  });

  test('filtering by type returns only matching tickets', async ({
    authClient,
    teamsClient,
    ticketsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const bug = (await ticketsClient.create(TicketRequestBuilder.bug(team.id).build()))
      .body as TicketResponse;
    const feature = (
      await ticketsClient.create(new TicketRequestBuilder(team.id).withType(TICKET_TYPE.FEATURE).build())
    ).body as TicketResponse;

    const result = await ticketsClient.list({ teamId: team.id, type: TICKET_TYPE.BUG });

    const ids = (result.body as TicketResponse[]).map((t) => t.id);
    expect(ids).toContain(bug.id);
    expect(ids).not.toContain(feature.id);
  });

  test('updating a ticket only changes provided fields and bumps updatedAt', async ({
    authClient,
    teamsClient,
    ticketsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const created = (await ticketsClient.create(new TicketRequestBuilder(team.id).build()))
      .body as TicketResponse;

    const result = await ticketsClient.update(created.id, { state: TICKET_STATE.IN_PROGRESS });

    expect(result.status).toBe(HTTP_STATUS.OK);
    const updated = result.body as TicketResponse;
    expect(updated.state).toBe(TICKET_STATE.IN_PROGRESS);
    expect(updated.title).toBe(created.title);
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.updatedAt).getTime(),
    );
  });

  test('saving without changes does not bump updatedAt', async ({
    authClient,
    teamsClient,
    ticketsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const created = (await ticketsClient.create(new TicketRequestBuilder(team.id).build()))
      .body as TicketResponse;

    const result = await ticketsClient.update(created.id, { title: created.title });

    expect((result.body as TicketResponse).updatedAt).toBe(created.updatedAt);
  });

  test('creating a ticket for a non-existent team returns 404', async ({ authClient, ticketsClient }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const ticket = new TicketRequestBuilder(NON_EXISTENT_ID).build();

    const result = await ticketsClient.create(ticket);

    expect(result.status).toBe(HTTP_STATUS.NOT_FOUND);
  });
});
