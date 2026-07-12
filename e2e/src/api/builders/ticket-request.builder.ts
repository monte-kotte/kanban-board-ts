import { TICKET_TYPE } from '../../common/models';
import type { CreateTicketRequest } from '../models';
import { unique } from '../../common/utils';

/** Builder for a {@link CreateTicketRequest}. A team id is required up front. */
export class TicketRequestBuilder {
  private model: CreateTicketRequest;

  constructor(teamId: string) {
    this.model = {
      teamId,
      type: TICKET_TYPE.FEATURE,
      title: unique('Ticket'),
      body: 'Automated API test ticket body.',
    };
  }

  withEpic(epicId: string): this {
    this.model.epicId = epicId;
    return this;
  }

  withType(type: CreateTicketRequest['type']): this {
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

  build(): CreateTicketRequest {
    return { ...this.model };
  }

  static bug(teamId: string): TicketRequestBuilder {
    return new TicketRequestBuilder(teamId).withType(TICKET_TYPE.BUG);
  }
}
