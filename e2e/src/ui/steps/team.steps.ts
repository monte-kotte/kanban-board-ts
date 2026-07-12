import type { LayoutPage, TeamsPage } from '../pages';
import type { TeamModel } from '../../common/models';

/** High-level team-management flows. */
export class TeamSteps {
  constructor(
    private readonly teamsPage: TeamsPage,
    private readonly layout: LayoutPage,
  ) {}

  /** Navigate to Teams, create a team, and confirm it appears in the list. */
  async createTeam(team: TeamModel): Promise<void> {
    await this.layout.goToTeams();
    await this.teamsPage.createTeam(team);
    await this.teamsPage.expectTeamVisible(team.name);
  }
}
