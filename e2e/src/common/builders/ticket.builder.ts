import { TICKET_TYPE } from '../models';
import type { TicketModel, TicketState, TicketType } from '../models';
import { unique } from '../utils';

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

  /** A bug ticket with every required field populated, nothing optional. */
  static bug(teamName: string): TicketBuilder {
    return new TicketBuilder().withTeam(teamName).withType(TICKET_TYPE.BUG);
  }

  /** A feature ticket with every required field populated, nothing optional. */
  static feature(teamName: string): TicketBuilder {
    return new TicketBuilder().withTeam(teamName).withType(TICKET_TYPE.FEATURE);
  }

  /** A fix ticket with every required field populated, nothing optional. */
  static fix(teamName: string): TicketBuilder {
    return new TicketBuilder().withTeam(teamName).withType(TICKET_TYPE.FIX);
  }

  /** A ticket with only its required fields set — no epic, no state override. */
  static requiredFieldsOnly(teamName: string): TicketBuilder {
    return new TicketBuilder().withTeam(teamName);
  }

  /** A ticket with its optional fields (epic) also populated. */
  static withOptionalFields(teamName: string, epicTitle: string): TicketBuilder {
    return new TicketBuilder().withTeam(teamName).withEpic(epicTitle);
  }
}
