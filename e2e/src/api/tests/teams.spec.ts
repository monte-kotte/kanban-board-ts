import { test, expect } from '../fixtures/test-fixtures';
import { TeamBuilder, UserBuilder } from '../../common/builders';
import { EpicRequestBuilder } from '../builders';
import { HTTP_STATUS } from '../constants';
import type { TeamResponse } from '../models';

test.describe('Teams API', () => {
  test('creates a team and returns it', async ({ authClient, teamsClient }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = new TeamBuilder().build();

    const result = await teamsClient.create(team);

    expect(result.status).toBe(HTTP_STATUS.CREATED);
    const body = result.body as TeamResponse;
    expect(body.name).toBe(team.name);
    expect(body.id).toBeTruthy();
  });

  test('creating a team with a duplicate name (case-insensitive) returns 409', async ({
    authClient,
    teamsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = new TeamBuilder().build();
    await teamsClient.create(team);

    const result = await teamsClient.create({ name: team.name.toUpperCase() });

    expect(result.status).toBe(HTTP_STATUS.CONFLICT);
  });

  test('renames a team', async ({ authClient, teamsClient }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const created = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    const newName = new TeamBuilder().build().name;

    const result = await teamsClient.update(created.id, { name: newName });

    expect(result.status).toBe(HTTP_STATUS.OK);
    expect((result.body as TeamResponse).name).toBe(newName);
  });

  test('deleting a team with no epics or tickets succeeds', async ({ authClient, teamsClient }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const created = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;

    const result = await teamsClient.delete(created.id);

    expect(result.status).toBe(HTTP_STATUS.NO_CONTENT);
    expect((await teamsClient.get(created.id)).status).toBe(HTTP_STATUS.NOT_FOUND);
  });

  test('deleting a team that still has an epic returns 409', async ({
    authClient,
    teamsClient,
    epicsClient,
  }) => {
    await authClient.signupAndLogin(new UserBuilder().build());
    const team = (await teamsClient.create(new TeamBuilder().build())).body as TeamResponse;
    await epicsClient.create(new EpicRequestBuilder(team.id).build());

    const result = await teamsClient.delete(team.id);

    expect(result.status).toBe(HTTP_STATUS.CONFLICT);
  });
});
