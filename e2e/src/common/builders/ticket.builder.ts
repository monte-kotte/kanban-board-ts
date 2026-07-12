import type { TicketModel, TicketState, TicketType } from '../models';
import { unique } from './unique';

/** Fluent builder for a {@link TicketModel}. A team name is required. */
export class TicketBuilder {
  private model: TicketModel = {
    teamName: '',
    type: 'feature',
    title: unique('Ticket'),
    body: 'Automated end-to-end test ticket body.',
  };

  withTeam(teamName: string): this {
    this.model.teamName = teamName;
    return this;
  }

  withEpic(epicTitle: string): this {
    this.model.epicTitle = epicTitle;
    return this;
  }

  withType(type: TicketType): this {
    this.model.type = type;
    return this;
  }

  withTitle(title: string): this {
    this.model.title = title;
    return this;
  }

  withBody(body: string): this {
    this.model.body = body;
    return this;
  }

  withState(state: TicketState): this {
    this.model.state = state;
    return this;
  }

  build(): TicketModel {
    return { ...this.model };
  }
}
