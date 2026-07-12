import { test } from '../fixtures/test-fixtures';
import { TeamBuilder, UserBuilder } from '../../common/builders';

test.describe('Teams management', () => {
  test('team names are unique, case-insensitively', async ({
    authSteps,
    teamSteps,
    teamsPage,
  }) => {
    const user = new UserBuilder().build();
    const team = new TeamBuilder().build();
    const duplicate = new TeamBuilder().withName(team.name.toUpperCase()).build();

    await test.step('Sign up, log in, and create a team', async () => {
      await authSteps.signUpAndLogin(user);
      await teamSteps.createTeam(team);
    });

    await test.step('Attempt to create a team with the same name in a different case', async () => {
      await teamsPage.createTeam(duplicate);
      await teamsPage.expectError();
    });

    await test.step('Only the original team exists', async () => {
      await teamsPage.expectTeamCount(team.name, 1);
    });
  });
});
