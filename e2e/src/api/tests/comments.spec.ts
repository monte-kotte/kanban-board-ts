import { test, expect } from '../fixtures/test-fixtures';
import { CommentBuilder, TeamBuilder, UserBuilder } from '../../common/builders';
import { TicketRequestBuilder } from '../builders';
import { HTTP_STATUS, NON_EXISTENT_ID } from '../constants';
import type { CommentResponse, TeamResponse, TicketResponse } from '../models';

test.describe('Comments API', () => {
  test('adds a comment to a ticket and lists it', async ({
    authClient,
    teamsClient,
    ticketsClient,
    commentsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const ticket = (await ticketsClient.create(new TicketRequestBuilder(team.id).build()))
      .body as TicketResponse;
    const comment = new CommentBuilder().build();

    const createResult = await commentsClient.create(ticket.id, comment);

    expect(createResult.status).toBe(HTTP_STATUS.CREATED);
    const created = createResult.body as CommentResponse;
    expect(created.body).toBe(comment.body);
    expect(created.author.email).toBeTruthy();

    const listResult = await commentsClient.list(ticket.id);
    const comments = listResult.body as CommentResponse[];
    expect(comments.map((c) => c.id)).toContain(created.id);
  });

  test('adding a comment does not bump the ticket updatedAt', async ({
    authClient,
    teamsClient,
    ticketsClient,
    commentsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const ticket = (await ticketsClient.create(new TicketRequestBuilder(team.id).build()))
      .body as TicketResponse;

    await commentsClient.create(ticket.id, new CommentBuilder().build());

    const refetched = (await ticketsClient.get(ticket.id)).body as TicketResponse;
    expect(refetched.updatedAt).toBe(ticket.updatedAt);
  });

  test('commenting on a non-existent ticket returns 404', async ({ authClient, commentsClient }) => {
    await authClient.signupAndLogin(new UserBuilder().build());

    const result = await commentsClient.create(NON_EXISTENT_ID, new CommentBuilder().build());

    expect(result.status).toBe(HTTP_STATUS.NOT_FOUND);
  });
});
